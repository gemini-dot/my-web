//Gửi người anh em Lập trình:
//Lúc tui viết đống code này,
//chỉ có Chúa với tui là hiểu nó chạy kiểu gì.
//Giờ thì ... xin chia buồn,
//chỉ còn mỗi Chúa hiểu thôi.
//
//Nên nếu bro đang cố tối ưu
//cái mớ này và nó toang (99% Là vậy),
//thì làm ơn tăng cái biến đếm này Lên
//để người xui xẻo tiếp theo còn biết đường chạy:
//
//total_hours_wasted_here = 0 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000; // Để chạy được trên Render
require('dotenv').config();

// 1. Cấu hình Middleware
app.use(express.json());
app.use(cors());

// 2. Kết nối MongoDB
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));
// Hàm tạo một chuỗi key ngẫu nhiên dài 16 ký tự
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
                message: "Tên này có người dùng rồi og ơi!",
                suggestedName: suggestion
            });
        }
        const userKey = generateKey();
        const newUser = new User({ username, password, ipuser: userIP, key: userKey, location, device_info });
        await newUser.save(); // Lưu trực tiếp lên đám mây
        console.log("💾 Đã lưu vào MongoDB:", username);
        res.status(200).send("userok");
    } catch (err) {
        console.error("❌ Lỗi khi lưu:", err);
        res.status(500).send("badsever");
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server online tại port: ${PORT}`);
});