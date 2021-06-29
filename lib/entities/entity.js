const { Logger } = require("mongodb");

const
IO        = LIB("io")
, lib     = LIB('faau')
, Cosmos  = LIB('models/cosmos')
, FDate   = lib.FDate
, FObject = lib.FObject
, FArray  = lib.FArray
, Faau    = lib.Faau
;;

module.exports = class Entity {

    uid(x){ if(x) this.id = x; return this.id || Faau.nuid(16) }
    status(x){ if(x) this.status_ = x; return this.status_*1 || EStatus.UNDEFINED }
    created(x){ if(x) this.created_ = x; return this.created_ || FDate.now() }
    modified(x){ if(x) this.modified_ = x; return this.modified_ || FDate.now() }
    source(x){ if(x) this.source_ = x; return this.source_ }

    import(src_name){
        const path = EPaths.CONFIG + src_name.replace(/(.json)|(.js)/gi, '') + '.json';
        if(IO.exists(path)){
            FObject.instance(IO.jout(path)).each(src => this[src.key] = src.value)
            this.id = this.id ? this.id : (this.id_ ? this.id_ : Faau.nuid(16))
            delete this.id_
            this.source_ = (src_name.indexOf('/') + 1 ? src_name.split('/')[1] : src_name).replace('.json','')
            this.status_ = this.status_ || EStatus.ACTIVE
            return this
        }
        return IO.log(this.constructor.name + '::import > path not found ' + path) && false
    }

    export(path){ 
        const obj = { ...this };
        if(path) IO.jin(ROOT + path, obj);
        return obj
    }

    mime(){
        return new this.constructor(this.export())
    }

    set(key, value){
        (key && value) && (this[key] = value)
        return this
    }

    static instance(obj){
        return new this.constructor(obj)
    }

    constructor(obj){
        
        this.id = Faau.nuid(16)
        this.status_ =  EStatus.ACTIVE
        this.created_ = FDate.now()
        this.modified_ = this.created()
        if(obj instanceof Object) FObject.instance(obj).each(o => this[o.key] = o.value)
    }

    // @Prototype
    async _Save(path){
        if(!path) return false ;;
        const 
        o = this.export(null)
        , ret = { status: false }
        ;;
        if(o) {
            try {
                const db = new Cosmos(path), conn = await db.connect() ;;
                ret.status = await db.save(o)
                return ret
            } catch(e) { LOG(this.constructor.name + " saving issue > " + JSON.stringify(e, null, 4), true, 'error.log') }
        }
        return ret
    }

    // @Prototype
    async _List(path){        
        const 
        db = new Cosmos(path)
        , conn = await db.connect()
        , items = await db.find('SELECT * FROM c')
        , cls = this.constructor
        ;;
        return items.extract(item => new cls(item))
    }

    // @Prototype
    static async _Load(path){
        path = path.split('/')
        const 
        db = new Cosmos(path[0] + '/' + path[1])
        , conn = await db.connect()
        , item = await db.item(path[2])
        ;;
        return new this(item)
    }
    
    // @override
    static validate(){ return this.export(null) }
    
    // @Override
    static async load(id){  }
    
    // @Override
    static async save(){  }
    
    // @Override
    save(){  }

}