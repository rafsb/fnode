/*---------------------------------------------------------------------------------------------
 * Theme
 *--------------------------------------------------------------------------------------------*/

const io = require('../../lib/utils/io') ;;

module.exports = class Theme {
    static init(req) {
        const path = EPaths.ASSETS + "themes/" + (req.payload?.theme||'dark') + ".theme";
        return io.exists(path) ? io.jout(path) : {}
    }

}