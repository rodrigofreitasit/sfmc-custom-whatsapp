var express = require('express')
var bodyParser = require("body-parser");
var http = require('http');
var router = require('./routes/router')
var activityRoutes = require('./routes/activityRoutes')
var app = express()
var path = require('path')

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.raw({
    type: 'application/jwt'
}));
app.use(express.json());

app.use(express.static(path.join(__dirname + '/public')));

if ('development' == app.get('env')) {
    app.use(errorhandler());
}

app.use('/', router);
app.use('/journeybuilder/', activityRoutes);


http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});