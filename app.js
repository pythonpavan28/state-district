const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "covid19India.db");
app.use(express.json());
let db = null;

const result = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("The server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error at ${e.message}`);
    process.exit(1);
  }
};

result();

//API 1 GET

app.get("/states/", async (request, response) => {
  const listOfAllStates = `SELECT * FROM state`;
  const listDetails = await db.all(listOfAllStates);
  response.send(listDetails);
});
//API 2 GET
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const oneState = `SELECT * FROM state WHERE state_id = ${stateId}`;
  const oneStateData = await db.get(oneState);
  response.send(oneStateData);
});

//API 3 POST

app.post("/districts/", async (request, response) => {
  const details = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = details;
  const addingDistrict = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
    VALUES ('${districtName}',${stateId},${cases},${cured},${active},${deaths})`;
  const districtAdded = await db.run(addingDistrict);
  response.send("District Successfully Added");
});

// API 4 GET
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const gettingDistrict = `SELECT * FROM district WHERE district_id = ${districtId}`;
  const givenDistrict = await db.get(gettingDistrict);
  response.send(givenDistrict);
});

//API 5 DELETE

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrict = `DELETE FROM district WHERE district_id = ${districtId}`;
  await db.get(deleteDistrict);
  response.send("District Removed");
});

//API 6 PUT

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updatingDistrict = `UPDATE district SET 
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE district_id = ${districtId}
  `;
  const update = await db.run(updatingDistrict);
  response.send("District Details Updated");
});

//API 7 GET
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const details = `SELECT SUM(cases),SUM(cured),SUM(active),SUM(deaths) FROM 
  district WHERE state_id = ${stateId}
  `;
  const stats = await db.get(details);

  console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API 8 GET
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictId = `SELECT state_id FROM district
   WHERE district_id = ${districtId}`;

  const getDistrictIdResponse = await db.get(getDistrictId);

  const getStateName = `SELECT state_name AS stateName FROM state
    WHERE state_id = ${getDistrictIdResponse.state_id} `;
  const getStateNameResponse = await db.get(getStateName);
  response.send(getStateNameResponse);
});

module.exports = app;
