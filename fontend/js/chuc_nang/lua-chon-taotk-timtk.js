function openPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
    // Thêm hiệu ứng phóng to nhẹ
    setTimeout(() => {
        document.getElementById('popup').style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
}

function closePopup() {
    document.getElementById('popup').style.transform = 'translate(-50%, -50%) scale(0.9)';
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('popup').style.display = 'none';
    
}

window.onclick = function(event) {
    const overlay = document.getElementById('overlay');
    const popup = document.getElementById('popup');

    // Nếu người dùng bấm trúng cái overlay (vùng trống bên ngoài)
    if (event.target == overlay) {
        closePopup();
    }
}