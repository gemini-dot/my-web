const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000; // Để chạy được trên Render

app.use(express.json());
app.use(cors());

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log("[Server Kiểm tra] Đã kết nối MongoDB thành công!"))
    .catch(err => console.error("Lỗi kết nối:", err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === "samisadmin1192011" && password === "admin1192011") { //tiếp theo sẽ phát triển tính năng cấp quyền admin.
        return res.json({ status: "ADMIN_OK" });
    }

    try {
        const user = await User.findOne({username: username});

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if(isMatch){
                console.log("Đăng nhập khớp:", username);
                res.json({ status: "OK", userId: user.username });
            }else{
                console.log("Sai mật khẩu!");
                res.status(401).json({ status: "FAIL", message: "Sai thông tin!" });
            }
        } else {
            console.log("Không tìm thấy tài khoản!");
            res.status(401).json({ status: "FAIL", message: "Sai thông tin!" });
        }
    } catch (err) {
        res.status(500).send("Lỗi server");
    }
});

app.listen(PORT, () => console.log(`Server kiểm tra chạy tại: http://localhost:${PORT}`));