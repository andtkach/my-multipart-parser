const { createServer } = require('http');
const Parser = require('./parser'); 
const fs = require('fs');

const uploadFolder = 'uploads';

createServer((req, res) => {
    if (req.method === 'POST') {
        
        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder);
        }

        const parser = new Parser({ headers: req.headers });
        parser.on('file', (fieldname, file, filename, contentType) => {
            const debugWriteStream = fs.createWriteStream(`./${uploadFolder}/${filename}`);
            debugWriteStream.on('finish', function () {
            });

            file.on('data', (data) => {
                debugWriteStream.write(data);
            });
            
            file.on('end', () => {
                debugWriteStream.end();
            });
        });
        
        parser.on('field', (fieldname, value) => {
            console.log('parser on field');
            console.log(`${fieldname} ==> ${value}`);
        });

        parser.on('finish', function() {
            res.writeHead(200);
            res.end(JSON.stringify('{ success: true }'));
        });

        req.pipe(parser);

    } else if (req.method === 'GET') {
        res.writeHead(200, { Connection: 'close' });
        res.end('OK');
    }
}).listen(process.env.PORT || 8000, () => console.log('Listening 8000'));