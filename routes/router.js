var express = require('express');
var path = require('path')
var router = express.Router();
var GetTokens = require('../public/js/customActivity')

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'public/index.html'))
    console.log('GetTokens: ', GetTokens)
});

router.get('/error', function (req, res) {
    res.sendFile(path.join(__dirname, '../', 'public/error.html'))
});

module.exports = router;