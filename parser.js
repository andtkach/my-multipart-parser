const { Writable } = require('stream');
const { Readable } = require('stream');
const { EOL } = require('os');

class FileReadable extends Readable {
    constructor(opt) {
        super(opt);
    }
  
    _read() {
        //console.log('Called _read on FileReadable');
    }
}

class Parser extends Writable {
    constructor(options) {
        super(options);
        this.headers = options.headers;
        this.file = new FileReadable(); 
        this.file.pause();
        this.partsDividerStr = '';
        this.partsDividerBuf = undefined;
        this.setPartsDivider();        
        this.isFileEventEmitted = false;

        this.fileName = '';
        this.contentType = '';
    }

    setPartsDivider() {
        const headerParts = this.headers['content-type'].split(';');
        if (headerParts && headerParts.length > 0) {
            headerParts.forEach(h => {
                if (h.includes('boundary=')) {
                    const b = h.split('=')[1];
                    this.partsDividerStr = '--' + b;    
                    this.partsDividerBuf =  Buffer.from(this.partsDividerStr);
                }
            });
        }
    }

    _write(chunk, encoding, callback) {
        //debugger;
        //console.log('in _write method now. size:', chunk.length);
        
        //console.log(this.headers);
        //console.log(this.headers['content-type']);
        if (this.headers['content-type'] && this.headers['content-type'].toLowerCase().startsWith('multipart/form-data;')) {

            if (!this.partsDividerStr) {
                callback();
            }

            const chunkHeaderStart = chunk.indexOf(this.partsDividerBuf);
            if (chunkHeaderStart === 0) {
            //console.log(chunkHeaderStart);

                const chunkHeaderEnd = chunk.indexOf(EOL + EOL);
                if (chunkHeaderEnd > 0) {
                //console.log(chunkHeaderEnd);
                }

                const chunkHeader = chunk.slice(chunkHeaderStart, chunkHeaderEnd);
                const headerText = chunkHeader.toString();
                //console.log(headerText);
                this.parseChunkHeaders(headerText);
            
                const chunkTail = chunk.slice(chunkHeaderEnd + EOL.length + EOL.length, chunk.lastIndexOf(this.partsDividerBuf));
                if (chunkTail.length > 0) {
                    const chunkData = chunkTail.slice(0, chunkTail.lastIndexOf(EOL));
                    this.file.push(chunkData);
                }
                else {
                    const chunkData = chunk.slice(chunkHeaderEnd + EOL.length + EOL.length, chunk.length);
                    this.file.push(chunkData);
                }
            }
            else if (chunkHeaderStart > 0) {
                const chunkTail = chunk.slice(0, chunkHeaderStart);
                const chunkData = chunkTail.slice(0, chunkTail.lastIndexOf(EOL));
                this.file.push(chunkData);
            }
            else {
                this.file.push(chunk);
            }
        
            //debugger;
            if (!this.isFileEventEmitted) {
                let fieldname1 = 'This field is really not used here.';
                this.emit('file', fieldname1, this.file, this.fileName, this.contentType);
                this.isFileEventEmitted = true;
                this.file.resume();
            }

        } else if (this.headers['content-type'] && this.headers['content-type'].toLowerCase().startsWith('application/x-www-form-urlencoded')) { 
            //debugger;
            const content = chunk.toString().split('&');
            content.forEach(c => {
                const field = c.split('=');
                this.emit('field', field[0], field[1]);
            });
            this.emit('finish');
            
        } else {
            console.log('Unknown content type has arrived.');
        }

        callback();        
    }

    _final(callback) {
        //debugger;
        //this.file.push(null);
        callback();
    }

    parseChunkHeaders(data) {
        //console.log('Parsing headers...');
        //debugger;
        let dataArray = data.split(EOL);
        
        dataArray.forEach(line => {
            //console.log(line);
            const oneHeader = line.split(':');
            if (oneHeader.length === 2) {
                if (oneHeader[0].toLowerCase() === 'content-type') {
                    this.contentType = oneHeader[1].trim().toLowerCase();
                }
                if (oneHeader[0].toLowerCase() == 'content-disposition') {
                    let cd = oneHeader[1].trim().split(';');
                    cd.forEach(p => {
                        if (p.trim().startsWith('filename')) {
                            this.fileName = p.trim().split('=')[1];
                            this.fileName = this.fileName.substring(1, this.fileName.length-1);
                        }
                    });
                }
            }
        });
    }
}

module.exports = Parser;