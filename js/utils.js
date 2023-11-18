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