const
Entity = require('./entity')
;;
/***************************
    id	        char(64)
    source	    Sources::id
    description	string
    schedule	ESchedules OR string
    status	    EStatus
    created	    date
    modified	date
 ***************************/

module.exports = class Guide extends Entity {

    static list(){ return (new this)._List(APP_DBASE + 'Guides') }
    static async load(id){ const src = await this._Load(APP_DBASE + 'Guides/' + id); return src }
    async save(){ return this._Save(APP_DBASE + 'Guides') }
    
    instructions(x){ if(x) this.instructions_ = x; return this.instructions_ }
    next(x){ if(x) this.next_ = x; return this.next_ }
    
    validate(){
        if(
            this.uid()          
            && this.source()       
            && this.instructions()
        ) return true
        return false
    }
}