const oTen = document.querySelectorAll('.o-dang-nhap')[0];
const oMatKhau = document.querySelectorAll('.o-dang-nhap')[1];
const progressBar = document.getElementById('progress-bar');
const dots = document.querySelectorAll('.dot');

function updateProgress() {
    let progress = 0;
    if (oTen.value.length === 0 && oMatKhau.value.length === 0) {
        progress = 0;
        dots[1].classList.remove('active');
        dots[2].classList.remove('active');
    }
    
    if (oTen.value.length > 0 || oMatKhau.value.length > 0) {
        progress = 50; // 1/2
        dots[0].classList.add('active');
        dots[1].classList.add('active');
    } else {
        dots[1].classList.remove('active');
    }
    if (oMatKhau.value.length > 0 && oTen.value.length > 0) {
        progress = 90; // 1
        dots[2].classList.add('active');
    } else {
        dots[2].classList.remove('active');
    }
    progressBar.style.height = progress + '%'; 
}
oTen.addEventListener('input', updateProgress);
oMatKhau.addEventListener('input', updateProgress);