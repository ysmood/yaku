/**
 * webpack entry for browser tests
 */

var junit = require('junit');

var it = junit({
    reporter: junit.reporter({ mode: 'none' })
});

require('./basic')(it);
require('./utils')(it);
require('./finally')(it);
require('./unhandledRejection')(it)
    .then(it.run).then(function (res) {
        if (location.search.match(/puppeteer=true/)) {
            alert(JSON.stringify(res));
        }
    });
