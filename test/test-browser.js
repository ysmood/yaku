var junit = require("junit").default;

var it = junit();

require("./basic")(it);
require("./unhandledRejection")(it).then(it.run);
