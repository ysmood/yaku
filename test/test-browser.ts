let junit = require("junit").default;

let it = junit();

require("./basic")(it);
require("./utils")(it);
require("./unhandledRejection")(it).then(it.run);
