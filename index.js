const { createServer } = require('http');
const Parser = require('./parser'); // ваш код
var fs = require('fs');

createServer((req, res) => {
    if (req.method === 'POST') {
        console.log('POST request');
       var debugWriteStream = fs.createWriteStream('c:\\temp\\debug.txt');
        const parser = new Parser({ headers: req.headers });
        console.log(req.headers);
        parser.on('file', (fieldname, file, filename, contentType) => {
            debugger;
            console.log('parser on file');
            // file должен быть Readable stream
            // let's try to pipe readable to some text.

            
            debugWriteStream.on('finish', function () {
                debugger;
                console.log('FINISHED to debug.txt');
              });
              
             
            file.on('data', (data) => {
                debugger;
                debugWriteStream.write(data);
                console.log(`Got ${data.length} bytes`);
            });
            
            file.on('end', () => {
                debugger;
                console.log('File finished'); 
            });
        });
        
        parser.on('field', (fieldname, value) => {
            debugger;
            console.log('parser on field');
            console.log(`${fieldname} ==> ${value}`);
        });

        parser.on('finish', function() {
            debugger;
            debugWriteStream.end();
            console.log('parser on finish');
            console.log('Done parsing form!');
            res.writeHead(200);
            res.end(JSON.stringify('{ success: true }'));
        });

        req.pipe(parser);

    } else if (req.method === 'GET') {
        console.log('GET request');
        res.writeHead(200, { Connection: 'close' });
        res.end('OK');
    }
}).listen(process.env.PORT || 8000, () => console.log('Listening 8000'));