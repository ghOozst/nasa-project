const { getAllLaunches, 
        abortLaunchById,
        existsLaunchWithId,
        scheduleNewLaunch} = require('../../models/launches.model');
const { getPagination } = require('../../services/query');


async function httpGetAllLaunches (req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  res.status(200).json(launches);
  /*Converting the data from the map object into an array with
  the purpose of at end also convert it to json*/
} 

async function httpAddNewLauch (req, res) {
  const launch = req.body;

  if (!launch.mission || !launch.rocket || !launch.launchDate
    || !launch.target) {
    // 400 code means that something in the content of the request is invalid
    return res.status(400).json({
      error: 'Missing required launch property'
    });
  }
  launch.launchDate = new Date(launch.launchDate);

  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date'
    });
  }
  await scheduleNewLaunch(launch);
  //201 code means that the creation of the lauch was successful
  return res.status(201).json(launch);
}

async function httpAbortLaunch (req, res) {
  const launchId = Number(req.params.id);
  const existsLaunch = await existsLaunchWithId
  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found'
    });
  }
  
  const aborted = await abortLaunchById(launchId);

  if(!aborted) 
    return res.status(400).json({
      error: 'Launch not aborted'
    })

  return res.status(200).json({
    ok: true
  })
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLauch,
  httpAbortLaunch
};