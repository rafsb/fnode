require('dotenv').config();

global.PORT         = process.env.PORT       || 3000;
global.IO_MODE      = process.env.IO_MODE*1  || 0;
global.IS_DEV       = process.env.IS_DEV*1   || 0;
global.VERBOSE      = process.env.VERBOSE*1  || 0;
global.APP_LOCALE   = process.env.APP_LOCALE || "pt-br";
global.PROFILE      = process.env.PROFILE;
global.ROOT         = __dirname + '/';
global.SESSION      = {};

require('./lib/constants');

const
IO                  = require(`./lib/io`)
, express           = require('express')
, cors              = require('cors')
, parser            = require('body-parser')
, session           = require('express-session')
, crypto            = require('crypto')
, app               = express()
, router            = express.Router()
// , key               = IO.read(`/etc/keys/${PROFILE}.key`)
// , cert              = IO.read(`/etc/keys/${PROFILE}.crt`)

, { App, FObject } = require('./lib/il')

;;

// app.keepAliveTimeout = 0;

// *---------------------------------------------------*
// *                   cors settings                   *
// *---------------------------------------------------*

// app.use(cors({
//     optionsSuccessStatus: 200,
//     origin: (origin, callback) => callback(null, true)
// }));

// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', HOST);
//     next();
// });

// *---------------------------------------------------*
router.use(session({ secret: `${crypto.randomBytes(100).toString('utf8')}`, resave: true, saveUninitialized: false }));
router.use(parser.urlencoded({ extended: true, limit: '10mb' }));
router.use(parser.json({ limit: '10mb' }));
router.use(cors());

router.get('/', (nill, res) => res.sendFile(EPaths.APP + 'index.html'))

router.all('*', async (req={}, res) => {

    SESSION = req.session;
    var path = (req.params && req.params[0] ? req.params[0] : '').split('/').filter(e => e);

    if (/robots.*\.txt$/gi.test(path.join('/'))) res.send('1');
    else if (path[0] == "api") {
        try {
            const
            cls = path[1].slice(0, 1).toUpperCase() + path[1].slice(1)
            , action = path[2] || 'init'
            , final = require(EPaths.WEBCONTROLLERS + cls.toLowerCase())
            , tmp_args = App.blend(req.query, req.body)
            ;;

            const
            b64 = tmp_args.encoded ? tmp_args.encoded.replace(/\s+/gi, '+') : ''
            , u8 = b64 ? atob(b64).toString('utf8') : null
            // , u8 = b64 ? Buffer.from(b64, 'base64').toString('utf8') : null
            ;;

            tmp_args.decoded = u8 && u8 != 'undefined' ? JSON.parse(u8) : null;
            if (!tmp_args.decoded) delete tmp_args.decoded;

            var
            params = FObject.cast(tmp_args.decoded || tmp_args)
            , result = final[action](!params.isNull() ? params : null)
            ;;

            if (result instanceof Promise) result = await result;

            res.send(result)

        } catch (e) {

            err(`/api`, `*`, e.toString())
            if (VERBOSE>2) console.trace(e);
            res.send('')

        }
    } else {
        path = path.join('/');
        var found = false;
        [EPaths.WEBROOT, EPaths.ASSETS, EPaths.VIEWS].forEach(prefix => {
            if (!found && IO.exists(prefix + path)) {
                res.sendFile(prefix + path);
                found = true
            }
        });
        if (!found) res.send('')
    }

});

app.use(router)

try {
    require("http").createServer(app).listen(PORT)
    pass(`Server`, `init`, `running on port: ${PORT}`);
} catch (e) {
    err(`server`, `create`, e.toString())
    if (VERBOSE>2) console.trace(e)
}