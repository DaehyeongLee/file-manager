const router = require('express').Router();

router.use('/account', require('./account'));
router.use('/files', require('./files'));
router.use('/chat', require('./chat'));
module.exports = router;