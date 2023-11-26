global.SOCKET = process.env.SOCKET || 9000

const
ws = require('ws')
, io = require('./utils/io')
, fobject = require('./utils/object')
;;
global.fsockrooms = fobject.cast({ global: new Set() })

module.exports = server => {
    const sockserver = new ws.Server({ server }) ;;
    sockserver.on('connection', socket => {
        
        if(!fsockrooms[`global`].has(socket)) fsockrooms[`global`].add(socket)

        socket.on('close', _ => Object.keys(fsockrooms).forEach(room => fsockrooms[room].has(socket) ? fsockrooms[room].delete(socket) : null))
        socket.on('message', async data => {

            try { data = JSON.parse(data) } catch(error) { data = null }
            let res = { emitter: data.emitter } ;;

            if(data?.path && data.path != '/') {
                const
                path = data.path.split(/\//gu)
                , classname = path.splice(0, 1)[0]
                , method = path.length ? path.splice(0, 1)[0] : "init"
                ;;
                if(classname && method) {
                    if(io.exists(EPaths.CONTROLLERS + classname + '.js')) {
                        const
                        cls = require(EPaths.CONTROLLERS + classname)
                        , args = fobject.blend({}, data, { params: path }, { emit: r => socket.send(JSON.stringify(fobject.blend({}, { emitter: res.emitter }, { data: r }))) })
                        ;;

                        let tmp ;;
                        try {
                            tmp = cls[method](args)
                            if(tmp instanceof Promise) tmp = await tmp
                            res.data = tmp
                        } catch(e) {
                            if(VERBOSE>2) {
                                console.log(`class/method execution failed: ${classname}/${method}`)
                                console.trace(e)
                            }
                            res.error = 1
                            res.data = `class/method execution failed: ${classname}/${method}`
                        }
                    } else {
                        res.error = 2
                        res.data = `class didn't fount: ${classname}`
                    }
                } else {
                    res.error = 3
                    res.data = `classname or method missing: ${classname}|${method}`
                }
                socket.send(JSON.stringify(res))
            }

        })
    })
    return sockserver
}