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
    return {error:"lot not found"};
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

// Return git json so i can get the date
async function returnGitCommitJson() {

    const apiLink = "https://api.github.com/repos/sam-chug/sim-finder/branches/master";

    let obj;
    const res = await fetch(apiLink);
    obj = await res.json();

    console.log("Pinged: " + apiLink);

    return obj;
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

// Return if sim floating, hidden, or possibly landed
function returnExistenceState (simShort) {

    if ("error" in simShort) {

        return "OFFLINE";
    }

    const privacyMode = simShort.privacy_mode;
    const location = simShort.location;

    if (location != 0) {

        var isWorking = true;
        for (let i = 0; i < lotShortList.lots.length; i++) {

            if (lotShortList.lots[i].location == location) {
                isWorking = false;
                break;
            }
        }
        if (isWorking) {

            return "WORKING";
        }
        else {

            return "LANDED";
        }
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
        return "HIDDEN";
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

    const simExistence = returnExistenceState(simShort);
    switch (simExistence) {

        case "LANDED":

            const landedAt = returnShortLotFromLocation(simShort.location);
            return "Location: " + landedAt.name;
            break;

        case "FLOATING":

            return "Location: Floating";
            break;

        case "LANDED_HIDDEN":

            const hiddenAt = returnLongLotOfRoommate(simShort.avatar_id);
            return "Location: (Maybe) " + hiddenAt.name;
            break;

        case "HIDDEN":

            return "Location: Unknown";
            break;

        case "OFFLINE":

            return "Location: Offline"
            break;

        default:

            return "Location: Unknown";
            break;
    }
}

// Reset sim thumbnail styles
function resetSimThumbnailStyles () {

    var title = document.getElementById("sim-title");
    var block = document.getElementById("sim-viewer");
    var image = document.getElementById("sim-thumbnail-image");

    title.className = "";
    block.className = "";
    image.className = "";

    title.classList.add("outset-title", "sim-title");
    block.classList.add("div-sim-view", "block-background");
}

// Parse sim bio for style markers
function returnStyleMarker (styleString) {

    let startIndex = styleString.indexOf("sifi:") + 5;
    let endIndex = 0;

    for (let i = startIndex; i < styleString.length; i++) {
        
        if (styleString[i] == ":") {

            endIndex = i;
            break;
        }
    }
    let styleText = styleString.substring(startIndex, endIndex);
    return styleText.split(",");
}

// Easter Eggs
function doEasterEggs (eggID, value) {

    switch (eggID){

        // Sim's panel
        case 0:
            const simStyles = returnStyleMarker(value.description);
            resetSimThumbnailStyles();

            var title = document.getElementById("sim-title");
            var block = document.getElementById("sim-viewer");
            var image = document.getElementById("sim-thumbnail-image");

            if (value.name == "Reaganomics Lamborghini") {

                title.classList.add("rainbow-title");
                image.classList.add("rainbow-image");

                block.classList.add("golden-block");
                block.classList.remove("block-background");
            }
            else if (simStyles.includes("bp")) {

                block.classList.remove("block-background");
                block.classList.add("pink-block");
            }
            else if (simStyles.includes("bsg")) {

                block.classList.remove("block-background");
                block.classList.add("seagreen-block");
            }
            else if (simStyles.includes("bdg")) {

                block.classList.remove("block-background");
                block.classList.add("dark-block");
            }
            else if (simStyles.includes("br")) {

                block.classList.remove("block-background");
                block.classList.add("red-block");
            }
            else if (simStyles.includes("bw")) {

                block.classList.remove("block-background");
                block.classList.add("bone-block");
            }
            else if (simStyles.includes("bpr")) {

                block.classList.remove("block-background");
                block.classList.add("purple-block");
            }

            break;

        // Rea sim head
        case 1:
            var image = document.getElementById("sim-thumbnail-image");
            if (value.name == "Reaganomics Lamborghini"){
        
                image.src = "./images/sim-faces/simface-rea.png?v0.2.1a";
            }
            break;

        default:
            break;
    }
}

// Retrieve long sim from database
async function searchSim() {

    const simName = document.getElementById("sim-search-input").value;
    const simLong = await grabAPI("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));

    if ("error" in simLong) {

        alert("Cannot find sim \"" + simName + "\"");
        return;
    }
    const simShort = returnShortSimFromLong(simLong);
    const existence = returnExistenceState(simShort);

    writeGreaterSimContext(simShort, simLong, existence);
}

// Retrieve long lot from database
async function searchLot() {

    const lotName = document.getElementById("lot-search-input").value;
    const lotLong = await grabAPI("https://api.freeso.org/userapi/city/1/lots/name/" + lotName.replace(" ", "%20"));

    if ("error" in lotLong) {

        alert("Cannot find lot \"" + lotName + "\"");
        return;
    }
    const lotShort = returnShortLotFromLocation(lotLong.location);
    writeLotThumbnail(lotShort, lotLong, "");

    if (!("error" in lotShort)) {
        writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
    }

    const simView = document.getElementById("sim-viewer");
    const lotSims = document.getElementById("show-sims-in-lot");
    simView.style.display = "none";
    lotSims.style.display = "none";
}

// Return if lot is open or closed
function returnOpenState (lotLong) {

    for (i = 0; i < lotShortList.lots.length; i++) {

        if (lotShortList.lots[i].lot_id == lotLong.lot_id) {
            
            return lotShortList.lots[i];
        }
    }
    return {error:"lot not online"};
}

// Return short sim from sims currently online, from avatar id
// Null returns error object
function returnShortSimFromLong (longSim) {

    for (i = 0; i < simShortList.avatars.length; i++) {

        if (longSim.avatar_id == simShortList.avatars[i].avatar_id) {

            return simShortList.avatars[i];
        }
    }
    return {error:"sim not online"};
}

// Id list to sim object
async function idListToSimLongList (idList) {

    var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
    for (i = 0; i < idList.length; i++) {

        simIdString += idList[i] + ",";
    }
    simIdString = simIdString.slice(0, -1);
    
    simLong = await grabAPI(simIdString);
    return simLong;
}

// Estimate money per hour based on sims in money lots, and their age for estimated skill lock percentage
// In future, use sims at work as well
function returnMarketObject (simLong, simShort, lotShort) {

    const marketObj = {
        moneyPerHourSMO: 0,
        moneyPerHourJob: 0,
        moneyLots: [],
        simsSMO: 0,
        simsWorking: 0,
    }
    lotShort.forEach(function(lot) {
        
        if (lot.category == 1) {

            var lotObj = {
                lotObj: lot,
                lotMoney: 0
            }
            marketObj.moneyLots.push(lotObj);
        } 
    });
    const avgBase = 31.7;
    const avgTime = 242.25;

    for (let i = 0; i < simShort.length; i++) {

        for (let j = 0; j < marketObj.moneyLots.length; j++) {

            if (simShort[i].location == marketObj.moneyLots[j].lotObj.location) {

                const lockCount = Math.min(20 + Math.floor(simDayAge(simLong[i].date) / 7), 120);
                const lockAvg = lockCount / 6;

                // Equation courtesy of Gurra's SMO Spreadsheet (link)
                // Assumes given SMO is at 150% payout
                // Assumes sims at lot have evenly distributed skill locks based on total available
                let payout = avgBase * (1 + 0.2 * lockAvg) * (1 + 0.134 * Math.min(marketObj.moneyLots[j].lotObj.avatars_in_lot, 9)) * 150 / 100;
                payout = Math.floor((payout / avgTime) * 3600)

                marketObj.moneyPerHourSMO += payout;
                marketObj.simsSMO++;
                marketObj.moneyLots[j].lotMoney += payout;
                break;
            }
        }
    }
    var lotLocations = [];
    lotShort.forEach(function(lot) {
        lotLocations.push(lot.location);
    });
    // Check if sim working
    const jobPay = [0, 2, 5.2, 0, 5.9, 5.9];
    const jobsOpen = returnJobsOpen();
    for (let i = 0; i < simShort.length; i++) {

        for (let j = 0; j < jobsOpen.length; j++) {

            // If sim has open job and unlisted location and not hidden
            if (simLong[i].current_job == jobsOpen[j] && 
                !lotLocations.includes(simShort[i].location) &&
                returnExistenceState(simShort[i]) == "WORKING") {

                // Sim's job performance is based on 0 -> 1 year age, scaled into job payout
                // These estimates are bound to be wonky, but no way to know job level for sure
                const payPercent = Math.min(simDayAge(simLong[i].date), 365) / 365;
                marketObj.moneyPerHourJob += Math.floor(payPercent * jobPay[jobsOpen[j]] * 3600) + 1500;
                marketObj.simsWorking++;
                break;
            }
        }
    }
    return marketObj;
}

// Return sim time [HH, MM] in a 24 hour format
function returnSimTime () {

    var date = Date.now() / 1000;
    var minutes = Math.floor((date % 7200) / 5);
    var simHour = Math.floor(minutes / 60);
    var simMin = minutes % 60;

    return [simHour, simMin];
}

// Return, if any, current job id's whos shifts are active
function returnJobsOpen () {

    const simHour = returnSimTime()[0];
    var jobsOpen = [];
    
    // Feathers shift-end by one hour to account for any late shifts
    if (simHour >= 8 && simHour <= 17) jobsOpen.push(1);
    if (simHour >= 10 && simHour <= 19) jobsOpen.push(2);
    if (simHour >= 19 || simHour <= 4) jobsOpen.push(4, 5);

    return jobsOpen;
}

// Build lot_id string from top lot list
function buildTopLotsLink (topLotList) {

    var lotIDString = "https://api.freeso.org/userapi/lots?ids=";
    for (let i = 0; i < topLotList.lots.length; i++) {

        lotIDString += topLotList.lots[i].lot_id + ",";
    }
    lotIDString = lotIDString.slice(0, -1);
    return lotIDString;
}

// Score each neighborhood by activity
function returnNeighborhoodScore (lotsShort, lotsLong) {

    const lotArray = new Array(lotsLong.lots.length);
    lotArray.fill({
        lot_id: 0,
        lot_name: "",
        nhood_id: 0,
        category: 0,
        rank: 0
    });
    for (let i = 0; i < lotsShort.lots.length; i++) {

        for (let j = 0; j < lotsLong.lots.length; j++) {

            if (lotsShort.lots[i].lot_id == lotsLong.lots[j].lot_id) {

                lotArray[i] = {
                    lot_id: lotsShort.lots[i].lot_id,
                    lot_name: lotsShort.lots[i].lot_name,
                    nhood_id: lotsLong.lots[j].neighborhood_id,
                    category: lotsShort.lots[i].category,
                    rank: lotsShort.lots[i].rank
                }
                lotsLong.lots.splice(j, 1);
                break;
            }
        }
    }
    // (VERY) Estimated average amount of sims in a lot
    var catWeights = [
        0,  //None
        19, //Money
        5,  //Offbeat
        8,  //Romance
        8,  //Service
        8,  //Shopping
        32, //Skills
        6,  //Welcome
        5,  //Games
        4,  //Entertainment
        4,  //Residence
        0   //Community
    ];
    const catCounts = new Array(12).fill(0);
    for (let i = 0; i < lotArray.length; i++) {

        catCounts[lotArray[i].category]++;
    }
    var nhoodRatings = returnNhoodRankings(lotArray, catCounts, catWeights);
    //logRankAccuracy(nhoodRatings);

    return nhoodRatings;
}

// Estimate rankings of neighborhoods and return ranked neighborhood list
function returnNhoodRankings (lotArray, catCounts, catWeights) {

    const nhoodRatings = new Array(NEIGHBORHOOD.length);
    nhoodRatings.fill({
        nhood_id: 0,
        rating: 0
    });
    for (let i = 0; i < nhoodRatings.length; i++) {

        nhoodRatings[i] = {nhood_id: i, rating: 0};
    }
    for (let i = 0; i < lotArray.length; i++) {

        let nhoodID = returnFixedNeighborhoodID("to_normal", lotArray[i].nhood_id);
        let rankMax = Math.min(catCounts[lotArray[i].category], 10);
        let rank = lotArray[i].rank;
        //let catSkew = Math.sqrt(catCounts[lotArray[i].category]);
        let weight = catWeights[lotArray[i].category];

        if (rank > 10) continue;

        // Weighted scoring formula
        //let rating = ((1 / (Math.sqrt(rank + 0.7))) * 10 - 2) * weight; //68
        //let rating = ((Math.cos(rank / catSkew) / 2) + 0.5) * weight; //62
        let rating = Math.max((((-rank ^ 0.5) + rankMax / 1.54) * weight), 0); //71
        nhoodRatings[nhoodID].rating += rating;
    }
    nhoodRatings.sort(({rating:a}, {rating:b}) => b - a);
    return nhoodRatings;
}

// Format between human readable and freeso neighborhood_id format
function returnFixedNeighborhoodID (format, id) {

    if (format == "to_freeso") {

        if (id == 0) return 1;
        return id + 34;
    }
    else if (format == "to_normal") {

        if (id == 1) return 0;
        return id - 34;
    }
}

// These functions are decrepit until i find a more responsive way to rank neighborhoods accurately
// // Log ranking accuracy to console
// function logRankAccuracy (nhoodRatings) {

//     const rankAcc = returnRankAccuracy(nhoodRatings);
//     console.log("Top 30 Neighborhoods (Top 10 " + rankAcc + "% Accurate): ");
//     for (let i = 0; i < 30; i++) {
//         console.log((i + 1) + ". " + returnNeighborhood(returnFixedNeighborhoodID("to_freeso", nhoodRatings[i].nhood_id)) + 
//                     " - " + Math.floor(nhoodRatings[i].rating));
//     }
// }

// // Tune weights of lot categories
// function returnRandomCatTuning (catList) {

//     const tuneSize = 2;

//     const randCat = Math.floor(Math.random() * 12);
//     const randAmount = (Math.random() * tuneSize) - (tuneSize / 2);

//     catList[randCat] = Math.max(catList[randCat] + randAmount, 0);
//     return catList;
// }

// // Return accuracy of ranking estimate
// function returnRankAccuracy (nhoodList) {

//     // current top 10
//     const realTopLots = [
//         "Serpent's Spine",
//         "Volcanic Springs",
//         "Spiral Cove",
//         "M.O.M.I. Mire",
//         "Wright Shoals",
//         "Clover Heights",
//         "Crescent Rock",
//         "The Sunrise Riviera",
//         "Calvin's Coast",
//         "Turtle Rock",
//         "Bhugarbha Triangle",
//         "Journey's End",
//         "Trio Lake",
//         "Offbeat Islands",
//         "Lunar Lake"
//     ];
//     var accuracy = 0;
//     var maxScore = 15
//     for (let i = 0; i < 15; i++) {

//         for (let j = 0; j < realTopLots.length; j++) {

//             if (returnNeighborhood(returnFixedNeighborhoodID("to_freeso", nhoodList[i].nhood_id)) == realTopLots[j]) {

//                 accuracy += maxScore - Math.abs(i - j);
//             }
//         }
//     }
//     accuracy = (accuracy / 225).toFixed(3);
//     return accuracy;
// }

// Return percentage of population in each region currently
function returnNHoodTopMovers (lotsShort, lotsLong, onlinePop) {

    lotsShort = lotsShort.lots;
    lotsLong = lotsLong.lots;
    lotsShort.sort(({lot_id:a}, {lot_id:b}) => b - a);
    lotsLong.sort(({lot_id:a}, {lot_id:b}) => b - a);
    var nhoodPop = new Array(NEIGHBORHOOD.length);

    for (let i = 0; i < nhoodPop.length; i++) {

        nhoodPop[i] = {nhood_id: returnFixedNeighborhoodID("to_freeso", i), rating: 0};
    }
    for (let i = 0; i < nhoodPop.length; i++) {

        for (let j = 0; j < lotsShort.length; j ++) {

            if (lotsLong[j].neighborhood_id == nhoodPop[i].nhood_id) {

                var percent = lotsShort[j].avatars_in_lot / onlinePop;
                nhoodPop[i].rating += percent;
            }
        }
    }
    return(nhoodPop);
}