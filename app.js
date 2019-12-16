'use strict';

const path = require('path');
const express = require('express');
const model = require('./model-datastore0');

const app = express();

app.use(express.urlencoded());

app.use(express.json());

app.disable('etag');
app.set('trust proxy', true);


app.get('/api/download/csv', (req, res) => {
  model.list(5000, (err, savedData) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.setHeader('Content-type', "text/csv;charset=utf-8");

    let headerAdded =  false, csvData = "";
    csvData = savedData.map(e=>{
      let line = "";
      if(!headerAdded){
        line += Object.keys(e).join(",") + "\n"
        headerAdded = true;
      }
      line += Object.values(e).join(",");
      return line;
    }).join("\n");
    res.status(200).send(csvData);
  });
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
