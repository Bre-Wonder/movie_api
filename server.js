const http = require('http'),
    url = require('url'),
    fs = require('fs');

http.createServer((request, response) => {
    let addr = request.url,
        q = url.parse(addr, true);
        filePath = '';
    
    fs.appendFile('memoryLog.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
          console.log(err);
        } else {
          Console.log ('Added to log.');
        }
    });
    
    if(q.pathname.includes('documentation')) {
        filePath = (__dirname + '/docuemntation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }

        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.write(data);
        response.end();
    });

 }).listen(8080);
    
console.log('My First Node test server is runningon Port 8080.');

