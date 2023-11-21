simUtils = function() {

    function returnSimAge(joinDate) {

        const now = Math.round(Date.now() / 1000);
        return Math.round((now - joinDate) / 86400);
    }

    // Return format date string from unix timestamp
    function returnDateStringFromUNIX (unixTime) {

        const d = new Date(unixTime * 1000);
        const yyyy = ("" + d.getFullYear()).slice(2);
        const mm = ("0" + (d.getMonth() + 1)).slice(-2);
        const dd = ("0" + (d.getDate())).slice(-2);

        return mm + "/" + dd + "/" + yyyy;
    }

    // Return sim time [HH, MM] in a 24 hour format
    function returnSimTime () {

        var date = Date.now() / 1000;
        var minutes = Math.floor((date % 7200) / 5);
        var simHour = Math.floor(minutes / 60);
        var simMin = minutes % 60;

        return [simHour, simMin];
    }

    // Neighborhood id's are wonky, return correct from id
    function returnNeighborhood (nhood_id) {

        if (nhood_id == 0) return "Unknown";
        if (nhood_id == 1) return NEIGHBORHOOD[0];
        else return NEIGHBORHOOD[nhood_id - 34];
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

    function returnJobsOpen () {

        const simHour = returnSimTime()[0];
        var jobsOpen = [];
        
        if (simHour >= FACTORY_START_TIME && simHour <= FACTORY_END_TIME) jobsOpen.push(1);
        if (simHour >= DINER_START_TIME && simHour <= DINER_END_TIME) jobsOpen.push(2);
        if (simHour >= CLUB_START_TIME || simHour <= CLUB_END_TIME) jobsOpen.push(4, 5);
    
        return jobsOpen;
    }

    // Return short sim from sims currently online, from avatar id
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

    return {
        returnDateStringFromUNIX: returnDateStringFromUNIX,
        returnSimAge: returnSimAge,
        isSimOnline: isSimOnline,
        returnShortSimFromLong: returnShortSimFromLong,
        returnExistenceState: returnExistenceState,
        returnLongLotFromLocation: returnLongLotFromLocation,
        returnShortLotFromLocation: returnShortLotFromLocation,
        returnLongLotFromRoommate: returnLongLotFromRoommate,
        returnOwnerFromRoommateList: returnOwnerFromRoommateList,
        returnOpenState: returnOpenState,
        returnJobsOpen: returnJobsOpen,
        returnSimTime: returnSimTime,
        returnDateStringFromUNIX: returnDateStringFromUNIX,
        returnNeighborhood: returnNeighborhood
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
            element.classList.remove("sim-in-lot-list-node-selected");
        });
    }

    // Auto size lists to fit screen
    function sizeLists() {

        let windowHeight = window.innerHeight;

        var height = Math.max(windowHeight - (GUI_SEARCH_SIM_PANEL.offsetHeight + GUI_FILTER_SIM_PANEL.offsetHeight) - 145, 416);
        height = Math.min(height, 1016);
        var heightPX = height + "px";
        GUI_ONLINESIMS.style.maxHeight = heightPX;

        var height = Math.max((windowHeight - (GUI_SEARCH_LOT_PANEL.offsetHeight + GUI_FILTER_LOT_PANEL.offsetHeight) - 261) / 2, 150);
        height = Math.min(height, 450);
        var heightPX = height + "px";
        GUI_ONLINELOTS.style.maxHeight = heightPX;
        GUI_BOOKMARK_LIST.style.maxHeight = heightPX;
    }

    return {
        getIndexInParent: getIndexInParent,
        resetListSelection: resetListSelection,
        sizeLists: sizeLists
    }
}();

eggUtils = function() {

    // TODO: Redo all of this in more easily modular way

    // Reset sim thumbnail styles
    function resetSimThumbnailStyles() {

        GUI_SIM_LABEL.className = "";
        GUI_SIM_VIEW.className = "";
        GUI_SIM_THUMBNAIL.className = "";

        GUI_SIM_LABEL.classList.add("outset-title", "sim-title");
        GUI_SIM_VIEW.classList.add("div-sim-view", "block-background");
    }

    function handleCustomStyles(selectedSim) {

        // Reset previous styles
        resetSimThumbnailStyles();

        // Do reagan
        if (selectedSim.name == EGG_REAGAN) {

            GUI_SIM_LABEL.classList.add("rainbow-title");
            GUI_SIM_VIEW.classList.add("block-gold");

            GUI_SIM_THUMBNAIL.classList.add("rainbow-image");
            GUI_SIM_THUMBNAIL.src = "./images/sim-faces/simface-rea.png?v0.2.1a";

            return;
        }

        // Get sim's custom styles
        let styleObj = new StyleObject(selectedSim.description);
        console.log(styleObj);
        if (!styleObj.usesStyle) return;

        GUI_SIM_LABEL
        GUI_SIM_VIEW
        GUI_SIM_THUMBNAIL
        
        // Block styling
        if (styleObj.styles.block != "") {

            GUI_SIM_VIEW.classList.add(styleObj.styles.block);
        }
        if (styleObj.styles.label != "") {

            GUI_SIM_LABEL.classList.add(styleObj.styles.label);
        }
    }

    return {
        resetSimThumbnailStyles: resetSimThumbnailStyles,
        handleCustomStyles: handleCustomStyles
    }
}();

guiUtils = function() {

    function writeToLabel(contentString, content, target) {

        const location = document.getElementById(target);
        const labelText = contentString + content;
        
        location.textContent = labelText;
    }

    function getSimNameFromList(listElement, index) {

        let simName = listElement.children[index].children[0].textContent;
        return simName;
    }

    //#region Populate Lot/Sim bios
    // TODO: RENAME FUNCTION
    async function getIndex(type, selectedName) {

        if (type == "sim") {
    
            // Get sim name from index
            let simName = selectedName;

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
                selectedSimLong = await apiUtils.getAPIData("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));
                selectedSimShort = simUtils.returnShortSimFromLong(selectedSimLong);
            }

            // Send data to sim bio writer
            writeGreaterSimContext(selectedSimShort, selectedSimLong, simUtils.returnExistenceState(selectedSimShort));
        }
        else if (type == "lot") {
            
            // Get lot name from index
            let lotName = selectedName;

            // Selected lot data
            let selectedLotShort;
            let selectedLotLong;
    
            // Get lot data from online lots by name
            for (let i = 0; i < simDataHolder.lotShortList.lots.length; i++) {
    
                if (simDataHolder.lotShortList.lots[i].name == lotName) {
                    
                    selectedLotShort = simDataHolder.lotShortList.lots[i];
                    selectedLotLong = simUtils.returnLongLotFromLocation(selectedLotShort.location);
                    break;
                }
            }

            // Hide sim bio
            GUI_SIM_VIEW.style.display = "none";
            
            // Write lot data
            writeLotThumbnail(selectedLotShort, selectedLotLong, "");
            writeSimsInLot(selectedLotLong, selectedLotShort.avatars_in_lot);
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
        selSimID = selectedSimShort.avatar_id;

        // TODO: REFACTOR, ADD NEW CONTENT
        if (selectedSimLong.gender == 0) GUI_SIM_THUMBNAIL.src = "./images/sim-faces/simface-m.png?v0.2.1a";
        else if (selectedSimLong.gender == 1) GUI_SIM_THUMBNAIL.src = "./images/sim-faces/simface-f.png?v0.2.1a";

        // TODO: EASTER EGGS
        eggUtils.handleCustomStyles(selectedSimLong);

        // Write sim's bio text
        GUI_SIM_BIO.textContent = selectedSimLong.description;

        // Sim description basics
        var descContent = `Age: ${simUtils.returnSimAge(selectedSimLong.date)} Days\n` + 
                          `ID: ${selectedSimLong.avatar_id}\n` + 
                          `Joined: ${simUtils.returnDateStringFromUNIX(selectedSimLong.date)}\n` +
                          `Job: ${JOB_TITLES[selectedSimLong.current_job]}\n`;

        // Is sim mayor of a neighborhood?
        if (selectedSimLong.mayor_nhood != null) descContent += "Mayor of " + simUtils.returnNeighborhood(selectedSimLong.mayor_nhood) + "\n";

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

    // Write info to lot thumbnail box
    async function writeLotThumbnail (selectedLotShort, selectedLotLong, existence, selectedSimLong) {

        // If sim not landed at a lot, contextually fill lot bio
        if ((existence != "LANDED" && existence != "LANDED_HIDDEN") && existence != "") {

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
                              `Established: ${simUtils.returnDateStringFromUNIX(selectedLotLong.created_date)}\n` + 
                              `Neighborhood: ${simUtils.returnNeighborhood(selectedLotLong.neighborhood_id)}\n` +
                              `Admit Mode: ${ADMIT_MODES[selectedLotLong.admit_mode]}\n` + 
                              `${SKILL_MODES[selectedLotLong.skill_mode]}\n\n`;

        // Set thumbnail background and lot population
        if ("error" in simUtils.returnOpenState(selectedLotShort)) {

            GUI_LOT_THUMBNAIL_BG.classList.add("thumbnail-offline");
        }
        else if (!("error" in simUtils.returnOpenState(selectedLotShort))) {

            GUI_LOT_THUMBNAIL_BG.classList.remove("thumbnail-offline");
        }

        // If town hall, skip roommates
        if (selectedLotShort.category == 11) {

            GUI_LOT_DESCRIPTION.appendChild(lotDesc);
            return;
        }

        // Get roommates of lot and owner
        let roommates = await apiUtils.getAPIData(apiUtils.buildRoommateLink(selectedLotLong));
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

                lotDescription = "Category: Air\nEstablished: Dawn of Time\nAdmit Mode: Admit All";
                lotLabel = "Floating";
                break;

            case "WORKING":

                lotDescription = "Category: Job\nMaking: Simoleons";
                lotLabel = `Working - ${JOB_STRINGS[selectedSimLong.current_job]}`;
                break;

            case "HIDDEN":

                lotDescription = "Hidden";
                lotLabel = "Hidden";
                break;

            case "OFFLINE":
            
                lotDescription = "This sim is touching grass";
                lotLabel = "Offline";
                break;

            default:

                lotDescription = "This sim is touching grass";
                lotLabel = "Offline";
                break;
        }

        // Write label and description
        writeToLabel(lotLabel, "", "thumbnail-title");
        GUI_LOT_DESCRIPTION.textContent = lotDescription;
    }

    // Change bookmark button styles
    function updateBookmarkButton (selID) {

        let bookSims = storageUtils.returnLocalStorage(STORAGE_KEY);
        let isBookmarked = false;

        // Find if sim bookmarked or not
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

            let simNode = createListNode(simList[i].name, `${simUtils.returnSimAge(simList[i].date)} Days`);
            addIndexClickHandler(simNode, "sim");

            // If Reagan, add easter egg
            if (simList[i].name == "Reaganomics Lamborghini") simNode.children[0].classList.add("rainbow-text");

            GUI_ONLINESIMS.appendChild(simNode);
        }
    }

    function populateLotList(lotList) {

        GUI_ONLINELOTS.textContent = "";
        GUI_ONLINELOTS.appendChild(buildListHeader("Name", "Population"));
        
        for (i = 0; i < lotList.length; i++) {
        
            let lotNode = createListNode(lotList[i].name, lotList[i].avatars_in_lot + " sims");
            addIndexClickHandler(lotNode, "lot");
            GUI_ONLINELOTS.appendChild(lotNode);
        }
    }

    // Write list of sims in selected lot
    function writeSimsInLot (selectedLot, population) {

        // Show sims in lot
        GUI_SIMS_IN_LOT.style.display = "flex";
        
        // Write number of sims in lot
        GUI_SIMS_IN_LOT_LABEL.textContent = `Sims In Lot: ${population}`;

        // Reset lists
        GUI_SIMS_IN_LOT_SIMS.innerHTML = "";
        GUI_SIMS_IN_LOT_ROOMMATES.innerHTML = "";

        let simListHeader = buildListHeader("Sims", "");
        simListHeader.id = "sim-in-lot-list-node";
        GUI_SIMS_IN_LOT_SIMS.appendChild(simListHeader);

        let allCount = 0;   // Known sims at lot
        let knownCount = 0; // Excludes roommates

        // For sims online
        for (let i = 0; i < simDataHolder.simShortList.avatars.length; i++) {

            // If sim is a roommate, save for later
            let simID = simDataHolder.simShortList.avatars[i].avatar_id;
            if (selectedLot.roommates.includes(simID)) continue;

            // If sim at lot and not roommate
            if (simDataHolder.simShortList.avatars[i].location == selectedLot.location) {

                let simName = simDataHolder.simShortList.avatars[i].name;
                let simNode = createListNode(simName, "");
                simNode.id = "sim-in-lot-list-node";
                
                addIndexClickHandler(simNode, "sim-in-lot");
                GUI_SIMS_IN_LOT_SIMS.appendChild(simNode);

                allCount++;
                knownCount++;
            }
        }

        // Create elements for roommates at lot text
        let roommatesHeader = buildListHeader("Roommates", "");
        roommatesHeader.id = "sim-in-lot-list-node";
        GUI_SIMS_IN_LOT_ROOMMATES.appendChild(roommatesHeader);

        // For sims online
        for (i = 0; i < simDataHolder.simShortList.avatars.length; i++) {

            // If sim is roommate of lot
            let simID = simDataHolder.simShortList.avatars[i].avatar_id
            if (selectedLot.roommates.includes(simID)) {

                // Lot is online, hidden roommate sim may be there
                if (simDataHolder.simShortList.avatars[i].privacy_mode == 1) {

                    let simName = simDataHolder.simShortList.avatars[i].name;
                    let simNode = createListNode(simName + " (Maybe)", "");
                    simNode.id = "sim-in-lot-list-node";
                    
                    addIndexClickHandler(simNode, "sim-in-lot");
                    GUI_SIMS_IN_LOT_ROOMMATES.appendChild(simNode);
                }
                // Else the sim is there
                else if (simDataHolder.simShortList.avatars[i].location == selectedLot.location) {

                    let simName = simDataHolder.simShortList.avatars[i].name;
                    let simNode = createListNode(simName, "");
                    simNode.id = "sim-in-lot-list-node";
                    
                    addIndexClickHandler(simNode, "sim-in-lot");
                    GUI_SIMS_IN_LOT_ROOMMATES.appendChild(simNode);

                    allCount++;
                }
            }
        }

        // Write extra text for number of hidden sims
        if (population - allCount > 0) {

            // Extra space
            let extraText = ""
            if (knownCount > 0) extraText += "\n";
            
            // Handle plurals
            if (knownCount == 0) extraText += `${population - allCount}  Hidden Sim` + (((population - allCount) == 1) ? "" : "s");
            else extraText += `And ${population - allCount} More Hidden Sim` + (((population - allCount) == 1) ? "" : "s");

            // Create node and append to list
            let hiddenNode = createListNode(extraText, "");
            hiddenNode.id = "sim-list-node-static";
            GUI_SIMS_IN_LOT_SIMS.appendChild(hiddenNode);
        }
    }

    function writeBookmarkSims (simList) {

        // Reset bookmark list, append header
        GUI_BOOKMARK_LIST.innerHTML = "";
        GUI_BOOKMARK_LIST.appendChild(buildListHeader("Name", "Age"));
    
        // Set sims into online or offline lists
        let onlineSims = new Array();
        let offlineSims = new Array();
        for (let i = 0; i < simList.avatars.length; i++) {
    
            let online = false;
            for (let j = 0; j < simDataHolder.simShortList.avatars.length; j++) {
                
                let simID = simDataHolder.simShortList.avatars[j].avatar_id;
                if (simList.avatars[i].avatar_id == simID) {
    
                    onlineSims.push(simList.avatars[i]);
                    online = true;
                    break;
                }
            }
            if (!online) offlineSims.push(simList.avatars[i]);
        }

        // Append and style online sims
        for (sim of onlineSims) {
            
            let simNode = createListNode(sim.name, simUtils.returnSimAge(sim.date) + " days");
            addIndexClickHandler(simNode, "bookmark");

            // If Reagan, add easter egg
            if (sim.name == "Reaganomics Lamborghini") simNode.children[0].classList.add("rainbow-text");

            GUI_BOOKMARK_LIST.append(simNode);
        }

        // Append and style offline sims
        for (sim of offlineSims) {
            
            let simNode = createListNode(sim.name, simUtils.returnSimAge(sim.date) + " days");
            simNode.classList.add("sim-list-node-offline");
            addIndexClickHandler(simNode, "bookmark");
            GUI_BOOKMARK_LIST.append(simNode);
        }
    }

    function createListNode(contentLeft, contentRight) {

        let listNode = document.createElement("div");
        listNode.id = "sim-list-node";

        let elementLeft = document.createElement("p");
        elementLeft.textContent = contentLeft;

        let elementRight = document.createElement("p");
        elementRight.textContent = contentRight;

        listNode.appendChild(elementLeft);
        listNode.appendChild(elementRight);
        return listNode;
    }

    function addIndexClickHandler(element, type) {

        if (type == "sim" || type == "bookmark") {

            element.addEventListener("click", function() {

                // Grab index of sim in list
                let index = domUtils.getIndexInParent(this);
                let simName = getSimNameFromList(this.parentElement, index);

                // Reset selection
                domUtils.resetListSelection();

                // Write sim bio
                this.classList.add("sim-list-node-selected");
                guiUtils.getIndex("sim", simName);
            });
        }
        else if (type == "lot") {

            element.addEventListener("click", function() {

                // Grab index of lot in list
                let index = domUtils.getIndexInParent(this);
                let lotName = getSimNameFromList(this.parentElement, index);

                // Reset selection
                domUtils.resetListSelection();

                // Write lot bio
                this.classList.add("sim-list-node-selected");
                guiUtils.getIndex("lot", lotName);
            });
        }
        else if (type == "sim-in-lot") {

            element.addEventListener("click", function() {

                // Grab index of sim in list
                let index = domUtils.getIndexInParent(this);
                let simName = getSimNameFromList(this.parentElement, index);

                // Reset selection
                domUtils.resetListSelection();

                // Write sim bio
                this.classList.add("sim-in-lot-list-node-selected");
                guiUtils.getIndex("sim", simName);
            });
        }
    }
    //#endregion

    return {
        writeGreaterSimContext: writeGreaterSimContext,
        buildListHeader: buildListHeader,
        populateSimList: populateSimList,
        populateLotList: populateLotList,
        writeToLabel: writeToLabel,
        getIndex: getIndex,
        updateBookmarkButton: updateBookmarkButton,
        writeSimThumbnail: writeSimThumbnail,
        writeLotThumbnail: writeLotThumbnail,
        writeBookmarkSims: writeBookmarkSims,
        writeSimsInLot: writeSimsInLot
    }
}();

filterUtils = function() {

    // Process min/max window button on click
    function minWindow(type) {

        if (type == "sim") {

            if (GUI_FILTER_SIM_ICON.classList.contains("window-minable")) {

                GUI_FILTER_SIM_ICON.classList.remove("window-minable");
                GUI_FILTER_SIM_ICON.classList.add("window-maxable");
            }
            else {

                GUI_FILTER_SIM_ICON.classList.remove("window-maxable");
                GUI_FILTER_SIM_ICON.classList.add("window-minable");
            }
            if (GUI_FILTER_SIM_ICON_ARRAY.style.display === "none") GUI_FILTER_SIM_ICON_ARRAY.style.display = "flex";
            else GUI_FILTER_SIM_ICON_ARRAY.style.display = "none";
        }
        else if (type == "lot") {

            if (GUI_FILTER_LOT_ICON.classList.contains("window-minable")) {

                GUI_FILTER_LOT_ICON.classList.remove("window-minable");
                GUI_FILTER_LOT_ICON.classList.add("window-maxable");
            }
            else {

                GUI_FILTER_LOT_ICON.classList.add("window-minable");
                GUI_FILTER_LOT_ICON.classList.remove("window-maxable");
            }
            if (GUI_FILTER_LOT_ICON_ARRAY.style.display === "none") GUI_FILTER_LOT_ICON_ARRAY.style.display = "flex";
            else GUI_FILTER_LOT_ICON_ARRAY.style.display = "none";
        }
        domUtils.sizeLists();
    }

    // Filter array and send to list
    function writeFilterToTable (type, filter) {

        if (type == "sim") {

            if (filter == "REMOVE") guiUtils.populateSimList(simDataHolder.simLongList.avatars);
            else guiUtils.populateSimList(filterUtils.returnFilterSimList(filter));

        } 
        else if(type == "lot") {

            if (filter == "REMOVE") guiUtils.populateLotList(simDataHolder.lotShortList.lots);
            else guiUtils.populateLotList(filterUtils.returnFilterLotList(filter));
        }
    }

    // Return filtered sim list from selected filter
    function returnFilterSimList (filter) {

        let longList = new Array();

        let simLongList = simDataHolder.simLongList;
        let simShortList = simDataHolder.simShortList;

        switch (filter) {

            case "JOB_DINER":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job == 2) longList.push(simLongList.avatars[i]);
                }
                break;

            case "JOB_CLUB":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job > 3) longList.push(simLongList.avatars[i]);
                }
                break;

            case "JOB_ROBOT":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job == 1) longList.push(simLongList.avatars[i]);
                }
                break;

            case "LANDED":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "LANDED") longList.push(simLongList.avatars[i]);
                }
                break;

            case "SHOWN":

                for (i = 0; i < simShortList.avatars.length; i++) {
                    if (simShortList.avatars[i].privacy_mode == 0) longList.push(simLongList.avatars[i]);
                }
                break;

            case "HIDDEN":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "HIDDEN" || existence == "LANDED_HIDDEN") longList.push(simLongList.avatars[i]);
                }
                break;

            case "FOUND":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "LANDED_HIDDEN") longList.push(simLongList.avatars[i]);
                }
                break;

            case "FLOATING":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "FLOATING") longList.push(simLongList.avatars[i]);
                }
                break;

            case "WORKING":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "WORKING") longList.push(simLongList.avatars[i]);
                }
                break;

            default:
                break;
        }
        return longList;
    }

    // Return filtered lot list from selected filter
    function returnFilterLotList (filter) {

        let shortList = new Array();
        for (let i = 0; i < simDataHolder.lotShortList.lots.length; i++) {

            if (simDataHolder.lotShortList.lots[i].category == LOT_SEARCH_ID[filter]) shortList.push(simDataHolder.lotShortList.lots[i]);
        }
        return shortList;
    }

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
    
        element.addEventListener("click", function() {
    
            filterButtonClick(this, type);
        });

        element.addEventListener("mouseover", function() {
    
            filterUtils.mouseOverFilterChange(this, "in", type);
            let tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            
            if (type == "sim") tooltip.textContent = SIM_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
            if (type == "lot") tooltip.textContent = LOT_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
    
            this.appendChild(tooltip);
        });

        element.addEventListener("mouseout", function(){
    
            filterUtils.mouseOverFilterChange(this, "out", type);
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

    return {
        minWindow: minWindow,
        writeFilterToTable: writeFilterToTable,
        returnFilterSimList: returnFilterSimList,
        returnFilterLotList: returnFilterLotList,
        filterButtonClick: filterButtonClick,
        mouseOverFilterChange: mouseOverFilterChange,
        addFilterClasses: addFilterClasses,
        fillButtonGraphics: fillButtonGraphics
    }
}();

searchUtils = function() {

    // Retrieve long sim from database
    async function searchSim() {

        // Search sim's name in api
        let simName = GUI_SEARCH_SIM.value;
        let simLong = await apiUtils.getAPIData("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));

        // Alert if sim doesn't exist
        if ("error" in simLong) {

            alert("Cannot find sim \"" + simName + "\"");
            return;
        }

        // Get searched sim data
        let simShort = simUtils.returnShortSimFromLong(simLong);
        let existence = simUtils.returnExistenceState(simShort);

        // Write to sim bio
        guiUtils.writeGreaterSimContext(simShort, simLong, existence);
    }

    // Retrieve long lot from database
    async function searchLot() {

        // Search lot in api
        let lotName = GUI_SEARCH_LOT.value;
        let lotLong = await apiUtils.getAPIData("https://api.freeso.org/userapi/city/1/lots/name/" + lotName.replace(" ", "%20"));

        // Alert if lot doesn't exist
        if ("error" in lotLong) {

            alert("Cannot find lot \"" + lotName + "\"");
            return;
        }

        // Get lot data
        let lotShort = simUtils.returnShortLotFromLocation(lotLong.location);
        guiUtils.writeLotThumbnail(lotShort, lotLong, "");

        // If lot online, write sims in lot
        if (!("error" in lotShort)) {

            GUI_SIMS_IN_LOT.style.display = "flex";
            guiUtils.writeSimsInLot(lotLong, lotShort.avatars_in_lot);
        }
        else GUI_SIMS_IN_LOT.style.display = "none";

        // Hide irrelevant gui elements
        GUI_SIM_VIEW.style.display = "none";
    }

    return {
        searchSim: searchSim,
        searchLot: searchLot
    }
}();

sidebarUtils = function() {

    function updateSidebar() {

        writeSimClock();
        writeActiveJobs();
    }

    function expandSidebar() {

        // Do animation for expanding/retracting sidebar window
        if (!SIDEBAR.classList.contains("animate-sidebar")) {

            SIDEBAR.classList.remove("animate-sidebar-reverse");
            SIDEBAR_EXPAND_BUTTON.classList.remove("animate-sidebar-button-reverse");
            SIDEBAR_CONTAINER.classList.remove("animate-sidebar-holder-reverse");

            SIDEBAR_CONTAINER.classList.add("animate-sidebar-holder");
            SIDEBAR.classList.add("animate-sidebar");
            SIDEBAR_EXPAND_BUTTON.classList.add("animate-sidebar-button");

            toggleSidebarElements("show");
        }
        else {

            SIDEBAR.classList.remove("animate-sidebar");
            SIDEBAR_EXPAND_BUTTON.classList.remove("animate-sidebar-button");
            SIDEBAR_CONTAINER.classList.remove("animate-sidebar-holder");

            SIDEBAR_CONTAINER.classList.add("animate-sidebar-holder-reverse");
            SIDEBAR.classList.add("animate-sidebar-reverse");
            SIDEBAR_EXPAND_BUTTON.classList.add("animate-sidebar-button-reverse");

            toggleSidebarElements("hide");
        }
    }

    function toggleSidebarElements(visibility) {

        // Hide/show sidebar elements
        const toggleElements = document.getElementsByClassName("sidebar-hide");
        if (visibility == "hide") {

            for (let i = 0; i < toggleElements.length; i++) toggleElements[i].style.display = "none";
        }
        else if (visibility == "show") {

            for (let i = 0; i < toggleElements.length; i++) toggleElements[i].style.display = "block";
        }
    }

    // Format to sim-time and write to clock
    function writeSimClock() {

        // Get sim time
        const simTime = simUtils.returnSimTime();
        
        // Format to 12 hour clock
        let timeDenom = "AM";
        if (simTime[0] >= 12) {

            timeDenom = "PM";
            simTime[0] %= 12;
        }
        if (simTime[0] == 0) {

            simTime[0] = 12;
        }
        if (simTime[1] < 10) {
            simTime[1] = "0" + simTime[1];
        }

        // Write clock to element
        SIDEBAR_CLOCK.textContent = simTime[0] + ":" + simTime[1] + " " + timeDenom;
    }

    // Display which jobs are currently active
    function writeActiveJobs() {

        // Get open jobs
        let jobsActive = simUtils.returnJobsOpen();

        // Set job icon to inactive
        SIDEBAR_JOB_FACTORY.style.background = "url(./images/buttons/jobs-active.png) 40px 0";
        SIDEBAR_JOB_DINER.style.background = "url(./images/buttons/jobs-active.png) 40px 80px";
        SIDEBAR_JOB_CLUB.style.background = "url(./images/buttons/jobs-active.png) 40px 40px";

        // Set active jobs to active icon
        if (jobsActive.includes(1)) SIDEBAR_JOB_FACTORY.style.background = "url(./images/buttons/jobs-active.png) 0 0";
        if (jobsActive.includes(2)) SIDEBAR_JOB_DINER.style.background = "url(./images/buttons/jobs-active.png) 0 80px";
        if (jobsActive.includes(4)) SIDEBAR_JOB_CLUB.style.background = "url(./images/buttons/jobs-active.png) 0 40px";
    }

    // Write about info in sidebar info panel 
    async function writeSidebarInfo() {

        let gitJson = await apiUtils.returnGitCommitJson();
        let date = gitJson.commit.commit.author.date.slice(0, 10);

        let infoText = "Sim Finder\n\nLast Update:\n" + date;
        SIDEBAR_INFO.textContent = infoText;
    }

    return {
        expandSidebar: expandSidebar,
        writeSidebarInfo: writeSidebarInfo,
        updateSidebar: updateSidebar,
        toggleSidebarElements: toggleSidebarElements
    }
}();

marketWatchUtils = function() {

    function returnMarketObject (simLong, simShort, lotShort) {

        let marketObject = new MarketObject(simLong, simShort, lotShort);
        return marketObject;
    }

    function writeMarketWatch(marketObj) {

        // Write market breakdown text
        let breakdownText = `$${(marketObj.moneyPerHourJob + marketObj.moneyPerHourSMO).toLocaleString("en-US")} Generated Per Hour\n\n` + 
                            `SMO Total $/Hr: $${marketObj.moneyPerHourSMO.toLocaleString("en-US")}\n` + 
                            `${marketObj.simsSMO} Sims at ${marketObj.moneyLots.length} Money Lots\n\n` +
                            `Job Total $/Hr: $${marketObj.moneyPerHourJob.toLocaleString("en-US")}\n` +
                            `${marketObj.simsWorking} Sims at ${simUtils.returnJobsOpen().length} Job(s)\n\n` + 
                            "(Values Heavily Estimated)";
        GUI_MARKET_BREAKDOWN.textContent = breakdownText;

        // Write top 3 money lots
        let hotspotText = "Top Money Lots: \n\n";
        marketObj.moneyLots.sort(({lotMoney:a}, {lotMoney:b}) => b - a);
        for (let i = 0; i < 3 && i < marketObj.moneyLots.length; i++) {

            hotspotText += `${(i + 1)}. ${marketObj.moneyLots[i].lotObj.name}\n` + 
                           ` - $${(marketObj.moneyLots[i].lotMoney).toLocaleString("en-US")} $/Hr Total\n\n`;
        }
        hotspotText = hotspotText.slice(0, -1);
        GUI_MARKET_HOTSPOTS.textContent = hotspotText;
    }

    return {
        returnMarketObject: returnMarketObject,
        writeMarketWatch: writeMarketWatch
    }
}();

apiUtils = function() {

    // Return git json so i can get the date
    async function returnGitCommitJson() {

        const apiLink = "https://api.github.com/repos/sam-chug/sim-finder/branches/master";

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();

        console.log("Pinged: " + apiLink);

        return obj;
    }

    async function getAPIData (apiLink) {

        // Stupid catch for landed-hidden sims
        if (apiLink.includes("(Maybe)")) apiLink = apiLink.replace("(Maybe)", "");

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
    
        console.log("Pinged: " + apiLink);
    
        return obj;
    }

    //#region API url building
    // Id list to sim object (for bookmark id list)
    function buildLongSimLinkFromID(idList) {

        let simIdString = "https://api.freeso.org/userapi/avatars?ids=";
        for (i = 0; i < idList.length; i++) {
        
            simIdString += idList[i] + ",";
        }
        simIdString = simIdString.slice(0, -1);
        return simIdString;
    }

    function buildLongSimLink (simList) {

        let simIdString = "https://api.freeso.org/userapi/avatars?ids=";
        for (i = 0; i < simList.avatars.length; i++) {
    
            simIdString += simList.avatars[i].avatar_id + ",";
        }
    
        simIdString = simIdString.slice(0, -1);
        return simIdString;
    }

    function buildLongLotLink (lotList) {

        let lotIDString = "https://api.freeso.org/userapi/lots?ids=";
        for (i = 0; i < lotList.lots.length; i++) {
    
            lotIDString += lotList.lots[i].lot_id + ",";
        }
    
        lotIDString = lotIDString.slice(0, -1);
        return lotIDString;
    }

    // Builds api link from lot's roommates
    function buildRoommateLink (longLot) {

        let roommateIDString = "https://api.freeso.org/userapi/avatars?ids=";
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
        buildRoommateLink: buildRoommateLink,
        buildLongSimLinkFromID: buildLongSimLinkFromID,
        returnGitCommitJson: returnGitCommitJson
    }
}();

storageUtils = function() {

    function checkIfStorageEmpty(storageKey) {

        // If storage empty or sim ID list is empty
        return (JSON.parse(localStorage.getItem(storageKey)) == null ||
        JSON.parse(localStorage.getItem(storageKey)).simID.length == 0);
    }

    function setDefaultStorage(storageKey) {

        // If storage is not empty, return
        if (!checkIfStorageEmpty(storageKey)) return;

        // Clear previous storage, just in case
        localStorage.removeItem(storageKey);

        // Set storage to have one sim ID
        let initStorage = { simID: [194687] };
        localStorage.setItem(storageKey, JSON.stringify(initStorage));
    }

    function removeStorageKey(storageKey) {

        localStorage.removeItem(storageKey);
    }

    function changeStorageKey(oldKey, newKey) {

        let oldStorageEmpty = checkIfStorageEmpty(oldKey);
        let newStorageEmpty = checkIfStorageEmpty(newKey);

        if (newStorageEmpty && !oldStorageEmpty) {

            // Get data from previous key
            let oldStorage = returnLocalStorage(oldKey);
            let oldStorageString = JSON.stringify(oldStorage);

            // Write old data to new key
            saveStorage(newKey, oldStorageString);

            // Remove data from old key
            removeStorageKey(oldKey);
        }
    }

    function saveStorage(storageKey, storageString) {

        localStorage.setItem(storageKey, storageString);
    }

    function addBookmark(addID) {

        // Get bookmark storage, append new bookmark
        let bookmarkStorage = returnLocalStorage(STORAGE_KEY);
        bookmarkStorage.simID.push(addID);
        
        // Save local storage
        let storageString = JSON.stringify(bookmarkStorage);
        saveStorage(STORAGE_KEY, storageString);
    }

    function deleteBookmark(deleteID) {

        // Get bookmark storage
        let bookmarkStorage = returnLocalStorage(STORAGE_KEY);

        // Remove id from bookmarks
        let index = bookmarkStorage.simID.indexOf(deleteID);
        if (index > -1) {
            bookmarkStorage.simID.splice(index, 1);
        }
        
        // Save local storage
        let storageString = JSON.stringify(bookmarkStorage);
        saveStorage(STORAGE_KEY, storageString);
    }

    function returnLocalStorage(storageKey) {

        // If storage empty, set default storage
        if (checkIfStorageEmpty(storageKey)) setDefaultStorage(storageKey);

        // Return json from local storage
        let simIDObject = JSON.parse(localStorage.getItem(storageKey));
        return simIDObject;
    }

    // When bookmark button clicked
    async function handleBookmarkCheck() {

        // If adding bookmark
        if (GUI_BOOKMARK_BUTTON.checked) {

            // Add bookmark to list
            storageUtils.addBookmark(selSimID);

            // Get data from new bookmark list, fetch in case sim was offline
            let addSim = await apiUtils.getAPIData(apiUtils.buildLongSimLinkFromID([selSimID]));
            simDataHolder.bookmarkList.avatars.push(addSim.avatars[0]);
        }
        // If removing bookmark
        else {

            // Remove bookmark
            storageUtils.deleteBookmark(selSimID);

            // Remove sim from bookmark list
            for (let i = 0; i < simDataHolder.bookmarkList.avatars.length; i++) {

                if (simDataHolder.bookmarkList.avatars[i].avatar_id == selSimID) {

                    simDataHolder.bookmarkList.avatars.splice(i, 1);
                    break;
                }
            }
        }

        // Sort sims by id, rewrite bookmark list
        simDataHolder.bookmarkList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
        guiUtils.writeBookmarkSims(simDataHolder.bookmarkList);
    }

    return {
        checkIfStorageEmpty: checkIfStorageEmpty,
        handleBookmarkCheck: handleBookmarkCheck,
        setDefaultStorage: setDefaultStorage,
        changeStorageKey: changeStorageKey,
        returnLocalStorage: returnLocalStorage,
        deleteBookmark: deleteBookmark,
        addBookmark: addBookmark
    }
}();