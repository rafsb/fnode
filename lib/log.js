/*---------------------------------------------------------------------------------------------
 * Log
 *--------------------------------------------------------------------------------------------*/

const
Entity    = require('./interfaces/entity')
, { App, FDate } = require(`./il`)
;;

module.exports = class Log extends Entity {

    static async once(createdBy='Log', action='once', type='info', data_='', clr=ETerminalColors.FT_CYAN, vlevel=1) {
        if(VERBOSE>=vlevel) out(createdBy + '::' + action, type, data_, clr)
        return vlevel <=2 ? await (new Log({
            userLogged: SESSION.account?.user || `Anonymous`
            , createdBy, type, action, data_
        })).save() : 1
    }

    static async warn(createdBy='Log', action='warn', data_='', clr=ETerminalColors.FT_YELLOW) {
        return await Log.once(createdBy, action, 'warn', data_, clr, 2)
    }

    static async pass(createdBy='Log', action='pass', data_='', clr=ETerminalColors.FT_GREEN) {
        return await Log.once(createdBy, action, 'pass', data_, clr, 3)
    }

    static async info(createdBy='Log', action='info', data_='', clr=ETerminalColors.FT_CYAN) {
        return await Log.once(createdBy, action, 'info', data_, clr, 3)
    }

    static async err(createdBy='Log', action='err', data_='', clr=ETerminalColors.FT_RED) {
        return await Log.once(createdBy, action, 'error', data_, clr, 1)
    }

    static async fail(createdBy='Log', action='fail', data_='', clr=ETerminalColors.FT_MAGENTA) {
        return await Log.once(createdBy, action, 'fail', data_, clr, 2);
    }

    constructor(obj){
        super(App.blend({ id: FDate.as(`Y-m-dTh:i:s.000Z`) }, obj))
    }

}