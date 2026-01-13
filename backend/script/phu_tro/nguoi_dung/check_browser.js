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
    console.log("Thông tin thiết bị:", trinhDuyet, heDieuHanh, thietBi);
    // Trả về một chuỗi thông tin gọn gàng
    return `${trinhDuyet} | ${heDieuHanh} | ${thietBi}`;
}

