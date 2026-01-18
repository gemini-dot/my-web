const fields = document.querySelectorAll('.otp-field');
fields.forEach((field, index) => {
    // 1. Xử lý khi nhấn phím (để bắt phím Backspace)
    field.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            // Nếu ô hiện tại đang trống và không phải ô đầu tiên
            if (!field.value && index > 0) {
                fields[index - 1].focus(); // Lùi về ô trước
            }
        }
    });

    // 2. Xử lý khi nhập dữ liệu (giữ nguyên logic tiến lên)
    field.addEventListener('input', (e) => {
        const val = e.target.value;
        // Nếu có nhập giá trị và chưa phải ô cuối cùng
        if (val && index < fields.length - 1) {
            fields[index + 1].focus(); // Tiến tới ô tiếp theo
        }
    });
});