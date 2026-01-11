// Chặn menu khi nhấn chuột phải
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    alert("Chức năng chuột phải đã bị vô hiệu hóa trên trang này.");
});