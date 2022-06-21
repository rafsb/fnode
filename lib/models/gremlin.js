const
Gremlin = require('gremlin')
, { cardinality: { single }, t: { id } } = Gremlin.process
, PORT = '8989'
, GremlinOptions = {
    endpoint: `ws://localhost:${PORT}/gremlin`
    // , key:    null //'C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw=='
    // , agent:  new https.Agent({ rejectUnauthorized: false })
    // , db:     'SP'
}
;;

module.exports = class Gremlin_Traits {

    static single = single

    static id = id

    constructor() {
        this.start();
    }

    start(){
        this.g = Gremlin.process.AnonymousTraversalSource.traversal().withRemote(new Gremlin.driver.DriverRemoteConnection(GremlinOptions.endpoint));
        return this.g
    }

}