'use strict';

const path = require('path');
const express = require('express');
const model = require('./model-datastore0');
const fs = require('fs');

const app = express();

app.use(express.urlencoded());

app.use(express.json());

app.disable('etag');
app.set('trust proxy', true);


app.get('/api/download/csv', (req, res) => {
    model.list(50000, (err, savedData) => {
        if (err) {
            res.status(500).send(err);
            return;
        }
        res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        res.setHeader('Content-type', "text/csv;charset=utf-8");

        let csvHeaderCollection = {
            phone1: "User Phone Number",
            userType: "User Type",
            phone2: "BDE Pin",
            area: "Area",
            city: "City",
            address: "Full Address",
            ip: "IP Address",
            latitude: "latitude",
            longitude: "longitude",
            remarks: "Remarks"
        };
        let csvListID = ["phone1", "userType", "phone2", "area", "city", "address", "ip", "latitude", "longitude", "remarks"];
        let csvData = "";
        csvData += csvListID.map(id => csvHeaderCollection[id]).join(",") + "\n";
        csvData += savedData.map(entry => csvListID.map(id => "\"" + (entry[id] || "") + "\"").join(",")).join("\n");
        res.status(200).send(csvData);
    });
});

function checkupload(total, fail, pass, errMsg){
    if(errMsg){
        console.log("Error");
        console.log(errMsg);
    }
    console.log(`\n ${fail + pass} of ${total} records processed, ${pass} passed and ${fail} failed`);
    //res.write(`\n ${fail + pass} of ${total} records processed, ${pass} passed and ${fail} failed`);
}


app.get('/api/upload/status', (req, res) => {
    const stringContent = fs.readFileSync('import/data.csv', 'utf8');
    const arrayContent = stringContent.split("\n");
    let fail = 0, pass = 0;

    let dataIndex = 0;
    let cancelIntervalID = setInterval(()=>{
        if(dataIndex == arrayContent.length){
            clearInterval(cancelIntervalID);
        }
        let row = arrayContent[dataIndex];
        if(row && row.length == 10){
            let data = {};
            data.phone1 = row;
            data.manualUpload = true;
            let ID = data.phone1;
            model.read(ID, (err, savedData) => {
                if (err) {
                    model.create(ID, data, (err, savedData) => {
                        if (err) {
                            checkupload(arrayContent.length, ++fail, pass, ID +": create error"+ err);
                        }
                        else{
                            checkupload(arrayContent.length, fail, ++pass);
                        }
                    });
                }else{
                    checkupload(arrayContent.length, ++fail, pass, ID + ": duplicate entry");
                }
            });
        }
        else{
            checkupload(arrayContent.length, ++fail, pass, row + ": Invalid number");
        }
        dataIndex++
    }, 500);
	res.status(200).send(`Job is submitted to upload  ${arrayContent.length} records. It will take around {arrayContent.length/2} minutes to complete`);
});

app.post('/api/save', (req, res) => {
    const data = req.body;
    data.ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);;
    let ID = data.phone1;
    model.read(ID, (err, savedData) => {
        if (err) {
            // Save the data to the database.
            model.create(ID, data, (err, savedData) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                res.status(200).send({status: "success", msg:" Saved Successfully"});
            });
            return;
        }
        res.status(500).send({status: "fail", msg:"Duplicte Record"});
    });
});


app.get('/', (req, res) => {
    res.redirect('/submitDetails');
});

app.get('/submitDetails', (req, res) => {
    res.sendFile(path.join(__dirname + '/views/main.html'));
});

// Basic 404 handler
app.use((req, res) => {
    if(req.url.indexOf("static")> -1){
        res.sendFile(path.join(__dirname + req.url));
    }
    else{
        res.status(404).send('Not Found');
    }
});

// Basic error handler
app.use((err, req, res) => {
    console.error(err);
    res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
    // Start the server
    const server = app.listen(8080, () => {
        const port = server.address().port;
        console.log(`App listening on port ${port}`);
    });
}

module.exports = app;
