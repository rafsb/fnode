global.SOCKET = process.env.SOCKET || 9000

const
ws = require('ws')
, io = require('./utils/fio')
, fobject = require('./utils/fobject')
, rooms = {}
;;

module.exports = server => {
    const sockserver = new ws.Server({ server }) ;;
    sockserver.on('connection', socket => {
        socket.on('close', _ => Object.values(rooms).forEach(room => room.delete(socket)))
        socket.on('message', async data => {

            try { data = JSON.parse(data) } catch(error) { data = null }
            let res = { emitter: data.emitter } ;;

            if(data?.room) {
                if(!rooms[data.room]) rooms[data.room] = new Set()
                rooms[data.room].add(socket)
                Array.from(rooms[data.room]).forEach(sock => sock != socket ? sock.send(JSON.stringify({ data: { clients: Array.from(rooms[data.room]).length } })) : null)
                socket.send(JSON.stringify({ data: { status: true, clients: Array.from(rooms[data.room]).length } }))
            }

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
                        , args = fobject.blend({}, data, { params: path })
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