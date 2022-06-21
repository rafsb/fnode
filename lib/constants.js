const
{ App } = require('./il')
;;

// CONSTANTS

global.NOT_SET              = 0;
global.UTF8                 = global.utf8 = 'utf8';
global.argv                 = process.argv.slice(2);
global.md5                  = require('md5');
global.Log                  = require('./log')

global.DISABLE_SCRIPTS      = process.env.DISABLE_SCRIPTS*1 || 0;
global.MAX_FAIL_COUNT       = process.env.MAX_FAIL_COUNT*1 || 10;
global.MAX_REG_SIZE         = process.env.MAX_REG_SIZE*1 || 1
global.CACHE_VERSION        = process.env.CACHE_VERSION || `prod`

global.DB_LOCK              = 0;
global.DB_LOCK_MAX_COUNT    = 4;
global.FETCH_LOCK           = 0;
global.FETCH_LOCK_MAX_COUNT = 4;
global.BULK_MAX_COUNT       = process.env.BULK_MAX_COUNT*1 || 200;

global.log                  = Log.once
global.pass                 = Log.pass
global.warn                 = Log.warn
global.info                 = Log.info
global.err                  = Log.err
global.fail                 = Log.fail

// ENUMS
global.EPaths = Object.freeze({
    APP                     : ROOT + 'app/'
    , CONFIG                : ROOT + 'cfg/'
    , ETC                   : ROOT + 'etc/'
    , LIB                   : ROOT + 'lib/'
    , MODELS                : ROOT + 'app/models/'
    , CONTROLLERS           : ROOT + 'app/controllers/'
    , WEBROOT               : ROOT + 'app/webroot/'
    , ASSETS                : ROOT + 'app/webroot/assets/'
    , WEBCONTROLLERS        : ROOT + 'app/webroot/controllers/'
    , VIEWS                 : ROOT + 'app/webroot/views/'
    , TEMPLATES             : ROOT + 'app/webroot/views/templates/'
})

global.EPragmas = Object.freeze({
    NOT_SET                 : NOT_SET
})

global.EStatus = Object.freeze({
    NOT_SET                 : NOT_SET
    , ACTIVE                : 1
    , INACTIVE              : 2
    /** 3-8 */
    , UNDEFINED             : 9
})

global.EErrors = Object.freeze({
    NOT_SET                 : NOT_SET
})

global.ETerminalColors = Object.freeze({
    FT_BLACK                : "\033[1;30m"
    , BG_BLACK              : "\033[1;40m"
    , FT_RED                : "\033[1;31m"
    , BG_RED                : "\033[1;41m"
    , FT_GREEN              : "\033[1;32m"
    , BG_GREEN              : "\033[1;42m"
    , FT_YELLOW             : "\033[1;33m"
    , BG_YELLOW             : "\033[1;43m"
    , FT_BLUE               : "\033[1;34m"
    , BG_BLUE               : "\033[1;44m"
    , FT_MAGENTA            : "\033[1;35m"
    , BG_MAGENTA            : "\033[1;45m"
    , FT_CYAN               : "\033[1;36m"
    , BG_CYAN               : "\033[1;46m"
    , FT_WHITE              : "\033[1;37m"
    , BG_WHITE              : "\033[1;47m"
    , RESET                 : "\033[1;0m"
    , BOLD                  : "\033[1;1m"
    , UNDERLINE             : "\033[1;4m"
    , INVERSE               : "\033[1;7m"
    , BOLD_OFF              : "\033[1;21m"
    , UNDERLINE_OFF         : "\033[1;24m"
    , INVERSE_OFF           : "\033[1;27m"
})

/**
 * @current
 */
global.dump = o => console.log(o) || process.exit();
global.out  = (executer, action, message, clr, x1=.2, x2=.2) => {
    const
    max = process.stdout.columns
    ;;
    x1 = Math.max(Math.floor(max * x1), 32);
    x2 = Math.max(Math.floor(max * x2), 32);
    process.stdout.write(
        App.fill(executer+'', ' ', x1, 1)
        + (clr ? clr : '') +App.fill(action+'', ' ', x2, 1) + (clr ? ETerminalColors.RESET : '')
        + App.fill(message+'', ' ', Math.max(process.stdout.columns, 64) - (x1 + x2), 1)
        + '\n'
    )
}

// END
module.exports = null