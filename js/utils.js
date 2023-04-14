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
function returnDateStringFromUNIX(unixTime) {

    const d = new Date(unixTime * 1000);
    const yyyy = ("" + d.getFullYear()).slice(2);
    const mm = ("0" + (d.getMonth() + 1)).slice(-2);
    const dd = ("0" + (d.getDate())).slice(-2);

    return mm + "/" + dd + "/" + yyyy;
}

// Neighborhood id's are wonky, return correct from id
function returnNeighborhood(nhood_id) {

    if (nhood_id == 0) return "Unknown";

    if (nhood_id == 1) {
        return NEIGHBORHOOD[0];
    }
    else {
        return NEIGHBORHOOD[nhood_id - 34];
    }
}

// Builds api link from online sim's avatar_id
function buildSimLink(simList) {

    var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
    for (i = 0; i < simList.avatars.length; i++) {

        simIdString += simList.avatars[i].avatar_id + ",";
    }

    simIdString = simIdString.slice(0, -1);
    return simIdString;
}

// Builds api link from online lot's lot_id
function buildLotLink(lotList) {

    var lotIDString = "https://api.freeso.org/userapi/lots?ids=";
    for (i = 0; i < lotList.lots.length; i++) {

        lotIDString += lotList.lots[i].lot_id + ",";
    }

    lotIDString = lotIDString.slice(0, -1);
    return lotIDString;
}

// Builds api link from lot's roommates
function buildRoommateLink(longLot) {

    var roommateIDString = "https://api.freeso.org/userapi/avatars?ids=";
    for (i = 0; i < longLot.roommates.length; i++) {

        roommateIDString += longLot.roommates[i] + ",";
    }

    roommateIDString = roommateIDString.slice(0, -1);
    return roommateIDString;
}

// Return owner sim-object from roommate list
function returnOwner(roommates, owner_id){

    for (i = 0; i < roommates.avatars.length; i++) {

        if (roommates.avatars[i].avatar_id == owner_id) {

            return roommates.avatars[i];
        }
    }
}

// Return sim's age in days
function simDayAge(unixAge){

    const now = Math.round(Date.now() / 1000);
    return Math.round((now - unixAge) / 86400);
}

// Return json objects from api links
async function grabAPI(apiLink){

    let obj;
    const res = await fetch(apiLink);
    obj = await res.json();

    console.log("Pinged: " + apiLink);

    return obj;
}

// Onclick function for sim/lot lists
// Sends lot data to thumbnail writer
function getIndex(selectedIndex){

    index = selectedIndex.rowIndex - 1;

    if(selectedIndex.id == "sim"){

        const selShortLot = returnShortLotFromLocation(simShortList.avatars[index].location);
        const selLongLot = returnLongLotFromLocation(simShortList.avatars[index].location);
        writeLotThumbnail(selShortLot, selLongLot);
    }
    else if (selectedIndex.id == "lot"){

        const selShortLot = lotShortList.lots[index];
        const selLongLot = returnLongLotFromID(lotShortList.lots[index].lot_id);
        writeLotThumbnail(selShortLot, selLongLot);
    }
    return;
}