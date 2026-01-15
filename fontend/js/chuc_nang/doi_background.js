
const manHinh = document.getElementById('main-body');
const nutBamDoi = document.getElementById('hinhgai');

const anhGoc = '../../assets/backgroud/11369500.jpg';
const anhMoi = '../../assets/backgroud/gargantua-black-3840x2160-9621.jpg';

let laAnhGoc = true;


nutBamDoi.addEventListener('click', function() {
    if (laAnhGoc) {
        manHinh.style.backgroundImage = `url('${anhMoi}')`;
        manHinh.style.setProperty('--mau-nhan', '#ffcc00'); 
        manHinh.style.setProperty('--mau-nhan1', '#ffcc00');
        manHinh.style.setProperty('--mau-nhan2', '#fff200');
        manHinh.style.setProperty('--mau-nhan3', '#ffcc00');
        manHinh.style.setProperty('--mau-nhan4', 'rgba(255, 165, 0, 0.6)');
        manHinh.style.setProperty('--mau-nhan5', '#fff200');
        manHinh.style.setProperty('--mau-nhan6', '#ffcc00');
        laAnhGoc = false;
    } else {
        manHinh.style.backgroundImage = `url('${anhGoc}')`;
        manHinh.style.setProperty('--mau-nhan', '#00ffff');
        manHinh.style.setProperty('--mau-nhan1', '#00ffff');
        manHinh.style.setProperty('--mau-nhan2', '#00ffd5');
        manHinh.style.setProperty('--mau-nhan3', '#00ffff');
        manHinh.style.setProperty('--mau-nhan4', 'rgba(0, 255, 255, 0.6)');
        manHinh.style.setProperty('--mau-nhan5', '#00ffd5');
        manHinh.style.setProperty('--mau-nhan6', '#00ffff');
        laAnhGoc = true;
    }
    console.log("Đã đổi sang màu vàng rực rỡ! ✨");
});