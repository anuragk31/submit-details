'use strict';

const path = require('path');
const express = require('express');
const model = require('./model-datastore0');

const app = express();

app.use(express.urlencoded());

app.use(express.json());

app.disable('etag');
app.set('trust proxy', true);


app.post('/api/save', (req, res) => {
  debugger;
  const data = req.body;
  data.ip1 = req.client.localAddress;
  data.ip2 = req.client.remoteAddress;
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
