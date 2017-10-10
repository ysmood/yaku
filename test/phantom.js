/**
 * Phantomjs test
 */

var page = require("webpage").create();

page.open("test/browser.html", function () {});

page.onConsoleMessage = function (msg) {
    window.console.log(msg);
};

page.onCallback = function (data) {
    if (data.failed)
        window.phantom.exit(1);
    else
        window.phantom.exit();
};
