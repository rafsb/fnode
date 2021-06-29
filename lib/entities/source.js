const
FDate = LIB('faau').FDate
, Entity = require('./entity')
;;
/***************************
    id
    name
    host
    uri
    type
    status
    created
    modified
 ***************************/

module.exports = class Source extends Entity {
    
    static list(){ return (new this)._List(APP_DBASE + 'Sources') }
    static async load(id){ const src = await this._Load(APP_DBASE + 'Sources/' + id); return src }
    async save(){
        (await Source.list(null))
        return this._Save(APP_DBASE + 'Sources') 
    }

    name(x){ if(x) this.name_ = x; return this.name_    }
    host(x){ if(x) this.host_   = x; return this.host_     }
    uri(x){ if(x) this.uri_   = x; return this.uri_     }
    type(x){ if(x) this.type_ = x; return this.type_    }
    
    validate(){
        if(
            this.uid()  &&
            this.uri()  &&
            this.type()
        ) return true
        return false
    }

}