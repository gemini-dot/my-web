function dangKy() {
    // Kiểm tra xem trình duyệt có hỗ trợ định vị không
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            
            // SỬA LẠI ID CHO ĐÚNG VỚI HTML (username, password)
            const usernameInput = document.getElementById('username'); 
            const passwordInput = document.getElementById('password');

            // Đề phòng trường hợp không tìm thấy thẻ input thì return luôn để tránh lỗi
            if (!usernameInput || !passwordInput) {
                console.error("Không tìm thấy ô nhập liệu!");
                return;
            }

            const data = {
                username: usernameInput.value,
                password: passwordInput.value,
                // Lấy tọa độ
                location: position.coords.latitude + "," + position.coords.longitude 
            };
            
            // Log ra xem thử dữ liệu trước khi gửi (F12 để xem)
            console.log("Dữ liệu chuẩn bị gửi:", data);

            // Gửi dữ liệu về server
            fetch('https://cua-og.render.com/api/save-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            .then(response => {
                if(response.ok) console.log("Gửi thành công!");
                else console.log("Gửi thất bại!");
            })
            .catch(error => console.error("Lỗi mạng:", error));
        }, function(error) {
            // Xử lý nếu người dùng bấm "Block" (Chặn) không cho lấy vị trí
            console.warn("Người dùng không cho lấy vị trí hoặc lỗi GPS:", error);
            // Vẫn cho đăng ký nhưng location để trống hoặc ghi chú
            dangKyKhongViTri(); 
        });
    } else {
        console.log("Trình duyệt không hỗ trợ Geolocation.");
    }
}

// Hàm phụ: Đăng ký khi không lấy được vị trí (Optional)
function dangKyKhongViTri() {
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        location: "Không cho phép / Không xác định"
    };
    fetch('https://cua-og.render.com/api/save-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}