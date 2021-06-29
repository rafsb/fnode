const
https     = require('https')
, lib     = LIB('faau')
, IO      = LIB('io')
, Faau    = lib.Faau
, FArray  = lib.FArray
, FObject = lib.FObject
, FDate   = lib.FDate
, CosmosClient = require('@azure/cosmos').CosmosClient
, CosmosDB     = NULL => new CosmosClient({
    endpoint:  'https://localhost:8081'
    , key:     'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
    , agent:   new https.Agent({ rejectUnauthorized: false })
    // , primaryConnectionString: 'AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
})
;;

module.exports = class Cosmos_Traits {

    async _Update(item) {
        if (!this.ct_) return IO.log('Cosmos_Traits::_Update -> missing container', 'cosmos-err.log');
        item.modified_ = FDate.now()
        const { resource: uitem } = await this.ct_.item(item.id).replace(item)
        return uitem
    }

    async item(item_id) {
        if (!this.ct_) return IO.log('Cosmos_Traits::item -> missing container', 'cosmos-err.log');
        // const { resource: item } = await this.ct_.item(item_id).read()
        const { resources: item } = await this.ct_.items.query(`SELECT * FROM c WHERE c.id='${item_id}'`).fetchAll()
        return item[0]
    }
    
    async find(q) {
        if (!this.ct_) return IO.log('Cosmos_Traits::find -> missing container', 'cosmos-err.log');
        const { resources } = await this.ct_.items.query(q).fetchAll()
        return FArray.instance(resources)
    }

    async save(item) {
        const 
        has = await this.item(item.id) ;;
        if(has) {
            return this._Update(item);
        }
        item.created_ = item.modified_ = FDate.now()
        const { resource: nitem } = (await this.ct_.items.create(item))
        return nitem
    }

    async connect() {
        if(!(this.did_&&this.cid_)) return IO.log('Cosmos_Traits::init -> missing DID | CID', 'cosmos-err.log');
        const dres = await this.cli_.databases.createIfNotExists({ id: this.did_ })
        this.db_ = dres.database
        const cres = await this.db_.containers.createIfNotExists({ id: this.cid_, partitionKey: null })
        this.ct_ = cres.container
    }

    constructor(path) {
        path      = (path||'/').split('/')
        this.cli_ = CosmosDB()
        this.did_ = path[0]
        this.cid_ = path[1]
        this.db_  = null
        this.ct_  = null
    }
}
;;

