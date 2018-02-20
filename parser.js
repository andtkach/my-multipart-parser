const { Writable } = require('stream');
const { Readable } = require('stream');
const { EOL } = require("os");

class FileReadable extends Readable {
    constructor(opt) {
        super(opt);
    }
  
    _read() {
    }
}

class Parser extends Writable {
    constructor(options) {
        super(options);
        this.headers = options.headers;
        this.file = new FileReadable(); 
        this.partsDividerStr = '';
        this.partsDividerBuf = undefined;
        this.setPartsDivider();        
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

        if (!this.partsDividerStr) {
            callback();
        }

        debugger;

        console.log('in _write method now. size:', chunk.length);
        // console.log(chunk);
        // console.log('chunk as string:');
        // console.log(chunk.toString());
        // console.log('end write.');

        const chunkHeaderStart = chunk.indexOf(this.partsDividerBuf);
        if (chunkHeaderStart === 0) {
            console.log(chunkHeaderStart);

            const chunkHeaderEnd = chunk.indexOf(EOL + EOL);
            if (chunkHeaderEnd > 0) {
                console.log(chunkHeaderEnd);
            }

            const chunkHeader = chunk.slice(chunkHeaderStart, chunkHeaderEnd);
            const chunkTail = chunk.slice(chunkHeaderEnd + EOL.length + EOL.length, chunk.lastIndexOf(this.partsDividerBuf));
            if (chunkTail.length > 0) {
                const chunkData = chunkTail.slice(0, chunkTail.lastIndexOf(EOL));
            
                console.log(chunkHeader.toString());
                console.log(chunkData.toString());

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
        
        
        //this.file.push(chunk);

        let fieldname1 = 'fieldname1';
        let filename = 'filename';
        let contentType = 'contentType';
        this.emit('file', fieldname1, this.file, filename, contentType);

        // let fieldname2 = 'fieldname2';
        // let value = 'value';
        // this.emit('field', fieldname2, value);

        //this.emit('finish');

        callback();        
    }

    _final(callback) {
        debugger;
        
        //this.file.push(null);
        callback();
    }

}

module.exports = Parser;