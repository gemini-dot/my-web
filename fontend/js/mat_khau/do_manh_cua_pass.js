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

    fetch('https://my-web-backend-sever2.onrender.com/api/save-account', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: user, password: pass })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            if (errorData.suggestedName) {
                alert(`Tên này có người dùng rồi bạn ơi! Thử tên này xem: ${errorData.suggestedName}`);
                userElement.classList.add("hieu-ung-sai");
            } else {
                alert("Có lỗi gì đó xảy ra rồi!");
            }
            throw new Error('Trùng tên hoặc lỗi input');
        }
        return response.json();
    })
    .then(data => {
        if(data.status === "userok") {
            const overlay = document.getElementById("overlay");
            const popup = document.querySelector(".pop-up");
            const keyDisplay = document.getElementById("show-key");
            if (keyDisplay) {
                keyDisplay.innerText = data.key; // Lấy key từ server đổ vào giao diện
            }
            popup.style.display = "block";
            overlay.style.display = "block";
            console.log("ok!")
            setTimeout(() => {
                popup.style.display = "none";
                location.reload();
            }, 5000);
        }
    })
        .catch(error => {
            console.error('Lỗi:', error);
            if (error.message !== 'Trùng tên hoặc lỗi input') {
                alert("Lỗi kết nối tới server rồi ông ơi!");
            }
        });
}