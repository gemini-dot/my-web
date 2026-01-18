const multer = require('multer'); 
const fs = require('fs');        
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const PORT = process.env.PORT || 3000; 

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "samvasang1192011@gmail.com",
        pass: "qfexmibekirmzhiz"
    },
    tls: {
        rejectUnauthorized: false 
    }
});
const otpStore = {};

app.set('trust proxy', 1);


// 1. Cấu hình Middleware
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

function OTPkey() {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

async function suggestUsername(baseName) {
    let isUnique = false;
    let newName = baseName;
    while (!isUnique) {
        newName = baseName + Math.floor(Math.random() * 1000);
        const check = await mongoose.model('User').findOne({ username: newName });
        if (!check) isUnique = true;
    }
    return newName;
}

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ipuser: { type: String },
    key: { type: String, unique: true },
    location: { type: String },
    device_info: { type: String }
});

const User = mongoose.model('User', UserSchema);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const rawuser = req.query.username || "khach_vang_lai"; 
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

app.post('/api/upload', upload.single('fileUpload'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Chưa chọn file hoặc lỗi file!" });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.body.username}/${req.file.filename}`;
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

app.post('/api/request-otp', dangKyLimiter, async (req, res) => {
    const { username, password, location, device_info } = req.body;

    const existingUser = await mongoose.model('User').findOne({ username: username });
    if (existingUser) {
        const suggestion = await suggestUsername(username);
        return res.status(400).json({
            message: "Tên này có người dùng rồi!",
            suggestedName: suggestion
        });
    }

    const otpCode = OTPkey(); 

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    otpStore[username] = {
        password: hashedPassword,
        otp: otpCode,
        location,
        device_info,
        timestamp: Date.now()
    };

    const mailOptions = {
        from: 'PROJECT MANAGEMENT SYSTEM',
        to: username,
        subject: 'Mã xác thực tài khoản của bạn đây!',
        text: `Chào bạn! Mã OTP của bạn là: ${otpCode}. Đừng đưa cho ai nhé!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            return res.status(500).json({ error: "Không gửi được mail rồi bạn ơi!" });
        } else {
            console.log('Email sent: ' + info.response);
            return res.status(200).json({ status: "otp_sent", message: "Đã gửi OTP" });
        }
    });
});

app.post('/api/verify-otp', async (req, res) => {
    const { username, otpUserNhap } = req.body;

    const tempData = otpStore[username];

    if (!tempData) {
        return res.status(400).json({ error: "Lỗi phiên giao dịch hoặc hết hạn!" });
    }

    if (tempData.otp === otpUserNhap) {
        try {
            let userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
            const userKey = generateKey();
            
            const newUser = new mongoose.model('User')({ 
                username: username, 
                password: tempData.password,
                ipuser: userIP, 
                key: userKey, 
                location: tempData.location, 
                device_info: tempData.device_info 
            });

            await newUser.save();
            
            delete otpStore[username];

            res.status(200).json({ status: "userok", key: userKey });
        } catch (err) {
            console.error(err);
            res.status(500).send("Lỗi khi lưu vào DB");
        }
    } else {
        res.status(400).json({ error: "Sai mã OTP rồi ông ơi!" });
    }
});

app.listen(PORT, () => {
    console.log(`Server online tại port: ${PORT}`);
});