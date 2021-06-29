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

module.exports = class Schedule extends Entity {
    
    static list(){ return (new this)._List(APP_DBASE + 'Schedules') }
    static async load(id){ const src = await this._Load(APP_DBASE + 'Schedules/' + id); return src }
    async save(){
        (await Schedule.list(null))
        return this._Save(APP_DBASE + 'Schedules')
    }

    description(x){ if(x) this.description_ = x; return this.description_ }
    schedule(x){ if(x) this.schedule_ = x; return this.schedule_ }
    
    validate(){
        if(
            this.uid()       &&
            this.source()    &&
            this.schedule()
        ) return true
        return false
    }

}