const express = require('express');
const { httpGetAllLaunches,
        httpAddNewLauch,
        httpAbortLaunch} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpAddNewLauch);
launchesRouter.delete('/:id', httpAbortLaunch);

module.exports = launchesRouter;