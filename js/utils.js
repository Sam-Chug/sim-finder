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
// Sends data to writers
async function getIndex (selectedIndex) {

    if(selectedIndex.id == "sim"){

        const simName = selectedIndex.cells[0].textContent;
        var selSimShort;
        var selSimLong;

        var simOnline = false;
        for (let i = 0; i < simShortList.avatars.length; i++) {

            if (simShortList.avatars[i].name == simName) {
                
                selSimLong = simLongList.avatars[i];
                selSimShort = returnShortSimFromLong(selSimLong);
                simOnline = true;
                break;
            }
        }

        if (!simOnline) {
            selSimLong = await grabAPI("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));
            selSimShort = returnShortSimFromLong(selSimLong);
        }

        writeGreaterSimContext(selSimShort, selSimLong, returnExistenceState(selSimShort));
    }
    else if (selectedIndex.id == "lot"){

        const lotName = selectedIndex.cells[0].textContent;
        var selLotShort;
        var selLotLong;

        for (let i = 0; i < lotShortList.lots.length; i++) {

            if (lotShortList.lots[i].name == lotName) {
                
                selLotShort = lotShortList.lots[i];
                selLotLong = returnLongLotFromLocation(selLotShort.location);
                break;
            }
        }
        const simView = document.getElementById("sim-viewer");
        simView.style.display = "none";

        writeLotThumbnail(selLotShort, selLotLong, "");
        writeSimsInLot(selLotLong, selLotShort.avatars_in_lot);
    }
    return;
}

// Write sim information
function writeGreaterSimContext (simShort, simLong, existence) {

    updateBookmarkButton(simLong.avatar_id);
    writeSimThumbnail(simShort, simLong);

    const simView = document.getElementById("sim-viewer");
    simView.style.display = "flex";

    switch (existence){

        case "LANDED":
            var selShortLot = returnShortLotFromLocation(simShort.location);
            var selLongLot = returnLongLotFromLocation(simShort.location);
            writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
            break;

        case "WORKING":
            var selShortLot = {name:"WORKING"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        case "FLOATING":
            var selShortLot = {name:"FLOATING"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        case "LANDED_HIDDEN":
            var selLongLot = returnLongLotOfRoommate(simShort.avatar_id);
            var selShortLot = returnShortLotFromLocation(selLongLot.location);
            writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
            break;

        case "HIDDEN":
            var selShortLot = {name:"HIDDEN"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        case "OFFLINE":
            var selShortLot = {name:"OFFLINE"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        default:
            break;
    }
    writeLotThumbnail(selShortLot, selLongLot, existence);
}

// Write list of sims in selected lot
function writeSimsInLot (selLot, population) {

    var simsInLot = document.getElementById("show-sims-in-lot");
    simsInLot.style.display = "flex";

    const simList = document.getElementById("lot-sims-list");
    const roommateList = document.getElementById("lot-roommates-list");
    
    simList.textContent = "";
    roommateList.textContent = "";

    // Write sims
    const simsHeader = document.createElement("p");
    simsHeader.classList.add("column-header");
    simsHeader.textContent = "Sims:\n";

    const simsContent = document.createElement("p");
    var simListText = "";
    var simTally = 0;

    for (let i = 0; i < simShortList.avatars.length; i++) {

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

// Easter Eggs
function doEasterEggs (eggID, value) {

    switch (eggID){

        // Rea sim panel
        case 0:

            var location = document.getElementById("sim-title");
            var block = document.getElementById("sim-viewer");
            var image = document.getElementById("sim-thumbnail-image");

            if (value == "Reaganomics Lamborghini") {

                location.classList.add("rainbow-title");
                block.classList.add("rainbow-block");
                image.classList.add("rainbow-image");
                block.classList.remove("block-background");
            }
            else {
                location.classList.remove("rainbow-title");
                block.classList.add("block-background");
                image.classList.remove("rainbow-image");
                block.classList.remove("rainbow-block");
            }
            break;

        // Rea sim head
        case 1:

            var image = document.getElementById("sim-thumbnail-image");
            if (value == "Reaganomics Lamborghini"){
        
                image.src = "./images/simface-rea.png";
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

// Fill search button arrays on load
function fillButtonGraphics () {

    const lotFilterArray = document.getElementById("lot-filter-array");
    const simFilterArray = document.getElementById("sim-filter-array");

    var count = 0;
    for (const button of lotFilterArray.children) {

        var x = (count % 4) * 71;
        var y = Math.floor(count / 4) * 71;

        button.style.background = "url(./images/lot-filter.png) " + -x + "px " + -y + "px";
        addClassesToButton(button, "lot");

        count++;
    }
    count = 0;
    for (const button of simFilterArray.children) {

        var x = (count % 4) * 71;
        var y = Math.floor(count / 4) * 71;

        button.style.background = "url(./images/sim-filter.png) " + -x + "px " + -y + "px";
        addClassesToButton(button, "sim");

        count++;
    }
}

// Add functions to filter buttons
function addClassesToButton (element, type) {

    element.addEventListener("click",
    function() {

    filterButtonClick(this, type);
    });

    element.addEventListener("mouseover",
    function() {

        mouseOverButtonChange(this, "in", type);

        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        
        if (type == "sim")tooltip.textContent = SIM_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
        if (type == "lot")tooltip.textContent = LOT_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];

        this.appendChild(tooltip);

    });

    element.addEventListener("mouseout",
    function(){

        mouseOverButtonChange(this, "out", type);

        this.removeChild(this.children[0]);
    });
}

// Style change on button mouseover
function mouseOverButtonChange (button, action, type) {

    const index = Array.from(button.parentElement.children).indexOf(button);

    var x = (index % 4) * 71;
    var y = Math.floor(index / 4) * 71;

    if (type == "lot") {

        if (button.classList.contains("lot-filter-active")) return;

        if (action == "in") {
        
            button.style.background = "url(./images/lot-filter-hover.png) " + -x + "px " + -y + "px";

        }
        else if (action == "out") {

            button.style.background = "url(./images/lot-filter.png) " + -x + "px " + -y + "px";
        }
    }
    else if (type == "sim") {

        if (button.classList.contains("sim-filter-active")) return;

        if (action == "in") {
        
            button.style.background = "url(./images/sim-filter-hover.png) " + -x + "px " + -y + "px";

        }
        else if (action == "out") {

            button.style.background = "url(./images/sim-filter.png) " + -x + "px " + -y + "px";
        }
    }
}

// Style change on button click
function filterButtonClick (button, type) {

    const index = Array.from(button.parentElement.children).indexOf(button);
    filterArray = button.parentElement;

    var count = 0;

    if (type == "lot") {

        var sameButton = (button.classList.contains("lot-filter-active"));

        for (let button of filterArray.children) {

            button.classList.remove("lot-filter-active");
            var x = (count % 4) * 71;
            var y = Math.floor(count / 4) * 71;
            button.style.background = "url(./images/lot-filter.png) " + -x + "px " + -y + "px";
    
            count++;
        }

        if (sameButton) {
            writeFilterToTable("lot", "REMOVE");
        }
        else {
            var x = (index % 4) * 71;
            var y = Math.floor(index / 4) * 71;
            button.style.background = "url(./images/lot-filter-selected.png) " + -x + "px " + -y + "px";
            button.classList.add("lot-filter-active");
            writeFilterToTable("lot", index);
        }
        return;
    }

    else if (type == "sim") {

        var sameButton = (button.classList.contains("sim-filter-active"));

        for (let button of filterArray.children) {

            button.classList.remove("sim-filter-active");
            var x = (count % 4) * 71;
            var y = Math.floor(count / 4) * 71;
            button.style.background = "url(./images/sim-filter.png) " + -x + "px " + -y + "px";
    
            count++;
        }

        if (sameButton) {

            writeFilterToTable("sim", "REMOVE");
        }
        else {

            var x = (index % 4) * 71;
            var y = Math.floor(index / 4) * 71;
            button.style.background = "url(./images/sim-filter-selected.png) " + -x + "px " + -y + "px";
            button.classList.add("sim-filter-active");
            writeFilterToTable("sim", SIM_SEARCH[index]);
        }
        return;
    }
}