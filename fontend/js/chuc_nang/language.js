window.onload = function() {
 
    const urlParams = new URLSearchParams(window.location.search);
    const ngonNgu = urlParams.get('hl');

    const tatCaOnhap = document.querySelectorAll('.o-dang-nhap');
    const nutDangNhap = document.querySelector('.nut-bam');
    const nutQuenMK = document.querySelector('.quen-mat-khau');

    if (ngonNgu === 'en') {
        if(tatCaOnhap[0]) tatCaOnhap[0].placeholder = "Enter your name...";
        if(tatCaOnhap[1]) tatCaOnhap[1].placeholder = "Enter password...";
        if(nutDangNhap) nutDangNhap.innerText = "Create an account";
        if(nutQuenMK) nutQuenMK.innerText = "Do you already have an account?";
    } 

    else if (ngonNgu === 'vi') {
        if(tatCaOnhap[0]) tatCaOnhap[0].placeholder = "Nhập tên của og...";
        if(tatCaOnhap[1]) tatCaOnhap[1].placeholder = "Nhập mật khẩu...";
        if(nutDangNhap) nutDangNhap.innerText = "Đăng nhập";
        if(nutQuenMK) nutQuenMK.innerText = "bạn quên mật khẩu?";
    }
};