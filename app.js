var express = require('express')
var bodyParser = require("body-parser");
var router = require('./routes/router')
var activityRoutes = require('./routes/activityRoutes')
var app = express()
var path = require('path')

app.set('port', process.env.PORT || 3000);
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.json());

app.use(express.static(path.join(__dirname + '/public')));

app.use('/', router);



app.use('/journeybuilder/', activityRoutes);

var server = app.listen(3000, function () {
    console.log('Node server is running..');
});