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
// --- Nếu pass ổn (diem > 2) thì mới chạy xuống đây ---
    fetch('https://my-web-backend-sever2.onrender.com/api/save-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(async response => {
        // Kiểm tra nếu server báo lỗi (status 400 là trùng tên hoặc thiếu data)
        if (!response.ok) {
            const errorData = await response.json(); // Lấy dữ liệu JSON từ server
            if (errorData.suggestedName) {
                // Đây là chỗ hiện pop-up khác nè! 
                // Tui dùng tạm alert, ông có thể thay bằng hiện 1 cái div pop-up riêng nhé.
                alert(`Tên này có người dùng rồi ông ơi! Thử tên này xem: ${errorData.suggestedName}`);
                userElement.classList.add("hieu-ung-sai");
            } else {
                alert("Có lỗi gì đó xảy ra rồi!");
            }
            throw new Error('Trùng tên hoặc lỗi input'); // Dừng không chạy tiếp xuống dưới
        }
        return response.text(); // Nếu ok (200) thì đi tiếp
    })
    .then(data => {
        // data ở đây chính là chữ "userok" từ server
        if(data === "userok") {
            // Hiện Popup thành công
            const popup = document.querySelector(".pop-up");
            popup.style.display = "block";

            // Sau 3 giây thì mới reload
            setTimeout(() => {
                popup.style.display = "none";
                location.reload();
            }, 3000);
        }
    })
        .catch(error => {
            console.error('Lỗi:', error);
            // Nếu không phải lỗi trùng tên (đã xử lý ở trên) thì mới báo lỗi kết nối
            if (error.message !== 'Trùng tên hoặc lỗi input') {
                alert("Lỗi kết nối tới server rồi ông ơi!");
            }
        });
}