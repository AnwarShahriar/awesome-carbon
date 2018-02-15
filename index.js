const fs = require('fs');
const path = require('path');
const ora = require('ora');
const puppeteer = require('puppeteer');

fs.readFile('./demoscripts/Main.java', {encoding: 'utf-8'}, (err, data) => {
    if (err) {
        throw err;
    }

    const encodedContnt = encodeURIComponent(data);
    (async () => {
        const spinner = ora('Preparing your source').start();

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page._client.send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: path.resolve(__dirname, 'downloads')
        });
        const carbonPrefix = 'https://carbon.now.sh/?bg=rgba(171,%20184,%20195,%201)&t=seti&l=auto&ds=true&wc=true&wa=true&pv=48px&ph=32px&ln=false&code=';
        await page.goto(`${carbonPrefix + encodedContnt}`);
        
        spinner.succeed('Source is prepared');
        spinner.start('Carboning you source');
        
        await page.click('#toolbar > div.jsx-2035980575.buttons > button:nth-child(2) > span');
        await page.waitForNavigation({waitUntil: 'networkidle0'});
        await browser.close();

        spinner.succeed('Carbon is ready');
    })();    
});