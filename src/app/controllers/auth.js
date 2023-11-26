/*---------------------------------------------------------------------------------------------
 * Auth
 *--------------------------------------------------------------------------------------------*/

const
md5         = require('md5')
, hash      = require('sha256')
, initiator = require('../interfaces/initiator')
, user      = require('../../lib/entities/users')
, ftext     = require('../../lib/utils/text')
, fdate     = require('../../lib/utils/date')

// userspace
, SESSION_DURATION = 1000 * 60 * 60 * 24 * 365

;;

/**
 *
 */
module.exports = class CAuth extends initiator {

    wrap(obj) {
        try { return Buffer.from(ftext.encrypt(JSON.stringify(obj)), 'utf8').toString('base64') } catch(e) {}
    }

    unwrap(token) {
        try { return JSON.parse(ftext.decrypt(Buffer.from(token, 'base64').toString('utf8'))) } catch(e) { }
    }

    static async pass(req) {
        let res = false ;;
        if(req.uat) {
            try {
                const authobj = (new CAuth).unwrap(req.uat) ;;
                if(authobj && authobj.userid && req.device == authobj.device) {
                    const u = await user.load(authobj.userid) ;;
                    if(u && authobj.ts + SESSION_DURATION > fdate.time() && (req.access_level||1)<=u.level) res = true
                }
            } catch(e) {}
        }
        return res
    }

    static async check(req) {
        let res = { status: false } ;;
        if(req.uat) {
            try {
                const authobj = (new CAuth).unwrap(req.uat) ;;
                if(authobj?.userid && req.device == authobj.device) {
                    const u = await user.load(authobj.userid) ;;
                    if(u && authobj.ts + SESSION_DURATION > fdate.time()) {
                        res.status = true
                        delete u.password
                        delete u.uat
                        res.user = u
                    }
                }
            } catch(e) {
                console.trace(e)
            }
        }
        return res
    }

    static async sign(req) {
        const res  = { status: false } ;;
        if(req.uat) res.status = (await CAuth.check(req)).status
        if(res.status) res.uat = req.uat
        else if(req.payload?.token) {
            req.uat = req.payload?.token
            res.status = (await CAuth.check(req)).status
            if(res.status) res.uat = req.uat
        } else {
            try {
                if(DB_DRIVER == "fstore") {
                    const u = await user.load(md5(req.payload.user)) ;;
                    if(u && hash(''+req.payload?.pswd) === u.password) res.uat = (new CAuth).wrap({ userid: u.id, device: req.device, ts: fdate.time() })
                } else {
                    const u = (await user.filter(null, [ [ 'username', req.payload.user || "!!NOT_USER!!" ], [ 'password', hash(``+req.payload.pswd) ] ])) ;;
                    if(u.status && u.items?.length && u.items[0]) res.uat = (new CAuth).wrap({ userid: u.items[0].id, device: req.device, ts: fdate.time() })
                }
            } catch(e) { console.trace(e) }
        }
        if(res.uat) res.status = true
        return res
    }

}