/*---------------------------------------------------------------------------------------------
 * Interface initiator
 *--------------------------------------------------------------------------------------------*/

const
{ fdate: date } = require('../../lib/fw')
;;

/**
 *
 *
 */
module.exports = class __initiator {

    /**
     * init
     */
    static async init() {
        return { ts: date.time() }
    }

}