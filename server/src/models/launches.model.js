const axios = require('axios');

const launchesDB = require('./launches.mongo')
const planets = require('./planets.mongo')

const DEFAULT_FLIGHT_NUMBER = 100;

const launches = new Map();

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

const findLaunch = async (filter) => await launchesDB.findOne(filter);

async function populateLaunches() {
  console.log('Downloading launch data');
          //.post(URL, body of the request)
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      //Deactivating the pagination feature
      pagination: false,
      /*populating additional data of the launches*/
      populate: [
        {
          //Population the rocket field with the name
          path: "rocket",
          select: {
            name: 1
          }
        },
        {
          //Populating the payloads field with the customers name
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if(response.status !== 200) throw new Error('Launch data download failed');
   
  const launchDocs = response.data.docs;

  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => payload['customers']);
    //payloads[0].customers = payloads.flatMap((payload) => payload['customers'])
    //Both give the same result
    
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers
    }

    console.log(launch.flightNumber);

    await saveLaunch(launch);
  }


}
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  });

  //Checking if the data of the API is already saved in the database 
  if (firstLaunch) {
    console.log('Launch data already loaded');
    return;
  }

  populateLaunches();
}

const existsLaunchWithId = async (launchId) => 
  await launchesDB.findOne({flightNumber: launchId});

async function getLastFlightNumber() {
  //Finding the last launch created to get the latest flightNumber
  const latestLaunch = await launchesDB
    .findOne()
    .sort('-flightNumber')
    //the '-' simbol is to get the greatest value

    if (!latestLaunch) return DEFAULT_FLIGHT_NUMBER;
    
    console.log(latestLaunch.flightNumber);
    return latestLaunch.flightNumber;
} 

async function getAllLaunches(skip, limit){
  return await launchesDB
    .find({}, {'_id': 0, '__v': 0})
    .sort({flightNumber: 1}) //sorting in ascending
    .skip(skip)
    .limit(limit);
} 

async function saveLaunch(launch) {
  await launchesDB.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true
  });
}


async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) throw new Error('No matching planet was found');

  const newFlightNumber = await getLastFlightNumber() + 1;

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'],
    flightNumber: newFlightNumber,
  });

  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDB.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false
  });
  return aborted.modifiedCount === 1;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId
};