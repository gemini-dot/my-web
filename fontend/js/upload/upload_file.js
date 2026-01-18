document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileUpload');
    const submitButton = uploadForm.querySelector('button[type="submit"]');
    //kiểm tra đăng nhập
    const currentUser = localStorage.getItem("currentUser")?.trim();
    if (!currentUser) {
        alert("Ê chưa đăng nhập mà đòi upload hả? Quay lại đăng nhập đi!");
        window.location.href = '../../view/group_mat_khau/login.html';
        return;
    }
    console.log("Đang upload với tư cách:", currentUser);
    

    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!fileInput.files || fileInput.files.length === 0) {
            showMessage('Vui lòng chọn file trước khi upload!', 'error');
            return;
        }
        const file = fileInput.files[0];
        const allowedExtensions = ['.html', '.css', '.pptx', '.txt', '.png'];
        const fileName = file.name.toLowerCase();
        const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));
        // Kiểm tra file html
        if (isAllowed) {
            showMessage('Ò, file của bạn chưa được hỗ trợ rồi.', 'error');
            return;
        }

        // Tạo FormData để gửi file
        const formData = new FormData();
        formData.append('fileUpload', file);
        formData.append('username', currentUser);

        // Hiển thị trạng thái đang upload
        submitButton.disabled = true;
        submitButton.textContent = 'Đang upload...';

        try {
            // Gửi request đến server
            const response = await fetch(`https://my-web-backend-sever3.onrender.com/api/upload?userId=${currentUser}`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                // Upload thành công
                showMessage(data.message || 'Upload thành công!', 'success');
                console.log('URL file đã upload:', data.fileUrl);
                
                uploadForm.reset();
            } else {
                showMessage(data.error || 'Upload thất bại!', 'error');
            }
        } catch (error) {
            console.error('Lỗi upload:', error);
            showMessage('Không thể kết nối đến server! Kiểm tra xem server đã chạy chưa.', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Upload';
        }
    });

    // Hàm hiển thị thông báo
    function showMessage(message, type) {
        const oldMessage = document.querySelector('.upload-message');
        if (oldMessage) {
            oldMessage.remove();
        }
        const messageDiv = document.createElement('div');
        messageDiv.className = `upload-message ${type}`;
        messageDiv.textContent = message;
        uploadForm.appendChild(messageDiv);
        // Tự động xóa sau 5 giây
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => messageDiv.remove(), 300);
        }, 5000);
    }

    function displayFileUrl(url, targetForm) {
        if (!targetForm) return;
        const oldLink = document.querySelector('.file-url-container');
        if (oldLink) {
            oldLink.remove();
        }
        const linkContainer = document.createElement('div');
        linkContainer.className = 'file-url-container';
        linkContainer.style.marginTop = '20px';
        linkContainer.style.padding = '10px';
        linkContainer.style.border = '1px dashed #ccc';

        linkContainer.innerHTML = `
            <p style="font-weight: bold; color: #2ecc71;">✓ file của bạn đã được tải lên sever</p>
            <div style="display: flex; gap: 10px; align-items: center;"></div>
        `;
        targetForm.appendChild(linkContainer);
    }
    // Hiển thị tên file khi chọn
    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            console.log('Đã chọn file:', fileName);
        }
    });
});
