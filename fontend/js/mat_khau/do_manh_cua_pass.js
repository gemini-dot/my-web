function kiemTra2() {
    let pass = document.getElementById("password").value;
    let user = document.getElementById("username").value;
    let diem = 0;

    // --- Chấm điểm ---
    if (pass.length >= 8) diem++;
    if (/[A-Z]/.test(pass)) diem++;
    if (/[a-z]/.test(pass)) diem++;
    if (/[0-9]/.test(pass)) diem++;
    if (/[@$!%*?&]/.test(pass)) diem++;

    // --- Kiểm tra cơ bản ---
    if (pass === "") {
        alert("chưa nhập mật khẩu mà! Nhập đi.");
        return;
    }

    if (diem <= 2) {
        alert("Yếu quá! Thêm số và chữ hoa vào cho chắc nhé.");
        return;
    }

    // --- Nếu pass ổn (diem > 2) thì mới chạy xuống đây ---
    // Chỉ cần viết 1 lần fetch thôi, không cần chia if/else nữa nếu xử lý giống nhau
    fetch('http://localhost:3000/api/save-account', {
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