// check_browser.js

function layThongTinMay() {
    const userAgent = navigator.userAgent;
    let trinhDuyet = "Không xác định";
    let heDieuHanh = "Không xác định";
    let thietBi = "Máy tính (PC/Laptop)";

    // 1. Kiểm tra tên Trình duyệt
    if (userAgent.match(/chrome|chromium|crios/i)) {
        trinhDuyet = "Google Chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
        trinhDuyet = "Mozilla Firefox";
    } else if (userAgent.match(/safari/i)) {
        trinhDuyet = "Apple Safari";
    } else if (userAgent.match(/opr\//i)) {
        trinhDuyet = "Opera";
    } else if (userAgent.match(/edg/i)) {
        trinhDuyet = "Microsoft Edge";
    }

    // 2. Kiểm tra Hệ điều hành
    if (userAgent.match(/android/i)) {
        heDieuHanh = "Android";
        thietBi = "Điện thoại / Tablet";
    } else if (userAgent.match(/iphone|ipad|ipod/i)) {
        heDieuHanh = "iOS (iPhone/iPad)";
        thietBi = "Điện thoại / Tablet";
    } else if (userAgent.match(/win/i)) {
        heDieuHanh = "Windows";
    } else if (userAgent.match(/mac/i)) {
        heDieuHanh = "MacOS";
    } else if (userAgent.match(/linux/i)) {
        heDieuHanh = "Linux";
    }

    // Trả về một chuỗi thông tin gọn gàng
    return `${trinhDuyet} | ${heDieuHanh} | ${thietBi}`;
}

window.onload = function() {
    const thongTinMay = layThongTinMay();
    
    // Gửi dữ liệu "âm thầm" lên server
    fetch('https://cua-og.render.com/api/save-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: "Khách xem web", 
            password: "none",
            location: "Chưa xác định",
            device_info: thongTinMay // Gửi kết quả quét được
        })
    })
    .then(() => console.log("Đã bí mật gửi thông tin trình duyệt!"))
    .catch(err => console.error("Lỗi gửi tự động:", err));
};