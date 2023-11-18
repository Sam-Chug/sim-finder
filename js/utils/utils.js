simUtils = function() {

    function returnSimAge(joinDate) {

        const now = Math.round(Date.now() / 1000);
        return Math.round((now - joinDate) / 86400);
    }

    function isSimOnline(simName) {

        for (let i = 0; i < simDataHolder.simShortList.avatars.length; i++) {
            
            if (simDataHolder.simShortList.avatars[i].name == simName) return true;
        }
        return false;
    }

    // Return if lot is open or closed
    function returnOpenState (lotLong) {
    
        for (i = 0; i < simDataHolder.lotShortList.lots.length; i++) {
            
            let lotID = simDataHolder.lotShortList.lots[i].lot_id;
            if (lotLong.lot_id == lotID) return simDataHolder.lotShortList.lots[i];
        }
        return {error:"lot not online"};
    }

    // Return long lot object from list using location
    function returnLongLotFromLocation(location) {

        for (i = 0; i < simDataHolder.lotLongList.lots.length; i++) {
            
            if (simDataHolder.lotLongList.lots[i].location == location) return simDataHolder.lotLongList.lots[i];
        }
        return {error: "lot not found"};
    }

    // Return short lot object from list using location
    function returnShortLotFromLocation(location) {

        for (i = 0; i < simDataHolder.lotShortList.lots.length; i++) {

            if (simDataHolder.lotShortList.lots[i].location == location) return simDataHolder.lotShortList.lots[i];
        }
        return {error: "lot not found"};
    }

    // Return short sim from sims currently online, from avatar id
    // TODO: Take just simID as argument
    function returnShortSimFromLong(longSim) {

        // Null returns error object
        for (i = 0; i < simDataHolder.simShortList.avatars.length; i++) {

            let simID = simDataHolder.simShortList.avatars[i].avatar_id;
            if (longSim.avatar_id == simID) return simDataHolder.simShortList.avatars[i];
        }
        return {error: "sim not online"};
    }

    // Return lot from sim ID
    // Assumes sim is roommate possibly with privacy mode on
    function returnLongLotFromRoommate(simID) {

        for (i = 0; i < simDataHolder.lotLongList.lots.length; i++) {

            if (simDataHolder.lotLongList.lots[i].roommates.includes(simID)) return simDataHolder.lotLongList.lots[i];
        }
    }

    // Return owner sim-object from roommate list
    function returnOwnerFromRoommateList(roommates, owner_id) {

        for (i = 0; i < roommates.avatars.length; i++) {

            if (roommates.avatars[i].avatar_id == owner_id) return roommates.avatars[i];
        }
    }

    // Return if sim floating, hidden, or possibly landed
    function returnExistenceState(selectedSimShort) {

        // If null simShort, they must be offline
        if ("error" in selectedSimShort) return "OFFLINE";

        const privacyMode = selectedSimShort.privacy_mode;
        const location = selectedSimShort.location;

        // If sim is at a non-zero location
        if (location != 0) {

            // Check if sim is at a job lot
            var isWorking = true;
            for (let i = 0; i < simDataHolder.lotShortList.lots.length; i++) {

                if (simDataHolder.lotShortList.lots[i].location == location) {
                    isWorking = false;
                    break;
                }
            }

            // Is sim at job lot?
            if (isWorking) return "WORKING";
            // Else, sim at regular lot
            else return "LANDED";
        }

        // If location is zero and sim is not hidden, they must be floating
        else if (location == 0 && privacyMode == 0) return "FLOATING"

        // If sim has privacy mode on
        else if (privacyMode == 1) {

            // Check if lot they live at is open
            for (i = 0; i < simDataHolder.lotLongList.lots.length; i++) {

                // If lot sim lives at is online, they might be there
                if (simDataHolder.lotLongList.lots[i].roommates.includes(selectedSimShort.avatar_id)) return "LANDED_HIDDEN";
            }

            // Else, their location is unknown
            return "HIDDEN";
        } 
    }

    // Return bookmark object
    // TODO: REFACTOR
    function getBookmark() {

        // Check if localstorage empty
        if (JSON.parse(localStorage.getItem("idList")) == null ||
            JSON.parse(localStorage.getItem("idList")).simID.length == 0) {

            localStorage.clear();

            let initStorage = {
                simID: [194687]
            };
            localStorage.setItem("idList", JSON.stringify(initStorage));
        }
        const simIDObject = JSON.parse(localStorage.getItem("idList"));

        return simIDObject;
    }

    return {
        returnSimAge: returnSimAge,
        isSimOnline: isSimOnline,
        returnShortSimFromLong: returnShortSimFromLong,
        getBookmark: getBookmark,
        returnExistenceState: returnExistenceState,
        returnLongLotFromLocation: returnLongLotFromLocation,
        returnShortLotFromLocation: returnShortLotFromLocation,
        returnLongLotFromRoommate: returnLongLotFromRoommate,
        returnOwnerFromRoommateList: returnOwnerFromRoommateList,
        returnOpenState: returnOpenState
    }
}();

domUtils = function() {

    function getIndexInParent(element) {

        return Array.from(element.parentNode.children).indexOf(element);
    }

    function resetListSelection() {

        const elements = document.querySelectorAll("*");
        elements.forEach((element) => {
            element.classList.remove("sim-list-node-selected");
        });
    }

    return {
        getIndexInParent: getIndexInParent,
        resetListSelection: resetListSelection
    }
}();

guiUtils = function() {

    function writeToLabel(contentString, content, target) {

        const location = document.getElementById(target);
        const labelText = contentString + content;
        
        location.textContent = labelText;
    }

    //#region Populate Lot/Sim bios
    // TODO: RENAME FUNCTION
    async function getIndex(type, index) {

        if (type == "sim") {
    
            // Get sim name from index
            let simName = GUI_ONLINESIMS.children[index + 1].children[0].textContent;

            // Selected sim data
            let selectedSimShort;
            let selectedSimLong = simDataHolder.simLongList.avatars.filter(obj => { return obj.name === simName; });
            selectedSimLong = selectedSimLong[0];

            // Check if sim is online
            if (simUtils.isSimOnline(simName)) {

                // If sim is online, grab short data
                selectedSimShort = simUtils.returnShortSimFromLong(selectedSimLong);
            }
            else {

                // Else, grab long offline data
                // TODO: Switch to apiUtils function
                selectedSimLong = await grabAPI("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));
                selectedSimShort = simUtils.returnShortSimFromLong(selectedSimLong);
            }

            // Send data to sim bio writer
            writeGreaterSimContext(selectedSimShort, selectedSimLong, simUtils.returnExistenceState(selectedSimShort));
        }
        else if (type == "lot") {
    
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
    function writeGreaterSimContext(selectedSimShort, selectedSimLong, existence) {
        
        // Set bookmark button state, write sim bio
        guiUtils.updateBookmarkButton(selectedSimLong.avatar_id);
        guiUtils.writeSimThumbnail(selectedSimShort, selectedSimLong);
        
        // Show sim bio
        GUI_SIM_VIEW.style.display = "flex";
    
        // Set lot bio based on sim's existence state
        switch (existence){
        
            case "LANDED":
                var selectedShortLot = simUtils.returnShortLotFromLocation(selectedSimShort.location);
                var selectedLongLot = simUtils.returnLongLotFromLocation(selectedSimShort.location);
                writeSimsInLot(selectedLongLot, selectedShortLot.avatars_in_lot);
                break;
        
            case "WORKING":
                var selectedShortLot = {name: "WORKING"};
                GUI_SIMS_IN_LOT.style.display = "none";
                break;
        
            case "FLOATING":
                var selectedShortLot = {name: "FLOATING"};
                GUI_SIMS_IN_LOT.style.display = "none";
                break;
        
            case "LANDED_HIDDEN":
                var selectedLongLot = simUtils.returnLongLotFromRoommate(selectedSimShort.avatar_id);
                var selectedShortLot = simUtils.returnShortLotFromLocation(selectedLongLot.location);
                writeSimsInLot(selectedLongLot, selectedShortLot.avatars_in_lot);
                break;
        
            case "HIDDEN":
                var selectedShortLot = {name: "HIDDEN"};
                GUI_SIMS_IN_LOT.style.display = "none";
                break;
        
            case "OFFLINE":
                var selectedShortLot = {name: "OFFLINE"};
                GUI_SIMS_IN_LOT.style.display = "none";
                break;
        
            default:
                break;
        }
        writeLotThumbnail(selectedShortLot, selectedLongLot, existence, selectedSimLong);
    }

    // Build sim thumbnail
    function writeSimThumbnail (selectedSimShort, selectedSimLong) {

        writeToLabel(selectedSimLong.name, "", "sim-title");

        // TODO: REFACTOR
        if (selectedSimLong.gender == 0) GUI_SIM_THUMBNAIL.src = "./images/sim-faces/simface-m.png?v0.2.1a";
        else if (selectedSimLong.gender == 1) GUI_SIM_THUMBNAIL.src = "./images/sim-faces/simface-f.png?v0.2.1a";

        // TODO: EASTER EGGS
        //doEasterEggs(0, selectedSimLong);
        //doEasterEggs(1, selectedSimLong);

        // Write sim's bio text
        GUI_SIM_BIO.textContent = selectedSimLong.description;

        // Sim description basics
        var descContent = `Age: ${simDayAge(selectedSimLong.date)} Days\n` + 
                          `ID: ${selectedSimLong.avatar_id}\n` + 
                          `Joined: ${returnDateStringFromUNIX(selectedSimLong.date)}\n` +
                          `Job: ${JOB_TITLES[selectedSimLong.current_job]}\n`;

        // Is sim mayor of a neighborhood?
        if (selectedSimLong.mayor_nhood != null) descContent += "Mayor of " + returnNeighborhood(selectedSimLong.mayor_nhood) + "\n";

        // Set sim description to constructed text
        GUI_SIM_DESCRIPTION.textContent = descContent;

        // Set background of sim and lot thumbnail
        switch (simUtils.returnExistenceState(selectedSimShort)) {

            case "OFFLINE":
                GUI_SIM_THUMBNAIL_BG.classList.add("thumbnail-offline");
                GUI_LOT_THUMBNAIL_BG.classList.add("thumbnail-offline");
                break;

            default:
                GUI_SIM_THUMBNAIL_BG.classList.remove("thumbnail-offline");
                GUI_LOT_THUMBNAIL_BG.classList.remove("thumbnail-offline");
                break;
        }
    }

    // Write list of sims in selected lot
    function writeSimsInLot (selectedLot, population) {

        // Show sims in lot
        GUI_SIMS_IN_LOT.style.display = "flex";

        // Reset sims in lot text
        GUI_SIMS_IN_LOT_SIMS.textContent = "";
        GUI_SIMS_IN_LOT_ROOMMATES.textContent = "";

        // Create elements for sims at lot text
        // TODO: Build list of elements, each clickable as are in sim list
        const simsContent = document.createElement("p");
        const simsHeader = document.createElement("p");

        simsHeader.classList.add("column-header");
        simsHeader.textContent = "Sims:\n";
        
        let allCount = 0;   // Known sims at lot
        let knownCount = 0; // Excludes roommates

        // For sims online
        let simListText = "";
        for (let i = 0; i < simDataHolder.simShortList.avatars.length; i++) {

            // If sim is a roommate, save for later
            // TODO: Cache list of roommates for speed?
            let simID = simDataHolder.simShortList.avatars[i].avatar_id;
            if (selectedLot.roommates.includes(simID)) continue;

            // If sim at lot and not roommate
            if (simDataHolder.simShortList.avatars[i].location == selectedLot.location) {

                // Add sim's name to list
                simListText += simDataHolder.simShortList.avatars[i].name + "\n";

                allCount++;
                knownCount++;
            }
        }

        // Create elements for roommates at lot text
        const roommatesContent = document.createElement("p");
        const roommatesHeader = document.createElement("p");
        roommatesHeader.classList.add("column-header");
        roommatesHeader.textContent = "Roommates:\n";

        // For sims online
        let roomListText = "";
        for (i = 0; i < simDataHolder.simShortList.avatars.length; i++) {

            // If sim is roommate of lot
            let simID = simDataHolder.simShortList.avatars[i].avatar_id
            if (selectedLot.roommates.includes(simID)) {

                // Lot is online, hidden roommate sim may be there
                if (simDataHolder.simShortList.avatars[i].privacy_mode == 1) {

                    roomListText += `${simDataHolder.simShortList.avatars[i].name} (Maybe)\n`;
                }
                // Else the sim is there
                else if (simDataHolder.simShortList.avatars[i].location == selectedLot.location) {

                    roomListText += `${simDataHolder.simShortList.avatars[i].name}\n`
                    allCount++;
                }
            }
        }

        // Write extra text for number of hidden sims
        if (population - allCount > 0) {

            simListText += "\n";

            // If the known count of sims is 0
            if (knownCount == 0) simListText += `${population - allCount}  Hidden Sim` + (((population - allCount) == 1) ? "" : "s");

            // Else write an "And" if there are known sims
            else simListText += `And ${population - allCount} More Hidden Sim` + (((population - allCount) == 1) ? "" : "s");
        }

        // Append text to sims/roommates in lot
        simsContent.textContent = simListText;
        GUI_SIMS_IN_LOT_SIMS.appendChild(simsHeader);
        GUI_SIMS_IN_LOT_SIMS.appendChild(simsContent);

        roommatesContent.textContent = roomListText;
        GUI_SIMS_IN_LOT_ROOMMATES.appendChild(roommatesHeader);
        GUI_SIMS_IN_LOT_ROOMMATES.appendChild(roommatesContent);
    }

    // Write info to lot thumbnail box
    async function writeLotThumbnail (selectedLotShort, selectedLotLong, existence, selectedSimLong) {

        // If sim not landed at a lot, contextually fill lot bio
        if (existence != "LANDED" && existence != "LANDED_HIDDEN") {

            writeAbsentLotThumbnail(existence, selectedSimLong);
            return;
        }
        
        // Lot label
        writeToLabel(selectedLotLong.name, "", "thumbnail-title");

        // Reset description, get thumbnail from API
        GUI_LOT_DESCRIPTION.textContent = "";
        GUI_LOT_THUMBNAIL.src = "https://api.freeso.org/userapi/city/1/" + selectedLotLong.location + ".png?v0.2.1a";
        console.log("Pinged: " + "https://api.freeso.org/userapi/city/1/" + selectedLotLong.location + ".png?v0.2.1a");

        // Create lot bio elements
        const lotDesc = document.createElement("p");
        const lotOwnerTitle = document.createElement("p");
        const lotRoommateTitle = document.createElement("p");
        const lotOwner = document.createElement("p");
        const lotRoommates = document.createElement("p");

        // Basic lot info
        lotDesc.textContent = `Category: ${LOT_CATEGORY[selectedLotLong.category]}\n` + 
                              `Established: ${returnDateStringFromUNIX(selectedLotLong.created_date)}\n` + 
                              `Neighborhood: ${returnNeighborhood(selectedLotLong.neighborhood_id)}\n` +
                              `Admit Mode: ${ADMIT_MODES[selectedLotLong.admit_mode]}\n` + 
                              `${SKILL_MODES[selectedLotLong.skill_mode]}\n`;

        // Set thumbnail background and lot population
        if ("error" in simUtils.returnOpenState(selectedLotShort)) {

            GUI_LOT_THUMBNAIL_BG.classList.add("thumbnail-offline");
            lotDesc.textContent += "Population: 0\n\n";
        }
        else if (!("error" in simUtils.returnOpenState(selectedLotShort))) {

            GUI_LOT_THUMBNAIL_BG.classList.remove("thumbnail-offline");
            lotDesc.textContent += `Population: ${selectedLotShort.avatars_in_lot}\n\n`;
        }

        // If town hall, skip roommates
        if (selectedLotShort.category == 11) {

            // TODO: Check necessity of these elements
            descTarget.appendChild(lotDesc);
            descTarget.appendChild(lotOwnerTitle);
            descTarget.appendChild(lotOwner);
            descTarget.appendChild(lotRoommateTitle);
            return;
        }

        // Get roommates of lot and owner
        let roommates = await apiUtils.getAPIData(buildRoommateLink(selectedLotLong));
        let owner = simUtils.returnOwnerFromRoommateList(roommates, selectedLotLong.owner_id);

        // Write lot owner and roommate elements
        // TODO: Refactor
        lotOwnerTitle.textContent = "Owner: ";
        lotRoommateTitle.textContent = "\nRoommates: ";
        lotOwner.textContent = owner.name;
        lotOwner.classList.add("user-offline");

        // If owner online, remove offline styling
        for (i = 0; i < simDataHolder.simShortList.avatars.length; i++) {

            let simID = simDataHolder.simShortList.avatars[i].avatar_id;
            if (owner.avatar_id == simID) lotOwner.classList.remove("user-offline");
        }

        // Search roommates
        for (i = 0; i < roommates.avatars.length; i++) {

            // Skip roommate if roommate is lot owner
            if (roommates.avatars[i].avatar_id != owner.avatar_id) {

                // Check if roommate online
                const listRoommate = document.createElement("p");
                listRoommate.classList.add("user-offline");
                listRoommate.textContent = roommates.avatars[i].name;

                // If roommate online, remove offline styling
                for (j = 0; j < simDataHolder.simShortList.avatars.length; j++) {

                    let simID = simDataHolder.simShortList.avatars[j].avatar_id;
                    if (roommates.avatars[i].avatar_id == simID) listRoommate.classList.remove("user-offline");
                }

                // Append roommate to roommate list element
                lotRoommates.appendChild(listRoommate);
            }
        }

        // Append elements to lot bio
        GUI_LOT_DESCRIPTION.appendChild(lotDesc);
        GUI_LOT_DESCRIPTION.appendChild(lotOwnerTitle);
        GUI_LOT_DESCRIPTION.appendChild(lotOwner);
        GUI_LOT_DESCRIPTION.appendChild(lotRoommateTitle);
        GUI_LOT_DESCRIPTION.appendChild(lotRoommates);
    }

    // If roommate not located, write contextual lot bio
    function writeAbsentLotThumbnail(existence, selectedSimLong) {

        // Set lot image to unknown
        GUI_LOT_THUMBNAIL.src = "./images/unknown.png?v0.2.1a";

        // Get lot description and label
        let lotDescription = "";
        let lotLabel = "";
        switch (existence) {

            case "FLOATING":

                lotDescription.textContent = "Category: Air\n" + "Established: Dawn of Time\n" + "Admit Mode: Admit All";
                lotLabel = "Floating";
                break;

            case "WORKING":

                lotDescription.textContent = "Category: Job\n" + "Making: Simoleons";
                lotLabel = `Working - ${JOB_STRINGS[selectedSimLong.current_job]}`;
                break;

            case "HIDDEN":

                lotDescription.textContent = "Hidden";
                lotLabel = "Hidden";
                break;

            case "OFFLINE":
            default:

                lotDescription.textContent = "This sim is touching grass";
                lotLabel = "Offline";
                break;
        }

        // Write label and description
        writeToLabel(lotLabel, "", "thumbnail-title");
        GUI_LOT_DESCRIPTION.lotDescription;
    }

    // Change bookmark button styles
    function updateBookmarkButton (selID) {

        selSimID = selID;

        const bookSims = simUtils.getBookmark();
        let isBookmarked = false;

        for (let i = 0; i < bookSims.simID.length; i++) {

            if (selID == bookSims.simID[i]) {

                isBookmarked = true;
                break;
            }
        }
        GUI_BOOKMARK_BUTTON.checked = isBookmarked;
    }
    //#endregion

    //#region Build sim/lot lists
    function buildListHeader(columnLeftText, columnRightText) {

        let listHead = document.createElement("div");
        listHead.id = "sim-list-node";
        listHead.classList.add("sim-list-title");

        let leftHead = document.createElement("p");
        leftHead.textContent = columnLeftText;

        let rightHead = document.createElement("p");
        rightHead.textContent = columnRightText;

        listHead.appendChild(leftHead);
        listHead.appendChild(rightHead);

        return listHead;
    }

    function populateSimList(simList) {

        GUI_ONLINESIMS.innerHTML = "";
        GUI_ONLINESIMS.appendChild(buildListHeader("Name", "Age"));

        for (let i = 0; i < simList.length; i++) {

            let simNode = document.createElement("div");
            simNode.id = "sim-list-node";

            let simName = document.createElement("p");
            simName.textContent = simList[i].name;

            let simAge = document.createElement("p");
            simAge.textContent = `${simUtils.returnSimAge(simList[i].date)} Days`;

            addIndexClickHandler(simNode, "sim");

            simNode.appendChild(simName);
            simNode.appendChild(simAge);
            GUI_ONLINESIMS.appendChild(simNode);
        }
    }

    function populateLotList(lotList) {

        GUI_ONLINELOTS.textContent = "";
        GUI_ONLINELOTS.appendChild(buildTableHead("Name", "Population"));
        
        for (i = 0; i < lotList.length; i++) {
        
            let lotNode = document.createElement("div");
            lotNode.id = "sim-list-node";

            let lotName = document.createElement("p");
            lotName.textContent = lotList[i].name;

            let lotPop = document.createElement("p");
            lotPop.textContent = lotList[i].avatars_in_lot + " sims";

            addIndexClickHandler(lotNode, "lot");

            lotNode.appendChild(lotName);
            lotNode.appendChild(lotPop);
            GUI_ONLINELOTS.appendChild(lotNode);
        }
    }

    function addIndexClickHandler(element, type) {

        if (type == "sim") {

            element.addEventListener("click", function() {

                // Grab index of sim in list
                let index = domUtils.getIndexInParent(this);

                // Move selection graphic to index
                domUtils.resetListSelection();
                this.classList.add("sim-list-node-selected");

                // Write sim bio
                guiUtils.getIndex("sim", index - 1);
            });
        }
        else if (type == "lot") {

            element.addEventListener("click", function() {

                // Grab index of lot in list
                let index = domUtils.getIndexInParent(this);

                // Move selection graphic to index
                domUtils.resetListSelection();
                this.classList.add("sim-list-node-selected");

                // Write lot bio
                guiUtils.getIndex("lot", index);
            });
        }
    }
    //#endregion

    //#region Filter Icons
    // Populate filter buttons
    function fillButtonGraphics () {

        const lotFilterArray = document.getElementById("lot-filter-array");
        const simFilterArray = document.getElementById("sim-filter-array");
    
        for (let i = 0; i < 12; i++) {
    
            let button = document.createElement("button");
    
            var x = (i % 4) * 71;
            var y = Math.floor(i / 4) * 71;
            button.style.background = "url(./images/filter-spritesheets/lot-filter.png) " + -x + "px " + -y + "px";
    
            addFilterClasses(button, "lot");
            lotFilterArray.appendChild(button);
        }
        for (let i = 0; i < 9; i++) {
    
            let button = document.createElement("button");
    
            var x = (i % 4) * 71;
            var y = Math.floor(i / 4) * 71;
            button.style.background = "url(./images/filter-spritesheets/sim-filter.png) " + -x + "px " + -y + "px";
    
            addFilterClasses(button, "sim");
            simFilterArray.appendChild(button);
        }
    }

    // Add classes to filter buttons
    function addFilterClasses (element, type) {

        element.classList.add("filter-button");
        if (type == "sim") element.id = "sim-filter-button";
        if (type == "lot") element.id = "lot-filter-button";
    
        element.addEventListener("click",
        function() {
    
        filterButtonClick(this, type);
        });
        element.addEventListener("mouseover",
        function() {
    
            mouseOverFilterChange(this, "in", type);
    
            const tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            
            if (type == "sim") tooltip.textContent = SIM_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
            if (type == "lot") tooltip.textContent = LOT_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
    
            this.appendChild(tooltip);
        });
        element.addEventListener("mouseout",
        function(){
    
            mouseOverFilterChange(this, "out", type);
    
            this.removeChild(this.children[0]);
        });
    }

    // On mouseover filter button
    function mouseOverFilterChange (button, action, type) {

        const index = Array.from(button.parentElement.children).indexOf(button);
    
        var x = (index % 4) * 71;
        var y = Math.floor(index / 4) * 71;
    
        if (type == "lot") {
    
            if (button.classList.contains("lot-filter-active")) return;
    
            if (action == "in") {
            
                button.style.background = "url(./images/filter-spritesheets/lot-filter-hover.png) " + -x + "px " + -y + "px";
            }
            else if (action == "out") {
    
                button.style.background = "url(./images/filter-spritesheets/lot-filter.png) " + -x + "px " + -y + "px";
            }
        }
        else if (type == "sim") {
    
            if (button.classList.contains("sim-filter-active")) return;
    
            if (action == "in") {
            
                button.style.background = "url(./images/filter-spritesheets/sim-filter-hover.png) " + -x + "px " + -y + "px";
            }
            else if (action == "out") {
    
                button.style.background = "url(./images/filter-spritesheets/sim-filter.png) " + -x + "px " + -y + "px";
            }
        }
    }

    // On click filter button
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
                button.style.background = "url(./images/filter-spritesheets/lot-filter.png) " + -x + "px " + -y + "px";
        
                count++;
            }
            if (sameButton) {
                writeFilterToTable("lot", "REMOVE");
            }
            else {
                var x = (index % 4) * 71;
                var y = Math.floor(index / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/lot-filter-selected.png) " + -x + "px " + -y + "px";
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
                button.style.background = "url(./images/filter-spritesheets/sim-filter.png) " + -x + "px " + -y + "px";
        
                count++;
            }
            if (sameButton) {
    
                writeFilterToTable("sim", "REMOVE");
            }
            else {
    
                var x = (index % 4) * 71;
                var y = Math.floor(index / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/sim-filter-selected.png) " + -x + "px " + -y + "px";
                button.classList.add("sim-filter-active");
                writeFilterToTable("sim", SIM_SEARCH[index]);
            }
            return;
        }
    }
    //#endregion

    return {
        buildListHeader: buildListHeader,
        populateSimList: populateSimList,
        populateLotList: populateLotList,
        writeToLabel: writeToLabel,
        fillButtonGraphics: fillButtonGraphics,
        getIndex: getIndex,
        updateBookmarkButton: updateBookmarkButton,
        writeSimThumbnail: writeSimThumbnail,
        writeLotThumbnail: writeLotThumbnail
    }
}();

apiUtils = function() {

    async function getAPIData (apiLink) {

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
    
        console.log("Pinged: " + apiLink);
    
        return obj;
    }

    //#region API url building
    function buildLongSimLink (simList) {

        var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
        for (i = 0; i < simList.avatars.length; i++) {
    
            simIdString += simList.avatars[i].avatar_id + ",";
        }
    
        simIdString = simIdString.slice(0, -1);
        return simIdString;
    }

    function buildLongLotLink (lotList) {

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
    //#endregion

    return {
        getAPIData: getAPIData,
        buildLongSimLink: buildLongSimLink,
        buildLongLotLink: buildLongLotLink,
        buildRoommateLink: buildRoommateLink
    }
}();