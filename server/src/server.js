const http = require('http');

//Populates with the value in the .env file inside the process.env property
require('dotenv').config();

const app = require('./app');
const { loadPlanetsData } = require('./models/planets.model');
const { loadLaunchesData }  = require('./models/launches.model');
const { mongoConnect } = require('./services/mongo');

const PORT = process.env.PORT || 8000;


/*Express is actually a listener and can be added to the http server
by just passing it in to the parameters of the createrServer method
to add all express functionality*/
const server = http.createServer(app);

/*what once method does is listens for the event to occur and when it
  happens the first time it stops listening */ 

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();