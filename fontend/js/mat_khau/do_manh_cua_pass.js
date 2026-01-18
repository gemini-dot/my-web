// Cấu hình Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyAQ7rbtGyOUgcv7N_YnF3ocQjcdAON7f5M",
    authDomain: "my-web-otp.firebaseapp.com",
    projectId: "my-web-otp",
    storageBucket: "my-web-otp.firebasestorage.app",
    messagingSenderId: "173434076942",
    appId: "1:173434076942:web:4ca3127cae7f9e8beb615f",
    measurementId: "G-JSPD39CD8H"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Biến lưu trữ tạm
let tempUserData = {
    email: '',
    password: '',
    otpCode: '',
    idToken: ''
};

// Kiểm tra email hợp lệ
function laEmailHopLe(email) {
    const khuonEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return khuonEmail.test(email);
}

// Kiểm tra độ mạnh mật khẩu
function kiemTraMatKhau(pass) {
    let diem = 0;
    if (pass.length >= 8) diem++;
    if (/[A-Z]/.test(pass)) diem++;
    if (/[a-z]/.test(pass)) diem++;
    if (/[0-9]/.test(pass)) diem++;
    if (/[@$!%*?&]/.test(pass)) diem++;
    return diem;
}

// ĐĂNG KÝ TÀI KHOẢN MỚI
document.getElementById('dang-nhap2').addEventListener('click', async function() {
    let pass = document.getElementById("password").value;
    let email = document.getElementById("username").value;
    let userElement = document.getElementById("username");
    let passElement = document.getElementById("password");
    
    userElement.classList.remove("hieu-ung-sai");
    passElement.classList.remove("hieu-ung-sai");

    // Kiểm tra cơ bản
    if (pass === "" || email === "") {
        alert("Chưa nhập mật khẩu hoặc email mà! Nhập đi.");
        userElement.classList.add("hieu-ung-sai");
        passElement.classList.add("hieu-ung-sai");
        return;
    }

    if (!laEmailHopLe(email)) {
        alert("Ông giáo ơi, nhập đúng định dạng Email (ví dụ: abc@gmail.com) nhé!");
        userElement.classList.add("hieu-ung-sai");
        return;
    }

    const diemMatKhau = kiemTraMatKhau(pass);
    if (diemMatKhau <= 2) {
        alert("Yếu quá! Thêm số và chữ hoa vào cho chắc nhé.");
        passElement.classList.add("hieu-ung-sai");
        return;
    }

    try {
        // Lưu thông tin tạm
        tempUserData.email = email;
        tempUserData.password = pass;

        // Gửi yêu cầu tạo OTP đến backend
        const response = await fetch('https://my-web-backend-sever2.onrender.com/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (data.status === 'otp_sent') {
            // Hiển thị popup OTP
            document.getElementById("otpPopup").style.display = "flex";
            alert("Mã OTP đã được gửi đến email của bạn!");
            
            // Focus vào ô OTP đầu tiên
            document.querySelector('.otp-field').focus();
        } else {
            alert(data.message || "Lỗi khi gửi OTP!");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối đến server!");
        userElement.classList.add("hieu-ung-sai");
        passElement.classList.add("hieu-ung-sai");
    }
});

// XỬ LÝ NHẬP OTP - Tự động chuyển ô
const otpFields = document.querySelectorAll('.otp-field');
otpFields.forEach((field, index) => {
    field.addEventListener('input', (e) => {
        if (e.target.value.length === 1 && index < otpFields.length - 1) {
            otpFields[index + 1].focus();
        }
    });

    field.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            otpFields[index - 1].focus();
        }
    });

    // Chỉ cho phép nhập số
    field.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
        }
    });
});

// XÁC NHẬN OTP
document.querySelector('.btn-verify').addEventListener('click', async function() {
    // Lấy mã OTP từ 4 ô input
    let otpCode = '';
    otpFields.forEach(field => {
        otpCode += field.value;
    });

    if (otpCode.length !== 4) {
        alert("Vui lòng nhập đủ 4 số OTP!");
        return;
    }

    try {
        // Xác thực OTP với backend
        const response = await fetch('https://my-web-backend-sever2.onrender.com/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: tempUserData.email,
                otp: otpCode 
            })
        });

        const data = await response.json();

        if (data.status === 'otp_verified') {
            // OTP đúng -> Tạo tài khoản Firebase
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                tempUserData.email, 
                tempUserData.password
            );
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            // Đăng ký user vào database
            await registerUserToDatabase(idToken);

            // Đóng popup OTP
            document.getElementById("otpPopup").style.display = "none";

        } else {
            alert("Mã OTP không đúng! Vui lòng thử lại.");
            // Clear các ô OTP
            otpFields.forEach(field => field.value = '');
            otpFields[0].focus();
        }

    } catch (error) {
        console.error("Lỗi xác thực OTP:", error);
        
        if (error.code === 'auth/email-already-in-use') {
            alert("Email này đã được sử dụng rồi!");
        } else {
            alert("Lỗi: " + error.message);
        }
    }
});

// Đăng ký user vào database sau khi xác thực OTP
async function registerUserToDatabase(idToken) {
    try {
        const response = await fetch('https://my-web-backend-sever2.onrender.com/api/register-user', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ 
                location: "Vietnam",
                device_info: navigator.userAgent 
            })
        });

        const data = await response.json();

        if (data.status === "userok" || data.status === "existing_user") {
            // Hiển thị popup thành công với key
            const overlay = document.getElementById("overlay");
            const popup = document.querySelector(".pop-up");
            const keyDisplay = document.getElementById("show-key");
            
            if (keyDisplay) keyDisplay.innerText = data.key;
            
            popup.style.display = "block";
            overlay.style.display = "block";

            setTimeout(() => {
                popup.style.display = "none";
                location.reload();
            }, 5000);
        } else {
            alert("Lỗi đăng ký vào hệ thống!");
        }

    } catch (error) {
        console.error("Lỗi:", error);
        alert("Lỗi kết nối đến server!");
    }
}
