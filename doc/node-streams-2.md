# Multipart-парсер
Это задание не имеет отношение к первому заданию, хотя правильно реализованный http-сервер должен спокойно работать с этим парсером (это способ проверки правильности реализации http-сервера)

Реализовать парсер multipart-форм в виде Writable потока. https://ru.wikipedia.org/wiki/Multipart/form-data

Код использования парсера приведен ниже
```js
const { createServer } = require('http');
const Parser = require('./parser'); // ваш код

createServer((req, res) => {
  if (req.method === 'POST') {
    const parser = new Parser({ headers: req.headers });
    parser.on('file', (fieldname, file, filename, contentType) => {
      // file должен быть Readable stream
      file.on('data', ({ length }) => console.log(`Got {length} bytes`));
      file.on('end', () => console.log('File finished'));
    });
    parser.on('field', (fieldname, value) =>
      console.log(`${fieldname} ==> ${value}`
    );
    parser.on('finish', function() {
      console.log('Done parsing form!');
      res.writeHead(200);
      res.end(JSON.stringify('{ success: true }'));
    });
    req.pipe(parser);
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('OK');
  }
}).listen(process.env.PORT || 8000, () => console.log('Listening'));
```
