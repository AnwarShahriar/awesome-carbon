#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ora = require('ora');
const puppeteer = require('puppeteer');
const commandLineArgs = require('command-line-args')
const langs = require('./ext').langs;

const optionDefinitions = [
    { name: 'src', alias: 's', type: String, multiple: true },
    { name: 'dest', alias: 'd', type: String }
];

const options = commandLineArgs(optionDefinitions)
let sources = options.src || [];
sources = sources.includes('.') ? [] : sources;
let destination = path.resolve(options.dest || '.');

const spinner = ora('Warming up Carbonizer!').start();

const findExtension = (filePath) => {
    const parts = filePath.split('.');
    let langExt = parts[parts.length - 1];
    const matched = langs.filter((lang) => lang.mode === langExt);
    if (matched.length) {
        const lang = matched[0];
        langExt = lang.mime || lang.mode;
    } else {
        langExt = 'auto';
    }
    return langExt;
};

const carbonize = (filePath, destination) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, {encoding: 'utf-8'}, (err, data) => {
            if (err) {
                return reject(err);
            }
        
            const encodedContnt = encodeURIComponent(data);
            (async () => {
                spinner.start(`Preparing your source: ${filePath}`);
                
                const browser = await puppeteer.launch({headless: false});
                
                const page = await browser.newPage();
                await page._client.send('Page.setDownloadBehavior', {
                    behavior: 'allow',
                    downloadPath: path.resolve(destination)
                });
        
                const langExt = findExtension(filePath);
                const carbonPrefix = `https://carbon.now.sh/?bg=rgba(171,%20184,%20195,%201)&t=seti&l=${langExt}&ds=true&wc=true&wa=true&pv=48px&ph=32px&ln=false&code=`;
                await page.goto(`${carbonPrefix + encodedContnt}`);
                
                spinner.succeed(`Source is prepared: ${filePath}`);
                spinner.start('Carboning you source');
                
                await page.click('#toolbar > div.jsx-2035980575.buttons > button:nth-child(2) > span');
                await page.waitForNavigation({waitUntil: 'networkidle0'});
                await browser.close();
        
                spinner.succeed(`Carbonization done for: ${filePath}`);

                resolve('success');
            })().catch((err) => {
                reject(err);
            });    
        });
    });
}

if (!sources.length) {
    spinner.fail("Sources are not defined");
} else {
    spinner.succeed('Carbonizer is prepared!');

    const carbonizer = Promise.resolve();
    sources.forEach((src) => {
        carbonizer
            .then((response) => carbonize(src, destination))
            .catch((err) => spinner.fail(`Failed to carbonize! ${err}`));
    });
}
