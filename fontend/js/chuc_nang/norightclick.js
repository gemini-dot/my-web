// Chặn menu khi nhấn chuột phải
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    console.log("Chuột phải bị vô hiệu hóa trên trang này.");
});