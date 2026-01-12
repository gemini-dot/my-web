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

    if (diem <= 2) {
        alert("Yếu quá! Thêm số và chữ hoa vào cho chắc nhé.");
        passElement.classList.add("hieu-ung-sai");
        return;
    }

    // --- Nếu pass ổn (diem > 2) thì mới chạy xuống đây ---
    // Chỉ cần viết 1 lần fetch thôi, không cần chia if/else nữa nếu xử lý giống nhau
    fetch('https://my-web-backend-sever2.onrender.com/api/save-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(response => response.text())
    .then(data => {
        alert(data); 
        
        // Hiện Popup sau khi server đã nhận được hàng
        const popup = document.querySelector(".pop-up");
        popup.style.display = "block";

        // Sau 3 giây thì mới reload hoặc chuyển trang
        setTimeout(() => {
            popup.style.display = "none";
            location.reload(); // Đưa reload vào đây để chờ popup hiện xong
        }, 3000);
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert("Lỗi kết nối tới server rồi ông ơi!");
    });
}