const multer = require('multer'); 
const fs = require('fs');        
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer'); // Thay Resend bằng Nodemailer
require('dotenv').config();

const PORT = process.env.PORT || 3000; 

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    })
});

app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(cors());

const dangKyLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: {
        error: "Bạn gửi nhanh quá! Đợi 15 phút sau rồi thử lại nhé."
    },
    standardHeaders: true, 
    legacyHeaders: false, 
});

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// ===== CẤU HÌNH NODEMAILER =====
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Verify Nodemailer khi khởi động
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Nodemailer connection failed:', error);
    } else {
        console.log('✅ Nodemailer is ready to send emails');
    }
});

// Schema lưu OTP tạm thời
const OTPSchema = new mongoose.Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Tự xóa sau 5 phút
});

const OTP = mongoose.model('OTP', OTPSchema);

// Schema cho user
const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipuser: { type: String },
    key: { type: String, unique: true },
    location: { type: String },
    device_info: { type: String }
});

const User = mongoose.model('User', UserSchema);

function generateKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Tạo OTP 4 số
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// ===== API GỬI OTP VỚI NODEMAILER =====
app.post('/api/send-otp', dangKyLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: "Email không được để trống!" });
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Email không hợp lệ!" });
    }

    try {
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ 
                status: 'email_exists',
                error: "Email này đã được đăng ký rồi!" 
            });
        }

        // Tạo mã OTP
        const otpCode = generateOTP();

        // Lưu OTP vào database
        await OTP.findOneAndUpdate(
            { email: email },
            { email: email, otp: otpCode },
            { upsert: true, new: true }
        );

        // Gửi email OTP qua Nodemailer
        const mailOptions = {
            from: `"OTP Service" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: '🔐 Mã OTP xác thực tài khoản',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <h2 style="color: white; text-align: center;">Xác thực tài khoản của bạn</h2>
                    <div style="background: white; padding: 30px; border-radius: 8px; text-align: center;">
                        <p style="font-size: 16px; color: #333;">Mã OTP của bạn là:</p>
                        <h1 style="color: #667eea; font-size: 48px; letter-spacing: 10px; margin: 20px 0;">${otpCode}</h1>
                        <p style="color: #666; font-size: 14px;">Mã này có hiệu lực trong <strong>5 phút</strong></p>
                        <p style="color: #999; font-size: 12px; margin-top: 20px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log('✅ Email OTP đã gửi đến:', email);

        res.status(200).json({ 
            status: 'otp_sent',
            message: 'Mã OTP đã được gửi đến email của bạn!' 
        });

    } catch (error) {
        console.error("❌ Lỗi gửi OTP:", error);
        res.status(500).json({ 
            status: 'server_error',
            error: "Lỗi khi gửi OTP! Vui lòng thử lại." 
        });
    }
});

// ===== API XÁC THỰC OTP =====
app.post('/api/verify-otp', async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ error: "Email và OTP không được để trống!" });
    }

    try {
        // Tìm OTP trong database
        const otpRecord = await OTP.findOne({ email: email });

        if (!otpRecord) {
            return res.status(400).json({ 
                status: 'otp_expired',
                error: "Mã OTP đã hết hạn hoặc không tồn tại!" 
            });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                status: 'otp_invalid',
                error: "Mã OTP không đúng!" 
            });
        }

        // OTP đúng -> Xóa OTP khỏi database
        await OTP.deleteOne({ email: email });

        res.status(200).json({ 
            status: 'otp_verified',
            message: 'Xác thực OTP thành công!' 
        });

    } catch (error) {
        console.error("❌ Lỗi xác thực OTP:", error);
        res.status(500).json({ error: "Lỗi khi xác thực OTP!" });
    }
});

// Middleware xác thực Firebase token
async function verifyFirebaseToken(req, res, next) {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
        return res.status(401).json({ error: "Không có token xác thực!" });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("❌ Lỗi xác thực token:", error);
        return res.status(401).json({ error: "Token không hợp lệ!" });
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rawuser = req.user?.email || "khach_vang_lai"; 
        const user = rawuser.replace(/[^a-z0-9]/gi, '_');
        const uploadDir = path.join(__dirname, 'uploads', user);
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|zip|html/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error("File này không được phép ông giáo ơi!"));
    }
});

app.post('/api/upload', verifyFirebaseToken, upload.single('fileUpload'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Chưa chọn file hoặc lỗi file!" });
        }
        const username = req.user.email.replace(/[^a-z0-9]/gi, '_');
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${username}/${req.file.filename}`;
        res.status(200).json({ 
            message: "Upload thành công vào kho riêng!", 
            fileUrl: fileUrl 
        });
        
    } catch (error) {
        console.error("❌ Lỗi server:", error);
        res.status(500).json({ error: "Lỗi Server rồi ông giáo ạ!" });
    }
});

app.get('/uploads/:user/:filename', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', req.params.user, req.params.filename);
    if (fs.existsSync(filePath)) {
        if (req.params.filename.endsWith('.html')) {
            res.setHeader('Content-Disposition', 'attachment; filename=' + req.params.filename);
        }
        res.sendFile(filePath);
    } else {
        res.status(404).send("Không tìm thấy file rồi!");
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API đăng ký user mới sau khi xác thực OTP
app.post('/api/register-user', verifyFirebaseToken, async (req, res) => {
    const { location, device_info } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;

    try {
        const existingUser = await User.findOne({ uid: uid });
        
        if (existingUser) {
            return res.status(200).json({
                status: "existing_user",
                key: existingUser.key,
                message: "User đã tồn tại"
            });
        }

        let userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
        const userKey = generateKey();
        
        const newUser = new User({ 
            uid: uid,
            email: email,
            ipuser: userIP, 
            key: userKey, 
            location: location, 
            device_info: device_info 
        });

        await newUser.save();

        res.status(200).json({ 
            status: "userok", 
            key: userKey 
        });

    } catch (err) {
        console.error("❌ Lỗi register:", err);
        res.status(500).json({ error: "Lỗi khi lưu vào DB" });
    }
});

// API lấy thông tin user
app.get('/api/user-info', verifyFirebaseToken, async (req, res) => {
    try {
        const user = await User.findOne({ uid: req.user.uid });
        
        if (!user) {
            return res.status(404).json({ error: "User không tồn tại" });
        }

        res.status(200).json({
            email: user.email,
            key: user.key,
            location: user.location,
            device_info: user.device_info,
            timestamp: user.timestamp
        });

    } catch (err) {
        console.error("❌ Lỗi get user info:", err);
        res.status(500).json({ error: "Lỗi khi lấy thông tin user" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server online tại port: ${PORT}`);
});