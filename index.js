const fs = require('fs');
const puppeteer = require('puppeteer');

fs.readFile('./demoscripts/Main.java', {encoding: 'utf-8'}, (err, data) => {
    if (err) {
        throw err;
    }

    const encodedContnt = encodeURIComponent(data);
    (async () => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        const carbonPrefix = 'https://carbon.now.sh/?bg=rgba(171,%20184,%20195,%201)&t=seti&l=auto&ds=true&wc=true&wa=true&pv=48px&ph=32px&ln=false&code=';
        await page.goto(`${carbonPrefix + encodedContnt}`);
        await page.screenshot({path: 'carbon.png'});
      
        await browser.close();
    })();    
});