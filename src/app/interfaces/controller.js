const
auth = require(`../controllers/auth`)
, fobject = require('../../lib/utils/fobject')
, classname = require('../../lib/interfaces/classname')
;;

class InterfaceController extends classname {

    /** MEMBER VARS **************************/
    /*****************************************/
    constructor(args) {
        super(fobject.blend({
            cached                    : false
            , cached_persistence_period : 24
            , blacklist_fields          : [ 'id', 'senha', 'uat' ]
            , search_fields             : [ `id` ]
            , forced_filters            : [ [ "status", EStatus.REMOVED, ">"] ]
        }, args))
    }
    /*****************************************/

    async fields() {
        const fields = await this.entity?.fields() || {} ;;
        fields.items = fields?.items?.map(field => !(this.blacklist_fields.indexOf(field['COLUMN_NAME']) + 1) ? field['COLUMN_NAME'] : null).filter(i => i) || []
        return fields
    }

    async query(req) {

        req = req || { }
        req.maxSize = req.maxSize || 100
        if(!req.payload) req.payload = {}
        if(!req.payload.filters) req.payload.filters = []
        
        if(!req.payload.restrictions) req.payload.restrictions = []
        req.payload.restrictions = req.payload.restrictions.concat(this.forced_filters)

        const { search } = req.payload ;;
        if(search) req.payload.filters = this.search_fields.map(i => [ i, search, 'like' ])

        let tmp, res = { status: false, items: [] } ;;
        const entity = this.entity, iter = await entity.iterator(req.payload) ;;
        do {
            tmp = await iter.next()
            if(tmp.value?.items) res.items = res.items.concat(tmp.value.items.map(item => entity.cast(item)))
            res.nextToken = tmp.value?.nextToken || null
        } while (tmp.value && !tmp.done && res.items.length <= req.maxSize)

        res.status = true && res.items.length

        return res
    }

    async count(obj){

        let res = { found: 0 } ;;
        try { res = await this.entity.count(obj) } catch(e) {}
        return res

    }

    async save(req) {
        let res = { status: 0 }
        if (req.payload.item) {
            req.payload.item.status = 1
            const
            src = this.entity.cast(req.payload.item)
            , save = await src.save()
            ;;
            if (save) res = { status: 1, item: save }
        }
        return res
    }

    async latest() {
        const
        db = await this.entity.pipe()
        , qres = await db.query(`SELECT * FROM ${this.entity.classname().name} WHERE status>${EStatus.REMOVED} ORDER BY _created DESC LIMIT 0,1`)
        , res = {
            status: qres.status && qres.items.length
            , item: qres.status && qres.items.length ? qres.items[0] : this.entity.cast()
        }
        ;;
        return res
    }

    async load(req) {

        const
        res = { status: 0 }
        , id = req?.payload?.id || req?.params[0]
        ;;

        if (id) {
            res.item = await this.entity.load(id)
            res.status = res.item ? true : false
        }

        return res
    }
    
    // async drop(req) {
    //     let res = { status: 0 }
    //     const
    //     id = req.payload.id || req.params[0]
    //     , key = req.params[1]
    //     ;;
    //     if (id) {
    //         const
    //         { affectedRows } = await this.entity.drop(id, key || null)
    //         , status = true && affectedRows
    //         ;;
    //         res = { status, affectedRows }
    //     }
    //     return res
    // }

    async drop(req) {
        const 
        res = { status: 0 }
        , id = req.payload.id || req.params[0] 
        ;;
        if (id) {
            const
            item = await this.entity.load(id)
            ;;
            if(item) {
                item.status = EStatus.REMOVED
                res.status = await item.save()
            }
        }
        return res
    }

}

module.exports = InterfaceController ;;