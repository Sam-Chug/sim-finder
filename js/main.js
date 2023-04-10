const SIM_ONLINE_URL = "https://api.freeso.org/userapi/avatars/online";
var LONG_SIM_URL = "";

document.addEventListener("DOMContentLoaded", ready);

async function ready(){

    const simObjList = await grabAPI(SIM_ONLINE_URL);

    LONG_SIM_URL = buildSimLink(simObjList);
    const simLong = await grabAPI(LONG_SIM_URL);

    createTable(simLong);
    simsOnlineCount(simLong);
}

async function grabAPI(apiLink){

    let obj;
    const res = await fetch(apiLink);
    obj = await res.json();

    console.log("Pinged: " + apiLink);

    return obj;
}

function buildSimLink(simList){

    var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
    for(i = 0; i < simList.avatars.length; i++){

        simIdString += simList.avatars[i].avatar_id + ",";
    }

    simIdString = simIdString.slice(0, -1);
    return simIdString;
}

function simDayAge(unixAge){

    const now = Math.round(Date.now() / 1000);

    return Math.round((now - unixAge) / 86400);
}

function createTable(simList){

    const target = document.getElementById('target');

    const tableHead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const thName = document.createElement("th");
    const thID = document.createElement("th");
    const thAge = document.createElement("th");

    thName.textContent = "Name";
    thID.textContent = "ID";
    thAge.textContent = "Age";

    headRow.appendChild(thName);
    headRow.appendChild(thID);
    headRow.appendChild(thAge);

    tableHead.appendChild(headRow);

    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for(i = 0; i < simList.avatars.length; i++){

        const newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdID = document.createElement("td");
        const tdAge = document.createElement("td");

        tdName.textContent = simList.avatars[i].name;
        tdID.textContent = simList.avatars[i].avatar_id;
        tdAge.textContent = simDayAge(simList.avatars[i].date) + " days";

        newRow.appendChild(tdName);
        newRow.appendChild(tdID);
        newRow.appendChild(tdAge);

        tableBody.appendChild(newRow);
    }

    target.appendChild(tableBody);
}

function simsOnlineCount(simList){

    const simCount = "There are " + simList.avatars.length + " sims online:"
    const location = document.getElementById("p");
    
    location.textContent = simCount;
}