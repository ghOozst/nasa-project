const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const api = require('./routes/api');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(morgan('combined'));

//Parsing all json objects future incoming requests
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/v1', api);

/* if a certain route does not exist in the routers above
   then the get handler will manage it because react can handle
   the routing by itself because of the route is '/*' */
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


module.exports = app;

