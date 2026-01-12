const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

// 1. Phải dùng chung link và chung kho 'myDatabase'
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("✅ [Server Kiểm tra] Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối:", err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    key: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

app.post('/api/login', async (req, res) => {
    const { username, password, keyInput } = req.body;

    if (username === "samisadmin1192011" && password === "admin1192011") {
        return res.send("ADMIN_OK");
    }

    try {
        // ĐÂY NÈ OG: Lệnh lấy thông tin từ kho
        const user = await User.findOne({ username: username, password: password, key: keyInput });

        if (user) {
            console.log("🔓 Đăng nhập khớp:", username);
            res.send("OK"); 
        } else {
            console.log("🚫 Không tìm thấy tài khoản!");
            res.status(401).send("Sai thông tin!");
        }
    } catch (err) {
        res.status(500).send("Lỗi server");
    }
});

app.listen(PORT, () => console.log(`🔍 Server kiểm tra chạy tại: http://localhost:${PORT}`));