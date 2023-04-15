// Return long lot object from list using lot_id
function returnLongLotFromID (lot_id) {

    for (i = 0; i < lotLongList.lots.length; i++) {

        if (lotLongList.lots[i].lot_id == lot_id) {
            return lotLongList.lots[i];
        }
    }
}

// Return long lot object from list using location
function returnLongLotFromLocation (location) {

    for (i = 0; i < lotLongList.lots.length; i++) {

        if (lotLongList.lots[i].location == location) {
            return lotLongList.lots[i];
        }
    }
}

// Return short lot object from list using location
function returnShortLotFromLocation (location) {

    for (i = 0; i < lotShortList.lots.length; i++) {

        if (lotShortList.lots[i].location == location) {
            return lotShortList.lots[i];
        }
    }
}

// Return format date string from unix timestamp
function returnDateStringFromUNIX (unixTime) {

    const d = new Date(unixTime * 1000);
    const yyyy = ("" + d.getFullYear()).slice(2);
    const mm = ("0" + (d.getMonth() + 1)).slice(-2);
    const dd = ("0" + (d.getDate())).slice(-2);

    return mm + "/" + dd + "/" + yyyy;
}

// Neighborhood id's are wonky, return correct from id
function returnNeighborhood (nhood_id) {

    if (nhood_id == 0) return "Unknown";

    if (nhood_id == 1) {
        return NEIGHBORHOOD[0];
    }
    else {
        return NEIGHBORHOOD[nhood_id - 34];
    }
}

// Builds api link from online sim's avatar_id
function buildSimLink (simList) {

    var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
    for (i = 0; i < simList.avatars.length; i++) {

        simIdString += simList.avatars[i].avatar_id + ",";
    }

    simIdString = simIdString.slice(0, -1);
    return simIdString;
}

// Builds api link from online lot's lot_id
function buildLotLink (lotList) {

    var lotIDString = "https://api.freeso.org/userapi/lots?ids=";
    for (i = 0; i < lotList.lots.length; i++) {

        lotIDString += lotList.lots[i].lot_id + ",";
    }

    lotIDString = lotIDString.slice(0, -1);
    return lotIDString;
}

// Builds api link from lot's roommates
function buildRoommateLink (longLot) {

    var roommateIDString = "https://api.freeso.org/userapi/avatars?ids=";
    for (i = 0; i < longLot.roommates.length; i++) {

        roommateIDString += longLot.roommates[i] + ",";
    }

    roommateIDString = roommateIDString.slice(0, -1);
    return roommateIDString;
}

// Return owner sim-object from roommate list
function returnOwner (roommates, owner_id) {

    for (i = 0; i < roommates.avatars.length; i++) {

        if (roommates.avatars[i].avatar_id == owner_id) {

            return roommates.avatars[i];
        }
    }
}

// Return sim's age in days
function simDayAge (unixAge) {

    const now = Math.round(Date.now() / 1000);
    return Math.round((now - unixAge) / 86400);
}

// Return json objects from api links
async function grabAPI (apiLink) {

    let obj;
    const res = await fetch(apiLink);
    obj = await res.json();

    console.log("Pinged: " + apiLink);

    return obj;
}

// Onclick function for sim/lot lists
// Sends lot data to thumbnail writer
function getIndex (selectedIndex) {

    index = selectedIndex.rowIndex - 1;

    if(selectedIndex.id == "sim"){

        const simView = document.getElementById("sim-viewer");
        simView.style.display = "flex";

        const selSimShort = simShortList.avatars[index];
        const selSimLong = simLongList.avatars[index];
        writeSimThumbnail(selSimShort, selSimLong);

        switch(returnExistenceState(selSimShort)){

            case "LANDED":

                var selShortLot = returnShortLotFromLocation(simShortList.avatars[index].location);
                var selLongLot = returnLongLotFromLocation(simShortList.avatars[index].location);
                writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
                break;

            case "FLOATING":

                var selShortLot = {name:"FLOATING"};
                var simsInLot = document.getElementById("show-sims-in-lot");
                simsInLot.style.display = "none";
                break;

            case "LANDED_HIDDEN":

                var selLongLot = returnLongLotOfRoommate(selSimShort.avatar_id);
                var selShortLot = returnShortLotFromLocation(selLongLot.location);
                writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
                break;

            case "HIDDEN":

                var selShortLot = {name:"HIDDEN"};
                var simsInLot = document.getElementById("show-sims-in-lot");
                simsInLot.style.display = "none";
                break;

            default:
                break;
        }
        writeLotThumbnail(selShortLot, selLongLot);
    }
    else if (selectedIndex.id == "lot"){

        const simView = document.getElementById("sim-viewer");
        simView.style.display = "none";

        const selShortLot = lotShortList.lots[index];
        const selLongLot = returnLongLotFromID(lotShortList.lots[index].lot_id);
        writeLotThumbnail(selShortLot, selLongLot);
        writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
    }
    return;
}

// Write list of sims in selected lot
function writeSimsInLot (selLot, population) {

    var simsInLot = document.getElementById("show-sims-in-lot");
    simsInLot.style.display = "flex";

    const simList = document.getElementById("lot-sims-list");
    const roommateList = document.getElementById("lot-roommates-list");
    
    simList.textContent = "";
    roommateList.textContent = "";

    var simTally = 0;

    // Write sims
    const simsHeader = document.createElement("p");
    simsHeader.classList.add("column-header");
    simsHeader.textContent = "Sims:\n";

    const simsContent = document.createElement("p");
    var simListText = "";
    for (i = 0; i < simShortList.avatars.length; i++) {

        if (selLot.roommates.includes(simShortList.avatars[i].avatar_id)) continue;

        if (simShortList.avatars[i].location == selLot.location) {

            simListText += simShortList.avatars[i].name + "\n";
            simTally++;
        }
    }

    // Write roommates
    const roommatesHeader = document.createElement("p");
    roommatesHeader.classList.add("column-header");
    roommatesHeader.textContent = "Roommates:\n";

    const roommatesContent = document.createElement("p");
    var roomListText = "";
    for (i = 0; i < simShortList.avatars.length; i++) {

        if (selLot.roommates.includes(simShortList.avatars[i].avatar_id)) {

            simTally++;

            if (simShortList.avatars[i].privacy_mode == 1) {

                roomListText += simShortList.avatars[i].name + " (Maybe)\n"
            }
            else {
                roomListText += simShortList.avatars[i].name + "\n"
            }
        }
    }

    if (population - simTally > 0) {

        simListText += "\nAnd " + (population - simTally) + " More Hidden Sim(s)"
    }

    simsContent.textContent = simListText;
    simList.appendChild(simsHeader);
    simList.appendChild(simsContent);

    roommatesContent.textContent = roomListText;
    roommateList.appendChild(roommatesHeader);
    roommateList.appendChild(roommatesContent);
}

// Add classes and eventlisteners to table row
function addClassesToTableRow (tableRow) {

    tableRow.addEventListener("click", 
    function(){
        getIndex(this);

        const elements = document.querySelectorAll("*");
        elements.forEach((element) => {
            element.classList.remove("table-row-selected");
        });
            
        this.classList.add("table-row-selected");
    });

    tableRow.addEventListener("mouseover",
    function(){
        styleMouseOverChange(this, "in");
    });

    tableRow.addEventListener("mouseout",
    function(){
        styleMouseOverChange(this, "out");
    });

    return tableRow;
}

// Return if sim floating, hidden, or possibly landed
function returnExistenceState (simShort) {

    const privacyMode = simShort.privacy_mode;
    const location = simShort.location;

    if (location != 0) {
        return "LANDED";
    }
    else if (location == 0 && privacyMode == 0) {

        return "FLOATING"
    }
    else if (privacyMode == 1) {

        var landedHidden = false;

        for (i = 0; i < lotLongList.lots.length; i++) {

            if (lotLongList.lots[i].roommates.includes(simShort.avatar_id)) {

                return "LANDED_HIDDEN";
            }
        }
        return "HIDDEN"
    }
}

// Return lot of sim
function returnLongLotOfRoommate (simID) {

    for (i = 0; i < lotLongList.lots.length; i++) {

        if (lotLongList.lots[i].roommates.includes(simID)) {

            return lotLongList.lots[i];
        }
    }
}

// Return sim existence text
function returnExistenceText (simShort) {

    var existenceText = "";

    const simExistence = returnExistenceState(simShort);
    if (simExistence == "LANDED_HIDDEN") {

        const hiddenAt = returnLongLotOfRoommate(simShort.avatar_id);
        existenceText = "Location: (Maybe) " + hiddenAt.name + "\n";
    }
    else if (simExistence == "HIDDEN") {

        existenceText = "Location: Unknown\n";
    }
    else if (simExistence == "LANDED") {

        const landedAt = returnShortLotFromLocation(simShort.location);
        existenceText = "Location: " + landedAt.name + "\n";
    }
    else if (simExistence == "FLOATING") {

        existenceText = "Location: Floating\n";
    }
    return existenceText;
}