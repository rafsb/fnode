const IO = require('../../../lib/io') ;;
module.exports = class __Proto__ {
    static init(){
        return IO.read('version').trim()
    }
}