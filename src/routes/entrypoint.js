
const router = require('express').Router() ;;

router.get('/', (_, res) => res.sendFile(EPaths.APP + 'index.html'))
router.get('/error', (_, res) => res.sendFile(EPaths.APP + 'error.html'))

module.exports = router