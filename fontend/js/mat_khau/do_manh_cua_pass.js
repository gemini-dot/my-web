// Cấu hình Firebase (lấy từ Firebase Console)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
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
        // Tạo tài khoản với Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        // Gửi email xác thực
        await sendEmailVerification(user);
        alert("Đã tạo tài khoản! Vui lòng check email để xác thực.");

        // Hiển thị popup yêu cầu xác thực email
        document.getElementById("otpPopup").style.display = "flex";
        
        // Đợi user xác thực email
        checkEmailVerification(user);

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        
        if (error.code === 'auth/email-already-in-use') {
            alert("Email này đã được sử dụng rồi!");
        } else if (error.code === 'auth/weak-password') {
            alert("Mật khẩu quá yếu!");
        } else {
            alert("Lỗi đăng ký: " + error.message);
        }
        
        userElement.classList.add("hieu-ung-sai");
        passElement.classList.add("hieu-ung-sai");
    }
});

// Kiểm tra email đã được xác thực chưa
function checkEmailVerification(user) {
    const checkInterval = setInterval(async () => {
        await user.reload();
        
        if (user.emailVerified) {
            clearInterval(checkInterval);
            
            // Email đã xác thực -> đăng ký user vào database
            const idToken = await user.getIdToken();
            await registerUserToDatabase(idToken);
            
            document.getElementById("otpPopup").style.display = "none";
        }
    }, 3000); // Check mỗi 3 giây
}

// Đăng ký user vào database sau khi xác thực email
async function registerUserToDatabase(idToken) {
    try {
        const response = await fetch('https://my-web-backend-sever2.onrender.com/api/register-user', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ 
                location: "Vietnam", // Có thể lấy từ geolocation
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

// ĐĂNG NHẬP
document.getElementById('btn-dang-nhap').addEventListener('click', async function() {
    let email = document.getElementById("login-username").value;
    let pass = document.getElementById("login-password").value;

    if (!email || !pass) {
        alert("Nhập đủ thông tin đi ông!");
        return;
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;

        if (!user.emailVerified) {
            alert("Email chưa được xác thực! Check email đi.");
            return;
        }

        const idToken = await user.getIdToken();
        
        // Lấy thông tin user từ database
        const response = await fetch('https://my-web-backend-sever2.onrender.com/api/user-info', {
            headers: { 
                'Authorization': `Bearer ${idToken}`
            }
        });

        const userData = await response.json();
        
        alert("Đăng nhập thành công! Key: " + userData.key);
        // Redirect hoặc load trang chính
        
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        
        if (error.code === 'auth/user-not-found') {
            alert("Email không tồn tại!");
        } else if (error.code === 'auth/wrong-password') {
            alert("Sai mật khẩu rồi!");
        } else {
            alert("Lỗi đăng nhập: " + error.message);
        }
    }
});

// Theo dõi trạng thái đăng nhập
onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
        console.log("User đã đăng nhập:", user.email);
        // Có thể tự động load thông tin user
    } else {
        console.log("Chưa đăng nhập hoặc chưa xác thực email");
    }
});