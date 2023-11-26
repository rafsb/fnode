/*---------------------------------------------------------------------------------------------
 * Log
 *--------------------------------------------------------------------------------------------*/

const
md5       = require('md5')
, fw      = require('../fw')
, io      = require('../utils/io')
, fdate   = require('../utils/date')
, ftext   = require('../utils/text')
, fobject = require('../utils/object')
// , Entity  = require(`../interfaces/entity`)
;;

class Log extends fobject {

    static dbconf(cfg){

        return {
            db          : cfg?.db        || DB_NAME
            , container : cfg?.container || `Logs`
            , pk        : cfg?.pk        || `userLogged`
            , key       : cfg?.key       || DB_KEY
            , endpoint  : cfg?.endpoint  || DB_ENDPOINT
        }

    }

    log(){
        console.log(this.toObject())
    }

    constructor(obj){
        const date = new fdate() ;;
        super(fw.blend({
            id              : md5(date.time())
            , worker_       : `System`
            , task_         : `log`
            , type_         : `info`
            , data_         : null
            , user_
        }, obj))
    }

    static once(worker_='Log', task_='once', type_='info', data_='', clr=ETerminalColors.FT_CYAN, vlevel=4, user_=null) {
        if(VERBOSE_PERSISTANCE_IO) io.write(`var/logs/${worker_}.log`, `${fdate.as()} ${task_} -> ${type_}\n${data_}\n\n`, EIO.APPEND)
        const l = new Log({ worker_, task_, type_, data_ }, user_) ;;
        if(vlevel<=VERBOSE_PERSISTANCE_THRESHOLD) l.save()
        if(VERBOSE>=vlevel) {
            const
            max = process.stdout.columns || 1024
            , x1 = Math.max(Math.floor(max * .25), 32)
            , x2 = Math.max(Math.floor(max * .25), 32)
            ;;
            process.stdout.write(
                (clr ? clr : '')
                + ftext.fill(worker_+'', ' ', x1, 1)
                + ftext.fill(task_+'', ' ', x2, 1)
                + ftext.fill(data_ + '', ' ', Math.max(process.stdout.columns, 64) - (x1 + x2), 1)
                + (clr ? ETerminalColors.RESET : '')
                + '\n'
            )
        }
        return l
    }

    static warn(worker_, task_, data_, clr=ETerminalColors.FT_YELLOW, user_=null) {
        return Log.once(worker_, task_, 'warn', data_, clr, 2, user_)
    }

    static pass(worker_, task_, data_, clr=ETerminalColors.FT_GREEN, user_=null) {
        return Log.once(worker_, task_, 'pass', data_, clr, 3, user_)
    }

    static info(worker_, task_, data_, clr=ETerminalColors.FT_CYAN, user_=null) {
        return Log.once(worker_, task_, 'info', data_, clr, 4, user_)
    }

    static error(worker_, task_, data_, clr=ETerminalColors.FT_RED, user_=null) {
        return Log.once(worker_, task_, 'error', data_, clr, 0, user_)
    }

    static fail(worker_, task_, data_, clr=ETerminalColors.FT_MAGENTA, user_=null) {
        return Log.once(worker_, task_, 'fail', data_, clr, 1, user_)
    }

    static debug(worker_, task_, data_, clr=ETerminalColors.FT_YELLOW, user_=null) {
        return Log.once(worker_, task_, 'fail', data_, clr, 0, user_)
    }

}

module.exports = Log