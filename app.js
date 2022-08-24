var express = require('express')
var bodyParser = require("body-parser");
var http = require('http');
var path = require('path')

var router = require('./routes/router')
var activityRoutes = require('./routes/activityRoutes')
var onGetTokens = require('./public/js/customActivity')

var authTokens = onGetTokens.authTokens
var app = express()

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({
    type: 'application/jwt'
}));
app.use(express.json());

app.use(express.static(path.join(__dirname + '/public')));

// if ('development' == app.get('env')) {
//     app.use(errorhandler());
// }

app.use('/', router);
console.log('GetTokens: ', authTokens)
if (!authTokens) {
    console.log('no if: ', authTokens)
} else {
    console.log('else: ', authTokens)
}
app.use('/journeybuilder', activityRoutes);


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});