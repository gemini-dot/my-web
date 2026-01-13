function layViTri() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var lon = position.coords.longitude;
            console.log("Vị trí của bạn là: Vĩ độ " + lat + ", Kinh độ " + lon);
        }, function(error) {
            console.error("Lỗi lấy vị trí:", error);
        });
    } else {
        console.log("Trình duyệt không hỗ trợ Geolocation.");
    }
}