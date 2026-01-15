require('dotenv').config(); // Phải có dòng này để đọc file .env
const express = require('express');
const cors = require('cors'); 
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config();
const app = express();

// 1. Cho phép server chính của ông gọi vào server này
app.use(cors({
    origin: 'https://my-web-ag2.pages.dev', // Link trang web frontend của ông
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.static('public'));

// 2. Không cần config lẻ tẻ nữa, Cloudinary tự tìm CLOUDINARY_URL trong .env
// Nó sẽ tự động kết nối bằng cái link dài ngoằng ông vừa hỏi đó.

// 3. Cấu hình nơi lưu trữ
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 1. Lấy userId và dọn dẹp ký tự lạ (như %S)
    const rawUserId = req.query.userId || 'guest';
    const cleanUserId = rawUserId.replace(/[^a-zA-Z0-9]/g, ''); // Chỉ giữ lại chữ và số

    // 2. Dọn dẹp tên file: Bỏ đuôi .html và thay khoảng trắng/ngoặc bằng dấu gạch dưới
    const cleanFileName = file.originalname
      .split('.')[0]               // Bỏ đuôi .html
      .replace(/\s+/g, '_')        // Thay khoảng trắng thành _
      .replace(/[^a-zA-Z0-9_]/g, ''); // Bỏ hết ký tự đặc biệt như ( )

    return {
      folder: `user_uploads/${cleanUserId}`,
      resource_type: 'raw',
      public_id: cleanFileName // Tên file bây giờ đã "sạch"
    };
  },
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Kiểm tra đuôi file ở server cho chắc ăn
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
      fileUrl: req.file.path // Đổi tên từ imageUrl sang fileUrl cho đúng bản chất
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server upload đang chạy ở cổng ${PORT}!`));