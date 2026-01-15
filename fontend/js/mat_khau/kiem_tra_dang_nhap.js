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
        const response = await fetch('https://my-web-backend-sever.onrender.com/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json(); // data lúc này là { status: "OK", userId: "..." }

        if (response.ok) {
            // SỬA Ở ĐÂY: Phải chọc vào thuộc tính .status của cái hộp data
            if (data.status === "ADMIN_OK") { 
                alert("Chào Sếp! Đang vào trang Admin...");
                window.location.href = '../../view/admin_dashboard/admindashboard.html';
            } 
            else if (data.status === "OK") { // SỬA Ở ĐÂY LUÔN
                alert("Đăng nhập thành công!");
                // data.userId là chuẩn rồi vì server gửi về có userId
                localStorage.setItem("currentUser", data.userId); 
                window.location.href = '../../view/group_mainweb/upload.html';
            }
        } else {
            userElement.classList.add("hieu-ung-sai");
            passElement.classList.add("hieu-ung-sai");
            alert("Sai tài khoản hoặc mật khẩu rồi bạn ơi!");
        }

    } catch (error) {
        console.error("Lỗi kết nối server:", error);
        alert("Không kết nối được với Server!");
    }
}
