var junit = require("junit");

var it = junit();

require("./basic")(it);
require("./unhandledRejection")(it).then(it.run);
