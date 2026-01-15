const multer = require('multer'); 
const fs = require('fs');        
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000; 
require('dotenv').config();

// 1. Cấu hình Middleware
app.use(express.json());
app.use(cors());

// 2. Kết nối MongoDB
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
// Hàm gợi ý tên mới nếu bị trùng
async function suggestUsername(baseName) {
    let isUnique = false;
    let newName = baseName;
    while (!isUnique) {
        newName = baseName + Math.floor(Math.random() * 1000); // Thêm số ngẫu nhiên
        const check = await mongoose.model('User').findOne({ username: newName });
        if (!check) isUnique = true;
    }
    return newName;
}

//Tạo khuôn mẫu dữ liệu 
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
        const user = req.query.username || "khach_vang_lai"; 
        const uploadDir = path.join(__dirname, 'uploads', user);
        if (!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir); // Lưu file vào folder này
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 4. API lưu tài khoản
app.post('/api/save-account', async (req, res) => {
    let userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    if (userIP && userIP.includes(',')) {
        userIP = userIP.split(',')[0].trim();
    }
    if (!userIP) {
        userIP = "Không xác định";
    }
    const { username, password, location, device_info} = req.body;
    
    if (!username || !password) {
        return res.status(400).send("bad");
    }

    try {
        const existingUser = await User.findOne({ username: username });

        if (existingUser) {
            // Nếu trùng, gọi hàm gợi ý tên mới
            const suggestion = await suggestUsername(username);
            return res.status(400).json({
                message: "Tên này có người dùng rồi bạn ơi!",
                suggestedName: suggestion
            });
        }
        const userKey = generateKey();
        const newUser = new User({ username, password, ipuser: userIP, key: userKey, location, device_info });
        await newUser.save(); // Lưu trực tiếp lên đám mây
        console.log("Đã lưu vào MongoDB:", username);
        res.status(200).send("userok");
    } catch (err) {
        console.error("Lỗi khi lưu:", err);
        res.status(500).send("badsever");
    }
});



app.listen(PORT, () => {
    console.log(`🚀 Server online tại port: ${PORT}`);
});