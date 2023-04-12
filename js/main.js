const SIM_ONLINE_URL = "https://api.freeso.org/userapi/avatars/online";
const LOTS_ONLINE_URL = "https://api.freeso.org/userapi/city/1/lots/online";
var LONG_SIM_URL = "";
var LONG_LOTS_URL = "";

document.addEventListener("DOMContentLoaded", getOnline);

// main
async function getOnline(){

    // Grab sims
    const simShort = await grabAPI(SIM_ONLINE_URL);
    LONG_SIM_URL = buildSimLink(simShort);
    const simLong = await grabAPI(LONG_SIM_URL);

    // Grab lots
    const lotShort = await grabAPI(LOTS_ONLINE_URL);
    LONG_LOTS_URL = buildLotLink(lotShort);
    const lotLong = await grabAPI(LONG_LOTS_URL);
    
    // Build sims
    createSimsTable(simLong);
    writeToLabel("Sims Online: ", simShort.avatars_online_count, "sims-online-count-label");

    // Build lots
    lotShort.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);
    createLotsTable(lotShort);
    writeToLabel("Lots Online: ", lotShort.total_lots_online, "lots-online-count-label");
}

// Return json objects from api links
async function grabAPI(apiLink){

    let obj;
    const res = await fetch(apiLink);
    obj = await res.json();

    console.log("Pinged: " + apiLink);

    return obj;
}

// Builds api link from online sim's avatar_id
function buildSimLink(simList){

    var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
    for(i = 0; i < simList.avatars.length; i++){

        simIdString += simList.avatars[i].avatar_id + ",";
    }

    simIdString = simIdString.slice(0, -1);
    return simIdString;
}

// Builds api link from online lot's lot_id
function buildLotLink(lotList){

    var lotIDString = "https://api.freeso.org/userapi/lots?ids=";
    for(i = 0; i < lotList.lots.length; i++){

        lotIDString += lotList.lots[i].lot_id + ",";
    }

    lotIDString = lotIDString.slice(0, -1);
    return lotIDString;
}

// Return sim's age in days
function simDayAge(unixAge){

    const now = Math.round(Date.now() / 1000);
    return Math.round((now - unixAge) / 86400);
}

// Write to online sims table
function createSimsTable(simList){

    const target = document.getElementById('sims-table');

    const tableHead = document.createElement("thead");
    const headRow = document.createElement("tr");
    const thName = document.createElement("th");
    const thAge = document.createElement("th");

    thName.textContent = "Name";
    thAge.textContent = "Age";
    headRow.appendChild(thName);
    headRow.appendChild(thAge);

    tableHead.appendChild(headRow);
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for(i = 0; i < simList.avatars.length; i++){

        const newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdAge = document.createElement("td");

        tdName.textContent = simList.avatars[i].name;
        tdAge.textContent = simDayAge(simList.avatars[i].date) + " days";

        newRow.appendChild(tdName);
        newRow.appendChild(tdAge);

        tableBody.appendChild(newRow);
    }
    target.appendChild(tableBody);
}

// Write to online sims table
function createLotsTable(lotList){

    const target = document.getElementById('lots-table');

    const tableHead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const thName = document.createElement("th");
    const thPop = document.createElement("th");
    thName.textContent = "Name";
    thPop.textContent = "Population";

    headRow.appendChild(thName);
    headRow.appendChild(thPop);

    tableHead.appendChild(headRow);
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for(i = 0; i < lotList.lots.length; i++){

        const newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdPop = document.createElement("td");

        tdName.textContent = lotList.lots[i].name;
        tdPop.textContent = lotList.lots[i].avatars_in_lot + " sims";

        newRow.appendChild(tdName);
        newRow.appendChild(tdPop);

        tableBody.appendChild(newRow);
    }
    target.appendChild(tableBody);
}

// Write amount of sims online
function writeToLabel(contentString, content, target){

    const location = document.getElementById(target);
    const labelText = contentString + content;

    console.log(labelText);
    console.log(location);

    location.textContent = labelText;
}