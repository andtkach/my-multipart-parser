const { createServer } = require('http');
const Parser = require('./parser'); 
const fs = require('fs');

const uploadFolder = 'uploads';

createServer((req, res) => {
    if (req.method === 'POST') {
        //console.log('POST request');

        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder);
        }

        const parser = new Parser({ headers: req.headers });
        //console.log(req.headers);
        parser.on('file', (fieldname, file, filename, contentType) => {
            //console.log('parser on file');
            //console.log('File name:', filename);
            //console.log('Content Type:', contentType);
            //debugger;
            
            const debugWriteStream = fs.createWriteStream(`./${uploadFolder}/${filename}`);
            debugWriteStream.on('finish', function () {
            //debugger;
            //console.log('FINISHED to debug.file');
            });

            file.on('data', (data) => {
                //debugger;
                debugWriteStream.write(data);
                //console.log(`Got ${data.length} bytes`);
            });
            
            file.on('end', () => {
                //debugger;
                //console.log('File finished'); 
                debugWriteStream.end();
            });
        });
        
        parser.on('field', (fieldname, value) => {
            //debugger;
            console.log('parser on field');
            console.log(`${fieldname} ==> ${value}`);
        });

        parser.on('finish', function() {
            //debugger;
            //console.log('parser on finish');
            //console.log('Done parsing form!');
            res.writeHead(200);
            res.end(JSON.stringify('{ success: true }'));
        });

        req.pipe(parser);

    } else if (req.method === 'GET') {
        //console.log('GET request');
        res.writeHead(200, { Connection: 'close' });
        res.end('OK');
    }
}).listen(process.env.PORT || 8000, () => console.log('Listening 8000'));