// upload-client.js - Thêm file này vào HTML của bạn

document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileUpload');
    const submitButton = uploadForm.querySelector('button[type="submit"]');

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Ngăn form submit theo cách thông thường

        // Kiểm tra xem đã chọn file chưa
        if (!fileInput.files || fileInput.files.length === 0) {
            showMessage('Vui lòng chọn file trước khi upload!', 'error');
            return;
        }

        const file = fileInput.files[0];

        // Kiểm tra file có phải HTML không
        if (!file.name.endsWith('.html')) {
            showMessage('Chỉ chấp nhận file HTML!', 'error');
            return;
        }

        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append('fileUpload', file);

        // Hiển thị trạng thái đang upload
        submitButton.disabled = true;
        submitButton.textContent = 'Đang upload...';

        try {
            // Gửi request đến server
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Upload thành công
                showMessage(data.message || 'Upload thành công!', 'success');
                
                console.log('URL file đã upload:', data.fileUrl);
                displayFileUrl(data.fileUrl, uploadForm);
                    
                // Reset form
                uploadForm.reset();
            } else {
                // Có lỗi từ server
                showMessage(data.error || 'Upload thất bại!', 'error');
            }
        } catch (error) {
            // Lỗi kết nối hoặc lỗi khác
            console.error('Lỗi upload:', error);
            showMessage('Không thể kết nối đến server! Kiểm tra xem server đã chạy chưa.', 'error');
        } finally {
            // Khôi phục lại button
            submitButton.disabled = false;
            submitButton.textContent = 'Upload';
        }
    });

    // Hàm hiển thị thông báo
    function showMessage(message, type) {
        // Xóa thông báo cũ nếu có
        const oldMessage = document.querySelector('.upload-message');
        if (oldMessage) {
            oldMessage.remove();
        }

        // Tạo thông báo mới
        const messageDiv = document.createElement('div');
        messageDiv.className = `upload-message ${type}`;
        messageDiv.textContent = message;
        
        // Thêm vào form
        uploadForm.appendChild(messageDiv);

        // Tự động xóa sau 5 giây
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    // Hàm hiển thị URL file đã upload
  // Hàm hiển thị URL file đã upload
    function displayFileUrl(url, targetForm) {
        // 1. Kiểm tra nếu không có form thì nghỉ khỏe
        if (!targetForm) return;

        
        const oldLink = document.querySelector('.file-url-container');
        if (oldLink) {
            oldLink.remove();
        }

        // 3. Tạo container chứa link và nút copy
        const linkContainer = document.createElement('div');
        linkContainer.className = 'file-url-container';
        
        // Tui dùng inline style một chút cho nó nổi bật nhé
        linkContainer.style.marginTop = '20px';
        linkContainer.style.padding = '10px';
        linkContainer.style.border = '1px dashed #ccc';

        linkContainer.innerHTML = `
            <p style="font-weight: bold; color: #2ecc71;">✓  file của bạn đã được tải lên sever</p>
            <div style="display: flex; gap: 10px; align-items: center;"></div>
        `;
        
        // 4. Thêm vào form (targetForm được truyền từ lúSc gọi hàm)
        targetForm.appendChild(linkContainer);
    }

    // Sửa lại hàm copy một chút để dùng cho mọi nút
    function copyToClipboard(text, btnElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = btnElement.textContent;
            btnElement.textContent = '✓ Đã lưu!';
            btnElement.style.backgroundColor = '#2ecc71';
            btnElement.style.color = 'white';
            
            setTimeout(() => {
                btnElement.textContent = originalText;
                btnElement.style.backgroundColor = '';
                btnElement.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Lỗi rồi ông giáo ạ:', err);
        });
    }
    // Hiển thị tên file khi chọn
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            console.log('Đã chọn file:', fileName);
        }
    });
});

// Hàm copy link vào clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✓ Đã copy!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Không thể copy:', err);
        alert('Không thể copy link. Vui lòng copy thủ công.');
    });
}