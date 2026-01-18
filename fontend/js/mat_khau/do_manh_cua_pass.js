document.getElementById('dang-nhap2').addEventListener('click', kiemTra2);
function laEmailHopLe(email) {
    const khuonEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return khuonEmail.test(email);
}
let currentUsername = "";
function kiemTra2() {
    let pass = document.getElementById("password").value;
    let user = document.getElementById("username").value;
    let diem = 0;
    let userElement = document.getElementById("username");
    let passElement = document.getElementById("password");
    userElement.classList.remove("hieu-ung-sai");
    passElement.classList.remove("hieu-ung-sai");
    void userElement.offsetWidth; 

    // --- Chấm điểm ---
    if (pass.length >= 8) diem++;
    if (/[A-Z]/.test(pass)) diem++;
    if (/[a-z]/.test(pass)) diem++;
    if (/[0-9]/.test(pass)) diem++;
    if (/[@$!%*?&]/.test(pass)) diem++;

    // --- Kiểm tra cơ bản ---
    if (pass === "" || user === "") {
        alert("chưa nhập mật khẩu hoặc tên người dùng mà! Nhập đi.");
        userElement.classList.add("hieu-ung-sai");
        passElement.classList.add("hieu-ung-sai");
        return;
    }

    if (!laEmailHopLe(user)) {
        alert("Ông giáo ơi, nhập đúng định dạng Email (ví dụ: abc@gmail.com) nhé!");
        userElement.classList.add("hieu-ung-sai");
        return; // Dừng luôn, không cho chạy tiếp xuống dưới
    }

    if (diem <= 2) {
        alert("Yếu quá! Thêm số và chữ hoa vào cho chắc nhé.");
        passElement.classList.add("hieu-ung-sai");
        return;
    }

    fetch('https://my-web-backend-sever2.onrender.com/api/request-otp', { // Đổi đường dẫn API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.suggestedName) {
                alert(`Tên trùng! Thử tên này: ${errorData.suggestedName}`);
            } else {
                alert("Lỗi gửi mail: " + (errorData.error || "Không rõ"));
            }
            throw new Error('Lỗi request');
        }
        return response.json();
    })
    .then(data => {
        if(data.status === "otp_sent") {
            // Gửi thành công -> Hiện Popup OTP
            document.getElementById("otpPopup").style.display = "flex"; // Hiển thị popup
            currentUsername = user; // Lưu lại user để tí nữa xác thực
            alert("Đã gửi mã OTP vào email, ông check đi!");
        }
    })
    .catch(error => console.error('Lỗi:', error));
}

// 2. XỬ LÝ KHI BẤM NÚT "XÁC NHẬN" TRÊN POPUP OTP
// Ông nhớ thêm đoạn này vào file js nhé, hoặc ném vào thẻ <script> cuối body cũng được
document.querySelector(".btn-verify").addEventListener("click", function() {
        // Lấy 4 số từ 4 ô input gộp lại
        let otpInputs = document.querySelectorAll(".otp-field");
        let otpCode = "";
        otpInputs.forEach(input => otpCode += input.value);

        if (otpCode.length < 4) {
            alert("Nhập đủ 4 số đi ông ơi!");
            return;
        }

        // Gửi OTP lên server kiểm tra
        fetch('https://my-web-backend-sever2.onrender.com/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUsername, otpUserNhap: otpCode })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === "userok") {
                // Thành công! Ẩn popup OTP, hiện popup Key
                document.getElementById("otpPopup").style.display = "none";
                
                // Logic hiện popup thành công cũ của ông
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
                alert(data.error || "Sai mã rồi!");
            }
        })
        .catch(err => alert("Lỗi kết nối!", err));
});
