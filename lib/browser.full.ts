// This file is intended for browser only.

import Yaku from "./yaku";

import utils from "./utils";

for (var key in utils) {
    Yaku[key] = utils[key];
}

window['Yaku'] = Yaku;

export default Yaku
