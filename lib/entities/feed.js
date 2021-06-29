const
Moment = require('moment')
, Entity = require('./entity')
, IO = LIB('io')
;;
/***************************
    this.id = null;
    this.title = null;
    this.content = null;
    this.pub_date = null;
    this.link = null;
    this.image_url = null;
***************************/

module.exports = class Feed extends Entity {

    title(x){ if(x) this.title_ = x; return this.title_ }
    content(x){ if(x) this.content_ = x; return this.content_ }
    pub_date(x){ if(x) this.pub_date_ = x; return this.pub_date_ }
    image_url(x){ if(x) this.image_url_ = x; return this.image_url_ }
    link(x){ if(x) this.link_ = x; return this.link_ }
    source_name(x){ if(x) this.source_name_ = x; return this.source_name_ }
    source_type(x){ if(x) this.source_type_ = x; return this.source_type_ }
    source_link(x){ if(x) this.source_link_ = x; return this.source_link_ }

    validate(){
        if(
            this.title()       &&
            this.content()     &&
            this.pub_date()    &&
            this.link()
        ) return true
        return false
    }
    
    /**
     * Parse and treat all RSS dates possibles formats used by different sources
     * @param {string} date 
     * @returns Moment
     */
    parseDate(string_date, locale) {        
        let return_;
        try{
            return_ = Moment(string_date, "", [locale]);

            if( ! return_.isValid()) {
                E_RSS_ALTERNATIVE_DATE_FORMATS.every(format => {
                    return_ = Moment(string_date, format, [locale]);
                    if(return_.isValid()) {
                        return false;
                    }
                })
            }
        } catch(e){ IO.log('Feed::parseDate > ' + JSON.stringify(e), 'feed-error.log') }
        return return_;
    }

    /**
     * LEGACY from feedEntity
     */
     setPubDate(string_date, locale="pt-br") {
        this.pub_date_ = this.parseDate(string_date, locale);
        return this.pub_date_;
    }
    
    static async list(src_id){
        const
        ls = await (new this)._List(APP_DBASE + 'Feeds')
        ;;
        return !src_id ? ls : ls.extract(art => art.source() == src_id ? art : false)
    }

    static async load(id){
        const
        item = await this._Load(APP_DBASE + 'Feeds/' + id)
        , path = ROOT + 'var/feeds/' + item.uid()
        , ret = IO.exists(path) ? new Feed(IO.jout(path)) : null
        ;;
        return ret
    }
    
    async save(force=false){ 
        (await Feed.list(null))
        if(this.validate()){
            this.export('var/feeds/' + this.uid(), force)
            const tmp = this.mime()
            delete tmp.content_
            delete tmp.title_
            const has = await Feed.load(tmp.uid()) ;;
            return force || !has ? (await tmp._Save(APP_DBASE + 'Feeds')) : LOG('Feed::save > ' + this.uid() + ' already exists on base')
        }
        return false
    }

}