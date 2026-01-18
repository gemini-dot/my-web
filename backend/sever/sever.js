const multer = require('multer'); 
const fs = require('fs');        
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
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
    .then(() => console.log("Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("Lỗi kết nối MongoDB:", err));

function generateKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Schema cho user - lưu thông tin bổ sung
const UserSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    email: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipuser: { type: String },
    key: { type: String, unique: true },
    location: { type: String },
    device_info: { type: String }
});

const User = mongoose.model('User', UserSchema);

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
        console.error("Lỗi xác thực token:", error);
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

// Upload file - cần xác thực
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
        console.error("Lỗi server:", error);
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

// API đăng ký user mới sau khi Firebase Authentication thành công
app.post('/api/register-user', verifyFirebaseToken, dangKyLimiter, async (req, res) => {
    const { location, device_info } = req.body;
    const uid = req.user.uid;
    const email = req.user.email;

    try {
        // Kiểm tra user đã tồn tại chưa
        const existingUser = await User.findOne({ uid: uid });
        
        if (existingUser) {
            return res.status(200).json({
                status: "existing_user",
                key: existingUser.key,
                message: "User đã tồn tại"
            });
        }

        // Tạo user mới
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
        console.error(err);
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
        console.error(err);
        res.status(500).json({ error: "Lỗi khi lấy thông tin user" });
    }
});

app.listen(PORT, () => {
    console.log(`Server online tại port: ${PORT}`);
});