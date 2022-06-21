/*---------------------------------------------------------------------------------------------
 * Cosmos
 *--------------------------------------------------------------------------------------------*/

require('../../etc/database/credentials');

const
START = true
, WAIT_TIME = 6000
// LIBS
, https  = require('https')
, Cosmos = require('@azure/cosmos').CosmosClient
, { Spum, FObject, FArray, FDate } = require('../spum')

// MACROS
, CosmosDB      = conf => new Cosmos({
    endpoint    : conf && conf.endpoint ? conf.endpoint : DB_ENDPOINT
    , key       : conf && conf.key ? conf.key : DB_KEY
    , agent     : new https.Agent({ rejectUnauthorized: false })
    , primaryConnectionString: `AccountEndpoint=${DB_ENDPOINT};AccountKey=${DB_KEY}`
})

;;

module.exports = class Cosmos_Traits {

    client(){
        return this._CosmosClient
    }

    async item(item_id, pk) {
        try {
            if(!item_id) return Fail('Cosmos', 'item', 'item_id is required');
            const { resource: item } = await this.container.item(item_id, pk||null).read()
            return item;
        } catch(e) {
            Err('Cosmos', 'itemlist', e.toString());
            if(VERBOSE>2) console.trace(e);
            return FArray.cast()
        }
    }

    async itemlist(item_ids, type=FObject) {
        try {
            if(!Array.isArray(item_ids)) item_ids = [item_ids];
            return await (await this.query(`SELECT * FROM c WHERE c.id IN ("${item_ids.join('","')}")`, type))
        } catch(e) {
            Err('Cosmos', 'itemlist', e.toString());
            if(VERBOSE>2) console.trace(e);
            return FArray.cast()
        }d
    }

    async count(filter){
        try {
            const res = await this.query(filter||'SELECT count(1) FROM c') ;;
            return res && res[0] && res[0]['$1'] ? res[0]['$1'] : 0;
        } catch(e) {
            Err('Cosmos', 'count', e.toString());
            if(VERBOSE>2) console.trace(e);
            return 0
        }

    }

    async query(q, type=FObject, cfg) {
        try {
            const { resources } = await this.container.items.query(q, cfg).fetchAll()
            return FArray.cast(resources.map(i => type.cast(i)))
        } catch(e) {
            Err('Cosmos', 'query', e.toString());
            if(VERBOSE>2) console.trace(e);
            return FArray.cast()
        }
    }

    async save(item, tryes=3) {
        try{
            if(!item||!tryes) return false;
            if(!this.container) return Fail('Cosmos', 'save', 'no container given');
            item.modified_ = FDate.now().getTime();
            item = (await this.container.items.upsert(Spum.blend({
                id: item.id || (md5(FDate.now() + (item.name_||'')))
                , created_: FDate.now().getTime()
            }, item))).resource;
            return item || false
        } catch(e) {
            Err('Cosmos', 'save', e.toString());
            if(VERBOSE>2) console.trace(e);
            const me = this ;;
            return new Promise(pass => setTimeout(async _ => pass(await me.save(item, tryes-1)), WAIT_TIME))
        }
    }

    async bulk(items, counter=-1){

        const
        me = this
        , cfg = etc('database.credentials')
        , now = new FDate()
        ;;

        var counter = counter==-1 ? (cfg.N_TRYIES || N_TRYIES) : counter ;;

        if(DB_LOCK >= (cfg.N_PROCESS || DB_LOCK_MAX_COUNT)) {
            if(counter) return new Promise(pass => setTimeout(async _ => pass(await me.bulk(items, counter-1)), (cfg.WAIT_TIME || WAIT_TIME) + Math.random() * (cfg.WAIT_TIME || WAIT_TIME)));
            else return Fail(`Cosmos`, `bulk`, `max time exeeded`)
        }

        try {
            DB_LOCK++;
            Info(`DATABSE`, ` LOCK `, `(at ${now.as('Y/m/d h:i:s')})`, ETerminalColors.BG_WHITE);
            const res = new FArray() ;;
            for(let i=0; i<items.length; i++) {
                const tmp = await this.save(items[i]) ;;
                res[i] = tmp
            }
            DB_LOCK = Math.max(0, DB_LOCK-1);
            Info(`DATABSE`, ` RELEASE `, `(elapsed time: ${parseInt((FDate.time() - now.time())/1000).toFixed(1)}s)`, ETerminalColors.BG_WHITE);
            return res
        } catch(e) {
            DB_LOCK = Math.max(0, DB_LOCK-1);
            Warn(`Cosmos', 'bulk`, `DB_LOCK released ${DB_LOCK}`);
            if(VERBOSE>2) console.trace(e);
        }

        return ret
    }

    async next(){

        try{

            const cfg = { maxItemCount: this._Iterator_Chunksize } ;;
            if(this._Iterator_PartitionKey) cfg.partitionKey = this._Iterator_PartitionKey;
            if(this.hasMoreResults) cfg.continuationToken = this.continuationToken;

            var
            ls = await this.container.items.query(this._Iterator_Query, {...cfg}).fetchNext()
            ;;

            this.hasMoreResults = ls.hasMoreResults && ls.continuationToken;
            this.continuationToken = ls.continuationToken;

            const
            items = FObject.cast()
            ;;

            for(let i in ls.resources) {
                var item = this._Iterator_Class.cast(ls.resources[i]);
                if(this._Iterator_Callback) item = this._Iterator_Callback(item, i * 1 + this._Iterator_Counter, this._Iterator_Step);
                items[item.id+item[item.partition_]] = item
            }
            ;;

            this._Iterator_Counter += items.array().length;
            this._Iterator_Step++;

            return {
                items: items.array()
                , hasMoreResults: this.hasMoreResults
                , query: this._Iterator_Query
                , chunkSize: this._Iterator_Chunksize
            }
        } catch (e){
            Err('Cosmos', 'next', e.toString());
            if(VERBOSE>2) console.trace(e);
            return {
                items: FArray.cast()
                , hasMoreResults: false
                , query: this._Iterator_Query
                , chunkSize: this._Iterator_Chunksize
            }
        }
    }

    iterator(callback, query='SELECT * FROM c', chunkSize=1000, cls=FObject, pk=null){

        if(!callback) callback = i => i;
        this._Iterator_Callback = callback;

        if(!chunkSize || chunkSize<=0) chunkSize = 200;
        this._Iterator_Chunksize = chunkSize;

        if(!query) query = 'SELECT * FROM c';
        this._Iterator_Query = query;
        this._Iterator_Class = cls;

        this._Iterator_Step = 0;
        this._Iterator_Counter = 0;
        if(pk) this._Iterator_PartitionKey = pk;

        return this

    }

    static cast(obj){
        const o = new Cosmos_Traits() ;;
        for(let i in obj) o[i] = obj[i];
        return o
    }


    static async load(conf) {

        try{

            if(typeof conf == 'string'){
                if(IO.exists(`etc/cosmos/conf/${conf}.json`)) conf = IO.jout(`etc/cosmos/conf/${conf}.json`);
                else {
                    Warn(`Cosmos`, `load`, `${conf} do not apppear to be a valid config file, fallingback to defults where ${conf} is considerd a container`);
                    conf = { container: conf }
                }
            }
            const
            _CosmosClient = CosmosDB(conf)
            , _DatabaseID = conf && conf.db ? conf.db : DB_NAME
            , _ContainerID = conf && conf.container ? conf.container : DB_TABLE
            , _PartitionKey = conf && conf.pk ? conf.pk : DB_PK
            ;;
            const
            database = (await _CosmosClient.databases.createIfNotExists({ id: _DatabaseID })).resource
            , container = (await _CosmosClient.database(database.id).containers.createIfNotExists({
                id: _ContainerID
                , partitionKey: (_PartitionKey[0] == `/` ? `` : `/`) + _PartitionKey
            })).resource
            , res = {
                _DatabaseID
                , _ContainerID
                , _PartitionKey
                , _CosmosClient
                , database:     _CosmosClient.database(database.id)
                , container:    _CosmosClient.database(database.id).container(container.id)
            }
            ;;

            return Cosmos_Traits.cast(res)

        } catch(e) {
            Err(`Cosmos`, `load`, e.toString());
            if(VERBOSE>2) console.trace(e);
            DB_LOCK = 0
        }
    }

}