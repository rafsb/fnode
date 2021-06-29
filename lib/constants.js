global.APP_LOCALE = "pt-br";
global.APP_DBASE  = "SP/";
global.LIB  = name => require(EPaths.LIB + name);
global.APP  = name => require(EPaths.APP + name);
global.CTRL = name => require(EPaths.CONTROLLERS + name);

global.EPaths = Object.freeze({
    APP:                ROOT + 'app/'
    , CONFIG:           ROOT + 'cfg/'
    , LIB:              ROOT + 'lib/'
    , TEMPLATES:        ROOT + 'lib/templates/'
    , MODELS:           ROOT + 'app/models/'
    , CONTROLLERS:      ROOT + 'app/controllers/'
    , COLLECTORS:       ROOT + 'app/controllers/collectors/'
    , WEBROOT:          ROOT + 'app/webroot/'
    , ASSETS:           ROOT + 'app/webroot/assets/'
    , WEBCONTROLLERS:   ROOT + 'app/webroot/controllers/'
    , WEBVIEWS:         ROOT + 'app/webroot/views/'
})

global.EPageTypes = {
    INDEX: 1
    , SELF: 2
}

global.ESourceTypes = Object.freeze({
    RSS                 : 1
    , TWITTER           : 2
    , WGET              : 3
    , CRAWLER           : 4
})

global.EStatus = Object.freeze({
    ACTIVE              : 1
    , INACTIVE          : 2
    , REMOVED           : 3
    , CANCELED          : 4
    , BROKEN            : 5
    , FROZEN            : 6
    , UNDER_REVIEW      : 7
    , ERROR             : 8
    , UNDEFINED         : 9
})

global.E_RSS_ALTERNATIVE_DATE_FORMATS = ["ddd, DD MMM YYYY HH:mm:ss +-HHmm"];

/*   Cron like notation:
 *   -------------------- min 0~59
 *   | ------------------ hour 0~23
 *   | | ---------------- day 1~31
 *   | | | -------------- month 1~12 
 *   | | | | ------------ dayweek 0~6 -> sunday=0
 *   | | | | |
 * [ * * * * * ] CAUTION: (*) means every! 
 */
global.ESchedules = Object.freeze({
    QUARTER_HOUR        : '0,15,30,45 * * * *'
    , HALF_HOUR         : '0,30 * * * *'
    , HOURLY            : '0 * * * *'
    , TWICE_PER_DAY     : '0 0,12 * * *'
    , DAILY             : '0 0 * * *'
    , TWICE_PER_WEEK    : '0 0 * * 3,5'
    , WEEKLY            : '0 0 * * 5'
    , TWICE_PER_MONTH   : '0 0 1,15 * *'
    , MONTHLY           : '0 0 1 * *'
    , TWICE_PER_YEAR    : '0 0 1 1,6 *'
    , YEARLY            : '0 0 1 1 *'    
})

module.exports = null