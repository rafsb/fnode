const
{ Spum, FArray, FDate } = LIB('spum')
// , IO   = LIB('io')
// , msie = require('microsoft-identity-express')
// , msid = new msie.WebAppAuthClientBuilder(IO.jout('etc/msid/credentials.json')).build()
;;

module.exports = class User {

    static pass(){
        return SESSION.isAuthenticated && true
    }

    static info(){
        return SESSION.isAuthenticated ? SESSION.account : null
    }

}