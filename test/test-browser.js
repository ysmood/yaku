var junit = require("junit");

var it = junit({
    reporter: junit.reporter({ mode: "none" })
});

require("./basic")(it);
require("./utils")(it);
require("./finally")(it);
require("./unhandledRejection")(it)
.then(it.run).then(function (res) {
    if (window.callPhantom) {
        window.callPhantom(res);
    }
});
