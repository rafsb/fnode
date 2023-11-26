/*---------------------------------------------------------------------------------------------
 * APP.JS
 *---------------------------------------------------------------------------------------------
 */
process.env.UV_THREADPOOL_SIZE = require('os').cpus().length

require('dotenv').config({ path: `./.env` })

global.HOST             = process.env.HOST
global.PORT             = process.env.PORT             || 3000
global.VERBOSE          = process.env.VERBOSE * 1      || 0
global.DB_DOC_SIZE      = process.env.DB_DOC_SIZE * 1  || 1024
global.VERSION          = process.env.VERSION          || "0.1-alpha"
global.DB_DRIVER        = process.env.DB_DRIVER        || "iostore"
global.DB_NAME          = process.env.DB_NAME          || "core"
global.DB_USER          = process.env.DB_USER          || ""
global.DB_PASSWORD      = process.env.DB_PASSWORD      || ""
global.DB_PK            = process.env.DB_PK            || ""
global.DB_KEY           = process.env.DB_KEY           || ""
global.DB_ENDPOINT      = process.env.DB_ENDPOINT      || ""
global.DB_PORT          = process.env.DB_PORT          || ""
global.DB_CACHE         = process.env.DB_CACHE * 1     || 0
global.SESSION_DURATION = process.env.SESSION_DURATION || 24 * 60
global.ROOT             = __dirname + '/src/'

const
path        = require('path')
, fio       = require('./src/lib/utils/io')
, ftext     = require('./src/lib/utils/text')
, fdate     = require('./src/lib/utils/date')
, fcache     = require('./src/lib/utils/cache')
, express   = require('express')
, parser    = require('body-parser')
, app       = express()
, key       = fio.read("etc/keys/key.pem")
, cert      = fio.read("etc/keys/cert.pem")
, ca        = fio.read("etc/keys/csr.pem")
;;

global.global_cache = fcache.load(`cache`)
global.KEY = fio.read('/etc/keys/private.key')
require('./src/lib/constants')

console.log()
console.log(ftext.fill("", "-", Math.min(process.stdout.columns, 64)))
console.log(
    ETerminalColors.BOLD + ' ENV VARS: \n   ' + ETerminalColors.BOLD_OFF
    + fio.read("../.env")
        .trim()
        .split(/\n/g)
        .filter(line => line.split('#')[0])
        .map(line => ETerminalColors.FT_BLUE + line.replace('=', ETerminalColors.FT_BLACK + '=' + ETerminalColors.BOLD + ETerminalColors.FT_WHITE) + ETerminalColors.BOLD_OFF + ETerminalColors.RESET)
        .join("\n   ")
)
console.log(ftext.fill("", "-", Math.min(process.stdout.columns, 64)))
console.log()

// *---------------------------------------------------*
// *                 session settings                  *
// *---------------------------------------------------*
app.set('trust proxy', 1)
app.use(parser.urlencoded({ extended: true, limit: '20mb' }))
app.use(parser.json({ limit: '20mb' }))

// *---------------------------------------------------*
// *                 router settings                   *
// *---------------------------------------------------*
app.use(express.static(path.join(ROOT, 'app/webroot')))
app.use(express.static(path.join(ROOT, 'app/webroot/assets')))
app.use(express.static(path.join(ROOT, 'app/webroot/assets/img')))
app.use(express.static(path.join(ROOT, 'app/webroot/assets/dicts')))
app.use(express.static(path.join(ROOT, 'app/webroot/css')))
app.use(express.static(path.join(ROOT, 'app/webroot/js')))
app.use(express.static(path.join(ROOT, 'app/webroot/views')))
app.use('/', require('./src/routes/entrypoint'))

app.keepAliveTimeout = 0

// *---------------------------------------------------*
// *                 server settings                   *
// *---------------------------------------------------*
try {
    // global.htserver = require("https").createServer({ key, cert }, app) ;;
    global.htserver = require("http").createServer(app) ;;
    global.fsock = require('./src/lib/fsocket')(htserver)
    htserver.listen(PORT, _ => console.log(
        ETerminalColors.BG_BLUE
        + ETerminalColors.FT_WHITE
        + 'SERVER RUNNING ON PORT ' + htserver.address().port + ' at ' + fdate.as()
        + ETerminalColors.RESET
    ))
} catch (e) {
    console.error(`error`, `server`, `create`)
    if(VERBOSE>2) console.trace(e)
}