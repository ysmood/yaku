/**
 * Real browser test
 */

var puppeteer = require('puppeteer');
var kit = require('nokit');

module.exports = puppeteer.launch({args: ['--no-sandbox']}).then(function (browser) {
    return browser.newPage().then(function (page) {
        return page.goto('file://' + kit.path.resolve('test/browser.html?puppeteer=true'))
            .then(function () {
                return new Promise(function (resolve, reject) {
                    page.on('console', function (msg) {
                        global.console.log(msg.text());
                    });
                    page.on('dialog', function (dialog) {
                        var data = JSON.parse(dialog.message());

                        if (data.failed)
                            reject();
                        else
                            resolve();

                        browser.close();
                    });
                });
            });
    });
});