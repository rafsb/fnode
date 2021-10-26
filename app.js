global.NO_SET = 0
global.UTF8 = global.utf8 = 'utf8';
global.ROOT = __dirname + '/';
global.argv = process.argv.slice(2)

require('./lib/constants');

const
    PORT = 3000,
    IO = LIB('io'),
    classname = argv[0],
    action = argv[1],
    args = argv.slice(2),
    { FDate } = LIB('faau');;

global.LOG = (tx, persist = false, filename = 'default.log', carriage = false) => {
    const m = (carriage ? '\r' : '') + FDate.as('<Y-m-d_h:i:s> ') + (typeof tx == 'object' ? JSON.stringify(tx) : tx);;
    if (persist) IO.log(m, typeof pesist == 'string' ? persist : filename, EIO.APPEND);
    if (carriage) process.stdout.write(m);
    else console.log(m);
}

global.COUT = (tx) => LOG(tx, false, null, true);

if (classname == 'init') {
    console.log('starting web server...');

    const
        express = require('express'),
        parser = require('body-parser'),
        app = express();;

    app.use(parser.json())
    app.use(parser.urlencoded({ extended: true }))
        // app.use(require('./router'));

    app.all('*', (req, res) => {

        var path = '';
        if (req.params && req.params[0]) path += req.params[0];
        if (path == '/') path = EPaths.APP + 'index.html';

        if (req.method != 'POST') {
            ['', EPaths.ASSETS, EPaths.WEBROOT, EPaths.WEBVIEWS].forEach(prefix => IO.exists(prefix + path) && res.sendFile(prefix + path))
        } else if (req.method == 'POST') {
            try {
                const
                    cls_arr = req.params[0].split('/').filter(e => e),
                    cls = cls_arr[0].slice(0, 1).toUpperCase() + cls_arr[0].slice(1),
                    fn = cls_arr[1] || 'render',
                    others = cls_arr.length > 2 ? { uri: cls_arr.slice(2) } : req,
                    final = require(EPaths.WEBCONTROLLERS + cls);;
                res.send(final[fn](req.body || others));
            } catch (e) { IO.log('webserver::init > ' + JSON.stringify(e)) }
        }

    })
    app.listen(action || PORT, NULL => console.log('server running under: http://localhost:' + (action || PORT)))
} else {
    console.log('\n----------------------------------------\n| CLI MODE                             |\n----------------------------------------\n\n');
    [EPaths.APP, EPaths.LIB, EPaths.CONTROLLERS, EPaths.COLLECTORS, EPaths.VIEWS].forEach(prefix => {
        const fullpath = prefix + classname + '.js';
        if (IO.exists(fullpath)) {
            const tmp = require(prefix + classname);;
            try {
                const a = tmp[action || 'render'](...args);
                if (a && !(a instanceof Promise)) console.log(a)
            } catch (e) {
                LOG('APP > error trying to execute: ' + classname + '::' + (action || 'render') + '(' + args.join(',') + ') \n' + JSON.stringify(e, null, 4), 'error.log');
                console.trace(e)
            }
        }
    })
    console.log('\n\n|--------------------------------------|\n')
}