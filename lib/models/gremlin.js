const { isObject } = require('util');

const
https = require('https')
, Gremlin = require('gremlin')
, GremlinOptions = {
    endpoint: 'ws://localhost:8901/gremlin'
    , key:    'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
    , agent:  new https.Agent({ rejectUnauthorized: false })
    , db:     'SP'
    // , primaryConnectionString: 'AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
}
;;

module.exports = class Gremlin_Traits {
    constructor(dbstr) {
        if(dbstr){
            if(dbstr.indexOf('/')+1) dbstr = dbstr.split('/')
            else dbstr = [ GremlinOptions.db, dbstr ]
        } else return console.log('Gremlin_Traits::init > no string connector given');
        const 
        authenticator = new Gremlin.driver.auth.PlainTextSaslAuthenticator(`/dbs/${dbstr[0]}/colls/${dbstr[1]}`, GremlinOptions.key)
        , client = new Gremlin.driver.Client(
            GremlinOptions.endpoint
            , { 
                authenticator,
                traversalsource : "g",
                rejectUnauthorized : false,
                mimeType : "application/vnd.gremlin-v2.0+json"
            }
        )
        ;;    

        this.sock = client
    }

    static get Object () {
        return Gremlin
    }
}
;;
