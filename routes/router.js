var express = require('express');
var path = require('path')
var router = express.Router();


router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'public/index.html'))
    console.log('GetTokens: ', req)
});

router.get('/error', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'public/error.html'))
});

module.exports = router;