var express = require('express');
var path = require('path')
var activityRoutes = express.Router();
const JWT = require(path.join(__dirname, '..', 'lib', 'jwtDecoder.js'));
const axios = require('axios');



activityRoutes.post('/edit', (req, res) => {
    console.log('edit request');
    // logData(req);
    res.send(200, 'Edit');
})


activityRoutes.post('/save', (req, res) => {
    console.log('save request');
    // logData(req);
    res.send(200, 'Save');
})

activityRoutes.post('/execute', (req, res) => {
    JWT(req.body, process.env.jwtSecret, (err, decoded) => {
        // console.log("encoded: ", JSON.stringify(req.body))
        if (err) {
            console.error(err);
            return res.status(401).end();
        }

        if (decoded && decoded.inArguments && decoded.inArguments.length > 0) {
            var decodedArgs = decoded.inArguments[0];

            let data = {
                'from': 'tinted-bird',
                'to': '5511984505745',
                'contents': [{
                    'type': 'template',
                    'templateId': '6ccf46dd-c506-46af-9181-ef69efdc70de',
                    'fields': {
                        'name': decodedArgs.firstName,
                        'productName': decodedArgs.nameProduct,
                        'deliveryDate': '17/08/2022'
                    }
                }]
            };

            const headers = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-TOKEN': process.env.SECRET_API
                }
            }

            let sendPostRequest;
            (sendPostRequest = async () => {
                try {
                    const resp = await axios.post('https://api.zenvia.com/v2/channels/whatsapp/messages', data, headers);
                    console.log(`Success: ${resp.data}`);
                    if (resp.status == 200) {
                        res.status(200).send('Execute')
                    }
                } catch (err) {
                    // Handle Error Here
                    console.error(`Error: ${err}`);
                }
            })();

        } else {
            console.error('inArguments invalid.');
            return res.status(400).end();
        }
    });
})

activityRoutes.post('/publish', (req, res) => {
    console.log('publish request');
    // logData(req);
    res.send(200, 'Publish');
})

activityRoutes.post('/validate', (req, res) => {
    console.log('Validate request');
    // logData(req);
    res.send(200, 'Validate');
})

module.exports = activityRoutes;