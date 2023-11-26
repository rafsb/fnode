
const
router = require('express').Router()
, path = require(`path`)
, multer    = require('multer')
, upload    = multer({ dest: './var/uploads' })
, fobject = require(`../lib/utils/object`)
, io = require(`../lib/utils/io`)
, { error:ferror } = require(`../lib/entities/log`)
;;

router.get('/', (_, res) => res.sendFile(EPaths.APP + 'index.html'))
router.get('/error', (_, res) => res.sendFile(EPaths.APP + 'error.html'))

router.all("*", async (req, res) => {
    var p = (req.params && req.params[0] ? req.params[0] : '').split(/[\\/]/g).filter(e => e);
    try {
        if(!p[0]) res.send({ status: NOT_SET, error: 'missing arguments' })
        else {
            const tmp_p = `${EPaths.ASSETS}${p.join(path.sep)}` ;;
            if(io.exists(tmp_p)) return res.send(io.read(tmp_p))
            else {
                const
                cls = p[0].slice(0, 1).toUpperCase() + p[0].slice(1)
                , action = p[1] || 'init'
                , final = require(EPaths.CONTROLLERS + cls.toLowerCase())
                , tmp_args = { payload: fobject.blend({}, req.query, req.body) }
                ;;

                tmp_args.argv = p.slice(2)

                let result = final[action](tmp_args) ;;
                if (result instanceof Promise) result = await result

                res.send(result)
            }
        }
    } catch (e) {
        ferror(`api`, `*`, p + " / " + e.toString())
        if(VERBOSE>3) console.trace(e)
        res.send("")
    }
})

module.exports = router