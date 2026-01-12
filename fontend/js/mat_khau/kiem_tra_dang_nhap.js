async function kiemTra() {
    let user = document.getElementById("username").value.trim();
    let pass = document.getElementById("password").value.trim();
    let userElement = document.getElementById("username");
    let passElement = document.getElementById("password");

    userElement.classList.remove("hieu-ung-sai");
    passElement.classList.remove("hieu-ung-sai");
    void userElement.offsetWidth; 
    if (!user || !pass) {
        if (!user) userElement.classList.add("hieu-ung-sai");
        if (!pass) passElement.classList.add("hieu-ung-sai");
        return;
    }
    try {
        // Gọi thẳng đến server cổng 5000 - nơi xử lý cả Admin và User
        const response = await fetch('https://my-web-backend-sever.onrender.com/api/login', { // Đổi save-account thành login
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.text();

        if (response.ok) {
            if (data === "ADMIN_OK") {
                alert("Chào Sếp! Đang vào trang Admin... 👑");
                window.location.href = '../../view/admin_dashboard/admindashboard.html';
            } else if (data === "OK") {
                alert("Đăng nhập thành công!");
                window.location.href = '../../view/project/nhom_SNKT/index.html';
            }
        } else {
            userElement.classList.add("hieu-ung-sai");
            passElement.classList.add("hieu-ung-sai");
            alert("Sai tài khoản hoặc mật khẩu rồi og ơi!");
        }

    } catch (error) {
        console.error("Lỗi kết nối server:", error);
        alert("Không kết nối được với Server!");
    }
}
