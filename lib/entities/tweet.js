const
IO = LIB('io') 
, Article = LIB('entities/article')
, TW_PATH = ROOT + 'var/tweets/'
;;
module.exports = class Tweet extends Article {

    title(x){       if(x) this.title_ = x;      return this.title_      }
    content(x){     if(x) this.content_ = x;    return this.content_    }
    pub_date(x){    if(x) this.pub_date_ = x;   return this.pub_date_   }
    is_shared(x){   if(x) this.is_shared_ = x;  return this.is_shared_  }
    retweeted(x){   if(x) this.retweeted_ = x;  return this.retweeted_  }
    favorited(x){   if(x) this.favorited_ = x;  return this.favorited_  }
    entities(x){    if(x) this.entities_ = x;   return this.entities_   }

    async save(force=false){ 
        (await Tweet.list(null))
        if(this.validate()){
            this.export('var/tweets/' + this.uid(), force)
            const tmp = this.mime()
            delete tmp.content_
            delete tmp.title_
            return tmp._Save(APP_DBASE + 'Tweets')
        }
        return false
    }

    validate(){ return this.uid() && this.title() && this.content() && this.pub_date() }

    static async list(src_id){
        const
        ls = await (new this)._List(APP_DBASE + 'Tweets')
        ;;
        return !src_id ? ls : ls.extract(tw => tw.source() == src_id ? tw : false)
    }

    static async load(id){
        const
        item = await this._Load(APP_DBASE + 'Tweets/' + id)
        , path = ROOT + 'var/tweets/' + item.uid()
        , ret = IO.exists(path) ? new Tweet(IO.jout(path)) : null
        ;;
        return ret
    }

}