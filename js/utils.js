// Return long lot object from list using lot_id
function returnLongLotFromID (lot_id) {

    for (i = 0; i < lotLongList.lots.length; i++) {

        if (lotLongList.lots[i].lot_id == lot_id) {
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

// Return git json so i can get the date
async function returnGitCommitJson() {

    const apiLink = "https://api.github.com/repos/sam-chug/sim-finder/branches/master";

    let obj;
    const res = await fetch(apiLink);
    obj = await res.json();

    console.log("Pinged: " + apiLink);

    return obj;
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
    
    if (simHour >= FACTORY_START_TIME && simHour <= FACTORY_END_TIME) jobsOpen.push(1);
    if (simHour >= DINER_START_TIME && simHour <= DINER_END_TIME) jobsOpen.push(2);
    if (simHour >= CLUB_START_TIME || simHour <= CLUB_END_TIME) jobsOpen.push(4, 5);

    return jobsOpen;
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