/*---------------------------------------------------------------------------------------------
 * Classname
 *--------------------------------------------------------------------------------------------*/

const
VERBOSE  = false
, IO = require('../utils/fio')
, fobject = require('../utils/fobject')
;;

module.exports = class Classname extends fobject {

    classname(){
        return { name: this.constructor.name.toLowerCase(), cls: this.constructor }
    }

    static classname(){

        const
        name = this.toString().replace(/\n+/gui, ' ').split(/\s+/gui)[1].trim().toLowerCase()
        ;;

        var cls;
        [
            'lib/entities'
            , 'lib/models'
            , 'lib/utils'
            , 'lib/interfaces'
        ].forEach(prefix => {
            if(IO.exists(prefix + '/' + name + '.js')) cls = require('../../' + prefix + '/' + name)
        })

        return { name, cls }
    }

}