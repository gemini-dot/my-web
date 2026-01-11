const http = require('http');
const fs = require('fs');

const pathFile = 'D:/Project_All/Code_project/Web_project/backend/sever/database.txt';
let adminuser = "samisadmin1192011"
let adminpass = "admin1192011"
const server = http.createServer((req, res) => {
    // Thiết lập CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') { res.end(); return; }

    if (req.url === '/api/save-account' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            const { username, password } = JSON.parse(body);

            fs.readFile(pathFile, 'utf8', (err, data) => {
                if (err) {
                    res.statusCode = 500;
                    res.end("Lỗi server");
                    return;
                }

                const lines = data.split('\n');
                let found = false;
                if (username === adminuser && password === adminpass) {
                    res.statusCode = 200;
                    res.end("ADMIN_OK");
                    return;
                }else{
                    for (let line of lines) {
                        // Kiểm tra khớp cả User và Pass trên cùng 1 dòng 
                        if (line.includes(`User: ${username}`) && line.includes(`Pass: ${password}`)) {
                            found = true;
                            break;
                        }
                    }

                    if (found) {
                        res.statusCode = 200;
                        res.end("OK");
                    } else {
                        res.statusCode = 401;
                        res.end("Sai thông tin rồi og ơi!");
                    }
                }
            });
        });
    }
});

server.listen(5000, () => console.log("Server đang chạy tại http://localhost:5000"));