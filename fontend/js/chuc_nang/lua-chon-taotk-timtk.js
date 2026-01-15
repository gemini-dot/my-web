function openPopup() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('popup').style.display = 'block';
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
    if (event.target == overlay) {
        closePopup();
    }
}