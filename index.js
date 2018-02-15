const fs = require('fs');

fs.readFile('./demoscripts/Main.java', {encoding: 'utf-8'}, (err, data) => {
    if (err) {
        throw err;
    }

    console.log(`Normal data is:\n${data}`);
    console.log(`Encoded data is:\n${encodeURIComponent(data)}`);
    
});