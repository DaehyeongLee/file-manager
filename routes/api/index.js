const router = require('express').Router();

router.use('/account', require('./account'));
router.use('/files', require('./files'));
module.exports = router;