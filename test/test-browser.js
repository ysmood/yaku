var junit = require("junit").default;

var it = junit({
    reporter: junit.reporter({ mode: "none" })
});

require("./basic")(it);
require("./utils")(it);
require("./unhandledRejection")(it)
.then(it.run).then(function (res) {
    if (window.callPhantom) {
        window.callPhantom(res);
    }
});
