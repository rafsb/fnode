const { Logger } = require('mongodb');

const
FDate    = LIB('faau').FDate
, Entity = require('./entity')
, IO     = LIB('io')
, ART_PATH = ROOT + 'var/articles/'
;;
/***************************
    id:          char*
    title:       string
    content:     string
    pub_date:    date
    access_date: date
    source:      Sources::id
***************************/

module.exports = class Article extends Entity {

    title(x){ if(x) this.title_ = x; return this.title_ }
    content(x){ if(x) this.content_ = x; return this.content_ }
    pub_date(x){ if(x) this.pub_date_ = x; return this.pub_date_ }
    access_date(x){ if(x) this.access_date_ = x; return this.access_date_ }

    validate(){
        if(
            this.uid()         &&
            this.title()       &&
            this.content()     &&
            this.pub_date()    &&
            this.source()
        ) return true
        return false
    }

    static async list(src_id){
        const
        ls = await (new this)._List(APP_DBASE + 'Articles')
        ;;
        return !src_id ? ls : ls.extract(art => art.source() == src_id ? art : false)
    }

    static async load(id){
        const
        item = await this._Load(APP_DBASE + 'Articles/' + id)
        , path = ROOT + 'var/articles/' + item.uid()
        , ret = IO.exists(path) ? new Article(IO.jout(path)) : null
        ;;
        return ret
    }
    
    async save(force=false){ 
        (await Article.list(null))
        if(this.validate()){
            this.export('var/articles/' + this.uid(), force)
            const tmp = this.mime()
            delete tmp.content_
            delete tmp.title_
            const has = await Article.load(tmp.uid()) ;;
            return force || !has ? (await tmp._Save(APP_DBASE + 'Articles')) : LOG('Article::save > (( ' + this.uid() + ' )) already exists on base')
        }
        return false
    }
}