const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require('./planets.mongo');

const isHabitablePlanet = (planet) => {
  const { koi_disposition, koi_insol, koi_prad } = planet;
  return (
    //Checking if the planet is confirmed to be habitable
    koi_disposition === "CONFIRMED" &&
    //Cheking if it gets the enough amount of sun light
    koi_insol > 0.36 &&
    koi_insol < 1.11 &&
    //Checking if it's not too big
    koi_prad < 1.6
  );
};

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    //Reading the data from the csv
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      //parsing the data from the buffer
      .pipe(
        parse({
          //stablishing that the # character is used for comments
          comment: "#",
          //Telling that we want to the data in objects
          columns: true,
        })
      )
      .on("data", async (planet) => {
        if (isHabitablePlanet(planet)){
          await savePlanet(planet);
        }
      })
      .on("error", (err) => reject(err))
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`${countPlanetsFound} are habitable`);
        resolve();
      });
  });
}

const getAllPlanets = async () => 
  await planets.find({},{
    __v: 0, _id: 0
  });
  //excluding the fields __v and _id from the request

async function savePlanet(planet) {
  try {
    /* if the planet already exists nothing will happen, but
    if it doesn't it will insert it*/
    await planets.updateOne({
      //Searching by name
      keplerName: planet.kepler_name
    }, {
      //if finds one that maches, updates the document
      keplerName: planet.kepler_name
    }, {
      //if it doesn't find it, creates a new document
      upsert: true          
    // upsert => update + insert
  });
  } catch (error) {
    console.error(`Could not save planet ${err}`);
  }
}
module.exports = {
  loadPlanetsData,
  getAllPlanets
};
