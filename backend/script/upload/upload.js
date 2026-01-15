require('dotenv').config(); // Phải có dòng này để đọc file .env
const express = require('express');
const cors = require('cors'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config();
const app = express();

// 1. Cho phép server chính gọi vào server upload
app.use(cors({
    origin: 'https://my-web-ag2.pages.dev',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.static('public'));

// 3. Cấu hình nơi lưu trữ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Lấy userId và dọn dẹp ký tự lạ (như %S)
    const rawUserId = req.query.userId || 'guest';
    const cleanUserId = rawUserId.replace(/[^a-zA-Z0-9]/g, ''); // Chỉ giữ lại chữ và số

    // 2. Dọn dẹp tên file: Bỏ đuôi .html và thay khoảng trắng/ngoặc bằng dấu gạch dưới
    const cleanFileName = file.originalname
      .split('.')[0]              
      .replace(/\s+/g, '_')       
      .replace(/[^a-zA-Z0-9_]/g, '');

    return {
      folder: `user_uploads/${cleanUserId}`,
      resource_type: 'raw',
      public_id: cleanFileName
    };
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(html)$/)) {
      return cb(new Error('Chỉ được upload file HTML thôi ông giáo ạ!'), false);
    }
    cb(null, true);
  }
});

app.post('/api/upload', (req, res) => {
  upload.single('fileUpload')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: "Lỗi Multer: " + err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: "Ông chưa chọn file mà!" });
    }

    res.json({ 
      message: "Ngon lành! Upload xong rồi nhé!",
      fileUrl: req.file.path
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server upload đang chạy ở cổng ${PORT}!`));