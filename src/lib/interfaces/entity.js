/*---------------------------------------------------------------------------------------------
 * Entity
 *--------------------------------------------------------------------------------------------*/
const
VERBOSE         = false
, Classname     = require(`./classname`)
, DB            = require(`../models/${DB_DRIVER}`)
, IO            = require("../utils/fio")
, ftext         = require('../utils/ftext')
, fw            = require('../fw')
, fobject       = require('../utils/fobject')
, farray        = require('../utils/farray')
, fdate         = require('../utils/fdate')
, md5           = require('md5')
;;

class Entity extends Classname {

    uid(x){ if(x) this.id = x; return this.id }

    p(field, x){ if(x!==null&&x!==undefined) this[field] = x; return this[field] }

    import(src_name){
        if(IO.exists(src_name)){
            const me = this ;;
            IO.jout(src_name).each(src => me[src.key] = src.value)
            src_name          = src_name.split('/');
            this.source_name_ = src_name[src_name.length - 1].replace(/(.json\b)|(.js\b)/gi, '')
            this.status_      = this.status_ || EStatus.NOT_SET
            this.id_builder()
            return this
        }
        console.warn(this.classname().name, 'import', 'path not found: ' + src_name);
        return false
    }

    static import(src_name) {
        return this.classname().cls.cast().import(src_name)
    }

    static open(path) {
        return this.classname().cls.cast(IO.jout(path))
    }

    toObject() {
        return { ...this }
    }

    export(path) {
        const obj = { ...this } ;;
        if(path) IO.jin(path, obj);
        return obj
    }

    static export(src_name) {
        return this.classname().cls.cast().export(src_name)
    }

    mime(){
        return new this.constructor(this.export(null))
    }

    set(key, value){
        (key && value) && (this[key] = value)
        return this
    }

    cast(obj){
        return new this.constructor(obj)
    }

    // @override
    validate(){ return true }

    dbconf(conf){

        conf = conf || {};

        const
        classname = conf && conf.classname ? { name: conf.classname, cls: eval(conf.classname) } : this.classname()
        ;;

        return fobject.blend({
            db          : DB_NAME
            , container : `${classname.name}`
            , pk        : 'pk' // classname.cls.cast().pk_ || DB_PK
            , key       : DB_KEY
            , endpoint  : DB_ENDPOINT
        }, conf||{})
    }

    id_builder(){
        if(!this.id) this.id = `ID:${fdate.time().toString(16).toUpperCase()}`
    }

    constructor(obj={}, pk=null) {
        const date = fdate.cast() ;;
        super(fobject.blend({
            status         : EStatus.ACTIVE
        }, obj))
        if(!this.id) this.id_builder();
    }

    async save(req) {
        try {

            this.id_builder()

            const
            classname = this.classname()
            , conn = classname.cls.dbconf(req)
            ;;

            var
            o = this.export(null)
            , ret = false
            ;;

            if(o && this.validate()) {
                delete o._modified;
                delete o._created;
                const db = await DB.load(conn) ;;
                try {
                    o = fobject.blend({ status: EStatus.ACTIVE }, o)
                    if(DB_DRIVER == "fstore") ret = db.set(o.id, o, _=>_, true)
                    else ret = await db.save(o)
                } catch(e){
                    console.error(new Date(), classname.name, `save`, e.toString())
                    if(VERBOSE>2) console.trace(e)
                    ret.error = e.toString()
                }
            } else ret.error = "validation didn't pass"

            return ret

        } catch(e){
            if(VERBOSE>2) console.trace(e);
            return false
        }
    }

    static async pipe(conn){

        const
        classtype = this.classname()
        ;;

        conn = this.dbconf(fobject.blend(conn, { container: `${classtype.name}` }))
        return await DB.load(conn)

    }

    static cast(obj) {
        return new (this.classname().cls)(obj)
    }

    static dbconf(conf){

        conf = conf || {};

        const
        classname = this.classname()
        ;;

        return fobject.blend({
            db          : DB_NAME
            , database  : DB_NAME
            , container : `${classname.name.toLowerCase()}`
            , table     : `${classname.name.toLowerCase()}`
            , pk        : DB_PK
            , key       : DB_KEY
            , port      : DB_PORT
            , endpoint  : DB_ENDPOINT
            , host      : DB_ENDPOINT
            , user      : DB_USER
            , password  : DB_PASSWORD
        }, conf)
    }

    static querify(params) {

        if(!params) params = {}

        const
        query_restrictions = farray.cast()
        , query_filters = farray.cast()
        , { restrictions, filters } = params
        ;;

        try{
            if(Array.isArray(restrictions)) restrictions.forEach(field => {
                if(Array.isArray(field)) {
                    const key = field[0] ;;
                    if(key) {
                        const value = field[1] ;;
                        if(undefined !== value && null !== value) {
                            const operator = field[2] ? field[2] : '=' ;;
                            switch(operator.toUpperCase().trim()) {

                                case('//') :
                                    query_filters.push(`REGEXMATCH(LOWER(${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${key}), "${ftext.rx(value.toLowerCase(), 4, '\\\\b', false)}")`);
                                break

                                case('LIKE'||'NOT LIKE'||'!LIKE') :
                                    query_restrictions.push(`${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${key} ${operator} "%${value}%"`)
                                break

                                default :
                                    query_restrictions.push(`${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${key}${operator}'${value}' `)
                                break

                            }
                        }
                    }
                }
            })
            if(Array.isArray(filters)) filters.forEach(field => {
                if(Array.isArray(field)) {
                    const key = field[0] ;;
                    if(key) {
                        const value = field[1] ;;
                        if(undefined !== value && null !== value) {
                            const operator = field[2] ? field[2] : '=' ;;
                            switch(operator.toUpperCase().trim()) {

                                case('//') :
                                    query_filters.push(`REGEXMATCH(LOWER(${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${key}), "${ftext.rx(value.toLowerCase(), 4, '\\\\b', false)}")`);
                                break

                                case('LIKE'||'NOT LIKE'||'!LIKE') :
                                    query_filters.push(`${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${key} ${operator} "%${value}%"`)
                                break

                                default :
                                    query_filters.push(`${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${key}${operator}'${value}' `)
                                break

                            }
                        }
                    }
                }
            })
        } catch(e) {
            console.error(new Date(), this.classname().name, 'querify', e.toString())
            if(VERBOSE > 3) console.trace()
        }
        params.order = params?.order || []
        let res = '' ;;
        res += params.query || `SELECT * FROM ${DB_DRIVER == 'cosmos' ? 'c' : this.classname().name.toLowerCase() + " as a "} `
        if(!params.query || (params.query && !(params.query.toLowerCase().indexOf("where")+1))) {
            res += query_restrictions.length ? ` WHERE ${ query_restrictions.join(` AND `) } ` : ``
            res += query_filters.length ? `${query_restrictions.length ? ' AND (' : ' WHERE ('}${query_filters.join(` OR `)})` : ``
        }
        if(!params.query || (params.query && !(params.query.toLowerCase().indexOf("order")+1))) {
            res += params.order && params.order.length ? `ORDER BY ${DB_DRIVER == 'cosmos' ? 'c.' : 'a.'}${params.order[0]} ${params.order[1]||'DESC'}` : ''
        }
        console.log(res)
        return res
    }

    static async list(order, conn) {
        conn = this.dbconf(conn);
        if(DB_DRIVER == 'fstore') {
            const  db = await DB.load(conn) ;;
            let all = db.all() ;;
            if(order && Array.isArray(order) && order[0]) all = all.sort((a, b) => order[1] == "desc" ? a[order[0]].localeCompare(b[order[1]]) : b[order[0]].localeCompare(a[order[1]]))
            return all
        } else {
            const classtype = this.classname() ;;
            let items = [];
            const db = await DB.load(conn) ;;
            if(db) return await db.iterator(Entity.querify({ order }), classtype.cls)
        }
    }

    static async count(filter, conn) {

        const
        db = await DB.load(this.dbconf(conn))
        , query = Entity.querify(filter).replace(`SELECT *`, `SELECT COUNT(1)`).split('ORDER')[0].trim()
        , res = db ? await db.count(query) : 0
        ;;
        return { found: res }

    }

    static async ls(order, dir, conn) {
        return await this.list(order, conn)
    }

    static async load(id, conn) {
        conn = this.dbconf(conn);
        let item = null;
        const
        db = await DB.load(conn)        
        ;;
        if(DB_DRIVER == 'fstore') {
            item = db.get(id)
        } else {
            const 
            classtype = this.classname()
            , filters = [ [ 'id', id, '='] ]
            ;;
            if(DB_DRIVER == 'cosmos' && conn.pk) filters.push([ 'pk', conn.pk ]) ;
            if(db) {
                console.log({db})
                const tmp = (await db.query(classtype.cls.querify({filters}), classtype.cls))
                if(tmp.status) item = tmp.items[0]
            } else console.error(new Date(), classtype.name, `load`, 'the database object is not present')
        }
        return item
    }

    async drop(conn){
        console.warn(this.classname().name, 'drop', this.id);
        conn = this.dbconf(conn);
        var res = null;
        const db = await DB.load(conn) ;;
        try {
            res = await db.drop(this.id)
        } catch(e) {
            console.error(new Date(), this.classname().name, `drop`, e.toString());
            if(VERBOSE>3) console.trace(e)
        }
        return res
    }

    static async drop(id, pk, conn) {
        return (await this.classname().cls.load(id, pk, conn))?.drop()
    }

    static async filter(filters, restrictions, order, conn) {

        conn = this.dbconf(conn);
        const classtype = this.classname() ;;

        var items = [];
        try {
            const db = await DB.load(conn) ;;
            items = await db.query(this.classname().cls.querify({ filters, restrictions, order }), classtype.cls)
        } catch(e) {
            console.trace(e)
            items = []
        }
        return items
    }

    static async query(query, conn) {

        conn = this.dbconf(conn);
        const classtype = this.classname() ;;

        var items = [];
        try {
            const db = await DB.load(conn) ;;
            items = await db.query(query, classtype.cls)
        } catch(e) {
            console.error(new Date(), classtype.name, "query", e.toString())
            if(VERBOSE > 2) console.trace(e)
            items = []
        }
        return items
    }

    static async list_by_status(status_=EStatus.ACTIVE, conn) {
        return await this.filter(null, [ [ "status_", status_ ] ], null, conn)
    }

    static async list_actives(conn) {
        return await this.list_by_status(EStatus.ACTIVE, conn)
    }

    static async lsa(conn) {
        return await this.list_by_status(EStatus.ACTIVE, conn)
    }

    static async list_by_type(type_=ESourceTypes.NOT_SET, conn) {
        return await this.filter(null, [ [ "type_", type_ ] ], null, conn)
    }

    static async iterator(config={}, conn) {
        conn = this.dbconf(conn);
        const
        db = await DB.load(conn)
        , { nextToken } = config
        ;;
        return await db.iterator(
            this.querify(config)
            , this.classname().cls
            , { nextToken }
        )
    }

    static async bulk(items, conn) {

        conn = this.dbconf(conn);
        var classtype = this.classname(), res = 0;
        try {
            const
            db = await DB.load(conn)
            ;;
            res = await db.bulk(items)
        } catch(e) {
            console.error(new Date(), this.classname().name, 'bulk', e.toString())
            if(VERBOSE>3) console.trace(e)
        }
        return res
    }

    // @override
    static async sync_items(items, conn) {
        conn = this.dbconf(conn) ;;
        var classtype = this.classname(), res = new farray();
        const db = await DB.load(conn) ;;
        res = await db.itemlist(items, classtype.cls)
        return res
    }

    static async fields() {
        const db = await this.pipe() ;;
        return await db.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='${this.classname().name}'`)
    }

}

module.exports = Entity