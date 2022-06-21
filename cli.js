require('dotenv').config();

global.PORT         = process.env.PORT       || 3000
global.IO_MODE      = process.env.IO_MODE*1  || 0
global.VERBOSE      = process.env.VERBOSE*1  || 0
global.APP_LOCALE   = process.env.APP_LOCALE || "pt-br"
global.PROFILE      = process.env.PROFILE    || "dev"
global.IS_DEV       = process.env.IS_DEV     || false
global.ROOT         = __dirname + '/';
global.SESSION      = { user: { id: "root", mail: "root@system" } };

require('./lib/constants');

const
IO                  = require('./lib/io')
, RAW_KEY           = IO.read(process.env.ENC_KEY || `etc/keys/${PROFILE}.key`)
;;

global.ENC_KEY      = Buffer.from(require('crypto').createHash('sha256').update(RAW_KEY).digest('hex'), "hex");
global.IV           = Buffer.from(md5(ENC_KEY), "hex")

const
classname           = argv.splice(0, 1)[0]
, action            = argv.splice(0, 1)[0] || 'init'
;;

console.log(ETerminalColors.BG_RED + ETerminalColors.FT_WHITE + ' CLI MODE ' + ETerminalColors.RESET);

var found = false;
[ EPaths.WEBCONTROLLERS, EPaths.CONTROLLERS, EPaths.WEBROOT, EPaths.APP, EPaths.LIB, '' ].forEach(prefix => {
    if(!found){
        const fullpath = prefix + classname + '.js';
        if(IO.exists(fullpath)) {
            const tmp = require(prefix + classname) ;;
            try{
                const a = tmp[action](...argv);
                if(a){
                    if(a instanceof Promise)(async _ => await console.log(a))();
                    else console.log(a)
                }
                found = true;
            } catch(e){
                err(`app`, `init`, classname + '::' + action + '(' + argv.join(',') + ') > ' + e.toString())
                if(VERBOSE>2) console.trace(e)
            }
        }
    }
})