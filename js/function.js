simUtils = function() {

    //#region Sim time functions
    function returnSimAge(joinDate) {

        let utcNow = new Date().getTime();
        let now = Math.round(utcNow / 1000);
        return Math.floor((now - joinDate) / 86400);
    }

    function checkIfSimBirthday(simUnix) {

        let utcNow = Math.floor(Date.now() / 1000);

        let dateObjectNow = returnDateObjectFromUNIX(utcNow);
        let simDateObject = returnDateObjectFromUNIX(simUnix);
        let simDayAge = returnSimAge(simUnix);

        // Make sure sim isnt old day old
        if (simDayAge == 0) return false;
        // Catch 1000 day milestones
        if (simDayAge % 1000 == 0) return true;

        // Check if today is sim's birthday
        if (dateObjectNow.day == simDateObject.day && dateObjectNow.month == simDateObject.month) return true;
        return false;
    }

    // Return format date string from unix timestamp
    function returnDateObjectFromUNIX(unixTime) {

        let utcNow = new Date(new Date().getTime());
        utcNow.setDate(utcNow.getDate() - returnSimAge(unixTime));

        let yyyy = ("" + utcNow.getFullYear()).slice(2);
        let mm = ("0" + (utcNow.getMonth() + 1)).slice(-2);
        let dd = ("0" + (utcNow.getDate())).slice(-2);

        let timeObject = {
            month: mm,
            day: dd,
            year: yyyy
        }

        return timeObject
    }

    function returnTextDateFromDateObject(dateObject) {

        return dateObject.month + "/" + dateObject.day + "/" + dateObject.year;
    }

    // Return sim time [HH, MM] in a 24 hour format
    function returnSimTime() {

        var date = Date.now() / 1000;
        var minutes = Math.floor((date % 7200) / 5);
        var simHour = Math.floor(minutes / 60);
        var simMin = minutes % 60;

        return [simHour, simMin];
    }
    //#endregion

    //#region Sim/lot state finders

    // Check if sim is in list of known staff sims
    function isSimStaffMember(simName) {

        let simLower = simName.toLowerCase();
        for (let i = 0; i < STAFF_NAMES.length; i++) {

            let staffLower = STAFF_NAMES[i].toLowerCase();
            if (simLower === staffLower) return true;
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

    function isSimOnline(simName) {

        for (let i = 0; i < simDataHolder.simShortList.avatars.length; i++) {
            
            if (simDataHolder.simShortList.avatars[i].name == simName) return true;
        }
        return false;
    }

    // Return if lot is open or closed
    function returnOpenState(lotLong) {
    
        for (i = 0; i < simDataHolder.lotShortList.lots.length; i++) {
            
            let lotID = simDataHolder.lotShortList.lots[i].lot_id;
            if (lotLong.lot_id == lotID) return simDataHolder.lotShortList.lots[i];
        }
        return {error:"lot not online"};
    }
    //#endregion

    //#region Short/long sim/lot finders
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
    //#endregion

    //#region Lot/Sim cache
    // TODO: combine these two functions?
    // Check if sim is in offline long cache
    function checkIfSimInLongCache(simName) {

        simName = simName.toLowerCase()
        for (let i = 0; i < simDataHolder.offlineLongSimList.length; i++) {

            if (simName == simDataHolder.offlineLongSimList[i].name.toLowerCase()) return true;
        }
        return false;
    }

    // Return sim from offline cache
    function returnSimFromLongCache(simName) {

        let simLong;
        simName = simName.toLowerCase();
        for (let i = 0; i < simDataHolder.offlineLongSimList.length; i++) {

            if (simName == simDataHolder.offlineLongSimList[i].name.toLowerCase()) simLong = simDataHolder.offlineLongSimList[i];
        }
        return simLong;
    }

    // Check if lot is in offline long cache
    function checkIfLotInLongCache(lotName) {

        lotName = lotName.toLowerCase();
        for (let i = 0; i < simDataHolder.offlineLongLotList.length; i++) {

            if (lotName == simDataHolder.offlineLongLotList[i].name.toLowerCase()) return true;
        }
        return false;
    }

    // Return lot from offline cache
    function returnLotFromLongCache(lotName) {

        let lotLong;
        lotName = lotName.toLowerCase();
        for (let i = 0; i < simDataHolder.offlineLongLotList.length; i++) {

            if (lotName == simDataHolder.offlineLongLotList[i].name.toLowerCase()) lotLong = simDataHolder.offlineLongLotList[i];
        }
        return lotLong;
    }
    //#endregion

    // Neighborhood id's are wonky, return correct from id
    function returnNeighborhood(nhood_id) {

        if (nhood_id == 0) return "Unknown";
        if (nhood_id == 1) return NEIGHBORHOOD[0];
        else return NEIGHBORHOOD[nhood_id - 34];
    }

    // Return array of currently active jobs
    function returnJobsOpen() {

        const simHour = returnSimTime()[0];
        var jobsOpen = [];
        
        if (simHour >= FACTORY_START_TIME && simHour <= FACTORY_END_TIME) jobsOpen.push(1);
        if (simHour >= DINER_START_TIME && simHour <= DINER_END_TIME) jobsOpen.push(2);
        if (simHour >= CLUB_START_TIME || simHour <= CLUB_END_TIME) jobsOpen.push(4, 5);
    
        return jobsOpen;
    }

    // Sort lots/sims by name or age
    function sortEntityList(entityType) {

        if (entityType == "sim") {

            if (simDataHolder.simSort == "age") {

                simDataHolder.simShortList.avatars.sort((a, b) => a.name.localeCompare(b.name));
                simDataHolder.simLongList.avatars.sort((a, b) => a.name.localeCompare(b.name));
                
                GUI_SORT_SIM_NAMES.style.background = `url(./images/buttons/name-sort-selected.png?v0.2.4a)`;
                simDataHolder.simSort = "name";
            }
            else if (simDataHolder.simSort == "name") {

                simDataHolder.simShortList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
                simDataHolder.simLongList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);

                GUI_SORT_SIM_NAMES.style.background = `url(./images/buttons/name-sort.png?v0.2.4a)`;
                simDataHolder.simSort = "age";
            }
            let simFilter = (simDataHolder.simFilter == "REMOVE") ? "REMOVE" : SIM_FILTER_KEYS[simDataHolder.simFilter];
            filterUtils.writeFilterToTable("sim", simFilter);
            //guiUtils.populateSimList(simDataHolder.simLongList.avatars);
        }
        else if (entityType == "lot") {

            if (simDataHolder.lotSort == "pop") {

                simDataHolder.lotShortList.lots.sort((a, b) => a.name.localeCompare(b.name));
                simDataHolder.lotLongList.lots.sort((a, b) => a.name.localeCompare(b.name));

                GUI_SORT_LOT_NAMES.style.background = `url(./images/buttons/name-sort-selected.png?v0.2.4a)`;
                simDataHolder.lotSort = "name";
            }
            else if (simDataHolder.lotSort == "name") {

                simDataHolder.lotLongList.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);
                simDataHolder.lotShortList.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);

                GUI_SORT_LOT_NAMES.style.background = `url(./images/buttons/name-sort.png?v0.2.4a)`;
                simDataHolder.lotSort = "pop";
            }
            filterUtils.writeFilterToTable("lot", simDataHolder.lotFilter);
            //guiUtils.populateLotList(simDataHolder.lotShortList.lots);
        }
    }

    return {
        returnDateObjectFromUNIX: returnDateObjectFromUNIX,
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
        returnNeighborhood: returnNeighborhood,
        returnTextDateFromDateObject: returnTextDateFromDateObject,
        checkIfSimBirthday: checkIfSimBirthday,
        sortEntityList: sortEntityList,
        isSimStaffMember: isSimStaffMember,
        checkIfSimInLongCache: checkIfSimInLongCache,
        returnSimFromLongCache: returnSimFromLongCache,
        checkIfLotInLongCache: checkIfLotInLongCache,
        returnLotFromLongCache: returnLotFromLongCache
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

        GUI_BOOKMARK_LIST.style.maxHeight = "400px";
    }

    // Brute force because my css is bad
    function centerListLabels() {

        let simLabel = document.getElementById("sims-online-count-label");
        let simLabelRect = simLabel.getBoundingClientRect();

        let lotLabel = document.getElementById("lots-online-count-label");
        let lotLabelRect = lotLabel.getBoundingClientRect();

        simLabel.style.marginLeft = `calc(50% - ${simLabelRect.width / 2}px)`;
        lotLabel.style.marginLeft = `calc(50% - ${lotLabelRect.width / 2}px)`;
    }

    function copyTextToClipboard(e) {

        navigator.clipboard.writeText(apiUtils.cleanLink(e.textContent));
    }

    function swapColorMode() {

        // Change user settings and swap color modes
        if (simDataHolder.userSetting.colorMode == "lightmode") {

            simDataHolder.userSetting.colorMode = "darkmode";
            siteColorMode("darkmode");
        }
        else if (simDataHolder.userSetting.colorMode == "darkmode") {

            simDataHolder.userSetting.colorMode = "lightmode";
            siteColorMode("lightmode");
        }

        // Update storage
        storageUtils.saveStorage(SETTINGS_KEY, JSON.stringify(simDataHolder.userSetting));
    }

    function siteColorMode(state) {

        let domRoot = document.querySelector(':root');
        if (state == "lightmode") {

            domRoot.style.setProperty("--bg-fallback", "#7ca1bf");

            domRoot.style.setProperty("--inset-bg", "#32455b");
            domRoot.style.setProperty("--inset-bg-dark", "#2f4158");
            domRoot.style.setProperty("--block-gradient-light", "#96bad0");
            domRoot.style.setProperty("--block-gradient-dark", "#5f88af");
            domRoot.style.setProperty("--outset-title-bg", "#5077a3");

            domRoot.style.setProperty("--bg-dark-gradient-light", "#5f88af");
            domRoot.style.setProperty("--bg-dark-gradient-dark", "#476a8d");
        }
        else if (state == "darkmode") {

            domRoot.style.setProperty("--bg-fallback", "#7c7c7c");

            domRoot.style.setProperty("--inset-bg", "#222222");
            domRoot.style.setProperty("--inset-bg-dark", "#111111");
            domRoot.style.setProperty("--block-gradient-light", "#444444");
            domRoot.style.setProperty("--block-gradient-dark", "#333333");
            domRoot.style.setProperty("--outset-title-bg", "#555555");

            domRoot.style.setProperty("--bg-dark-gradient-light", "#222222");
            domRoot.style.setProperty("--bg-dark-gradient-dark", "#111111");
        }
    }

    function buildButtonTooltips() {

        addTooltipToButton(GUI_EXPORT_BUTTON, "export");
        addTooltipToButton(GUI_IMPORT_BUTTON, "import");

        addTooltipToButton(GUI_SORT_SIM_NAMES, "sort");
        addTooltipToButton(GUI_SORT_LOT_NAMES, "sort");

        addTooltipToButton(GUI_SEARCH_SIM_BUTTON, "search");
        addTooltipToButton(GUI_SEARCH_LOT_BUTTON, "search");

        addTooltipToButton(GUI_FILTER_SIM_ICON, "min");
        addTooltipToButton(GUI_FILTER_LOT_ICON, "min");
        
        addTooltipToButton(GUI_SIM_HELP_BUTTON, "style-help");
        addTooltipToButton(GUI_COLORMODE_BUTTON, "colormode");

        addTooltipToButton(SIDEBAR_JOB_DINER, "job", "diner");
        addTooltipToButton(SIDEBAR_JOB_CLUB, "job", "club");
        addTooltipToButton(SIDEBAR_JOB_FACTORY, "job", "factory");
    }

    function addTooltipToButton(element, type, subType) {

        element.addEventListener("mouseover", function() {
    
            filterUtils.mouseOverFilterChange(this, "in", type);
            let tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");

            switch (type) {

                case "export":
                    tooltip.textContent = "Export Bookmarks";
                    tooltip.classList.add("low-tooltip");
                    break;

                case "import":
                    tooltip.textContent = "Import Bookmarks";
                    tooltip.classList.add("low-tooltip");
                    break;

                case "search":
                    tooltip.textContent = "Search";
                    tooltip.classList.add("mid-tooltip");
                    break;
                
                case "sort":
                    tooltip.textContent = "Toggle Alphabetical Sort";
                    tooltip.classList.add("mid-tooltip");
                    break;

                case "min":
                    tooltip.textContent = "Toggle Filters";
                    tooltip.classList.add("low-tooltip");
                    break;

                case "style-help":
                    tooltip.textContent = "Open Sim Panel Formatting Help Page";
                    tooltip.classList.add("under-tooltip");
                    break;

                case "colormode":
                    tooltip.textContent = "Toggle Light";
                    tooltip.classList.add("mid-tooltip");
                    break;

                case "job":
                    let string = ""
                    if      (subType == "diner") string = "Diner Job Activity"
                    else if (subType == "club") string = "Club Job Activity"
                    else if (subType == "factory") string = "Factory Job Activity"
    
                    tooltip.textContent = string;
                    tooltip.classList.add("under-tooltip");
    
                    // Idk why this is messed up
                    tooltip.style.fontSize = "1em";
                    break;
            }

            // Add tooltip to element
            this.append(tooltip);
        });

        element.addEventListener("mouseout", function(){
    
            if (this.children.length > 0) {

                filterUtils.mouseOverFilterChange(this, "out", type);
                this.removeChild(this.children[0]);
            }
        });
    }

    return {
        getIndexInParent: getIndexInParent,
        resetListSelection: resetListSelection,
        sizeLists: sizeLists,
        copyTextToClipboard: copyTextToClipboard,
        centerListLabels: centerListLabels,
        siteColorMode: siteColorMode,
        buildButtonTooltips: buildButtonTooltips,
        swapColorMode: swapColorMode
    }
}();

eggUtils = function() {

    // Reset sim thumbnail styles
    function resetSimThumbnailStyles() {

        GUI_SIM_VIEW.className = "";

        GUI_SIM_LABEL.className = "";
        GUI_SIM_THUMBNAIL.className = "";
        GUI_SIM_LABEL.classList.add("outset-title", "sim-title");
        GUI_SIM_VIEW.classList.add("div-sim-view", "block-background");

        GUI_SIM_BIO.className = "";
        GUI_SIM_DESCRIPTION.className = "";
        GUI_SIM_BIO.classList.add("thumbnail-bio-holder", "scrollbar");
        GUI_SIM_DESCRIPTION.classList.add("thumbnail-desc-holder");

        GUI_BOOKMARK_LABEL.className = "";
        GUI_BOOKMARK_LABEL.classList.add("bookmark-label");
    }

    function resetLotThumbnailStyles() {

        GUI_LOT_LABEL.className = "";
        GUI_LOT_VIEW.className = "";
        
        GUI_LOT_LABEL.classList.add("outset-title", "thumb-1-1");
        GUI_LOT_VIEW.classList.add("div-thumbnail", "block-background");

        GUI_LOT_DESCRIPTION.className = "";
        GUI_LOT_BIO.className = "";

        GUI_LOT_DESCRIPTION.classList.add("thumbnail-desc-holder", "thumb-2", "lot-thumbnail-info-text");
        GUI_LOT_BIO.classList.add("thumbnail-desc-holder", "thumb-2", "thumbnail-bio-holder", "scrollbar", "lot-thumbnail-bio");
    }

    function reaganEgg() {

        GUI_SIM_LABEL.classList.add("label-gold");
        GUI_SIM_VIEW.classList.add("block-gold");
        
        GUI_SIM_THUMBNAIL.classList.add("reagan-image");

        GUI_SIM_BIO.classList.add("inset-gold");
        GUI_SIM_DESCRIPTION.classList.add("inset-gold");

        GUI_BOOKMARK_LABEL.classList.add("bookmark-gold");
    }   

    function testCustomStyle(color) {

        // Test specified style
        GUI_SIM_VIEW.classList.add(CUSTOM_STYLE_BLOCK[`b${color}`].cssClass);
        GUI_SIM_LABEL.classList.add(CUSTOM_STYLE_LABEL[`l${color}`].cssClass);
        GUI_SIM_BIO.classList.add(CUSTOM_STYLE_INSET[`i${color}`].cssClass);
        GUI_SIM_DESCRIPTION.classList.add(CUSTOM_STYLE_INSET[`i${color}`].cssClass);
    }

    function handleCustomLotStyles(selectedLot) {

        // Reset previous styles
        resetLotThumbnailStyles();

        // Get lot custom styles
        let styleObj = new StyleObject(selectedLot);
        if (styleObj.isBirthday) eggUtils.spawnConfetti("lot", "confetti");
        if (!styleObj.usesStyle) return;

        // Set styles
        if (styleObj.styles.block != "") GUI_LOT_VIEW.classList.add(styleObj.styles.block);
        if (styleObj.styles.label != "") GUI_LOT_LABEL.classList.add(styleObj.styles.label);
        if (styleObj.styles.inset != "") {

            GUI_LOT_BIO.classList.add(styleObj.styles.inset);
            GUI_LOT_DESCRIPTION.classList.add(styleObj.styles.inset);
        }
    }

    function handleCustomSimStyles(selectedSim) {

        // Reset previous styles
        resetSimThumbnailStyles();

        // Assure sim view is open
        GUI_SIM_VIEW.style.display = "flex";

        // Test any custom style
        //testCustomStyle("o");
        //return;

        // Do reagan
        if (selectedSim.name == CUSTOM_STYLE_REAGAN) {

            reaganEgg();
            spawnConfetti("sim", "reagan");
        }

        // Get sim's custom styles
        let styleObj = new StyleObject(selectedSim);
        if (styleObj.isBirthday) spawnConfetti("sim", "confetti");
        if (styleObj.isStaff) spawnConfetti("sim", "staff");

        // Set head
        GUI_SIM_THUMBNAIL.src = styleObj.avatarHead;
        if (styleObj.isStaff) GUI_SIM_THUMBNAIL.classList.add("staff-image");

        if (!styleObj.usesStyle) return;
        if (styleObj.styles.block != "") GUI_SIM_VIEW.classList.add(styleObj.styles.block);
        if (styleObj.styles.bookmarkLabel != "") GUI_BOOKMARK_LABEL.classList.add(styleObj.styles.bookmarkLabel);
        if (styleObj.styles.label != "") GUI_SIM_LABEL.classList.add(styleObj.styles.label);
        if (styleObj.styles.inset != "") {

            GUI_SIM_BIO.classList.add(styleObj.styles.inset);
            GUI_SIM_DESCRIPTION.classList.add(styleObj.styles.inset);
        }
    }

    var confettiObjects = new Array();
    function spawnConfetti(entity, type) {

        let confettiData = CONFETTI_DATA[type];
        let parentElement = (entity == "sim") ? GUI_SIM_VIEW : GUI_LOT_VIEW;
        let spawnRect = parentElement.getBoundingClientRect();

        let spawnedConfetti = {
            confettiElements: new Array(),
            timeFired: performance.now()
        }

        for (let i = 0; i < CONFETTI_SPAWN_COUNT; i++) {

            // Create and randomly place confetti container over sim/lot panel
            let confettiNode = document.createElement("div");
            confettiNode.classList.add("confetti-container");

            let spawnX = spawnRect.left + (Math.random() * spawnRect.width);
            let spawnY = spawnRect.top + (Math.random() * spawnRect.height)
            confettiNode.style.left = `${spawnX}px`;
            confettiNode.style.top = `${spawnY}px`;

            let centerX = (spawnRect.width / 2) + spawnRect.left;
            let centerY = (spawnRect.height / 2) + spawnRect.top;
            confettiNode.style.rotate = `${findConfettiAngle(centerX, centerY, spawnX, spawnY)}deg`;

            // Create and assign random image to confetti image
            let confettiImage = document.createElement("div");
            confettiImage.classList.add("confetti-image");
            let imageX = Math.floor(Math.random() * confettiData.sheetWidth);
            let imageY = Math.floor(Math.random() * confettiData.sheetHeight);
            confettiImage.style.background = `url(${confettiData.src}) ${-imageX * 16}px ${-imageY * 16}px`

            // Append to parent element
            confettiNode.append(confettiImage);
            parentElement.append(confettiNode);
            spawnedConfetti.confettiElements.push(confettiNode);
        }
        confettiObjects.push(spawnedConfetti);
        setTimeout(() => {
            eggUtils.removeConfetti();
        }, 950);
    }

    function removeConfetti() {

        if (confettiObjects.length <= 0) return;
        else {
            setTimeout(() => {
                eggUtils.removeConfetti();
            }, 950);
        }

        for (let i = 0; i < confettiObjects[0].confettiElements.length; i++) {

            let element = confettiObjects[0].confettiElements[i];

            element.classList.remove("confetti-container");
            void element.offsetWidth;
            element.parentNode.removeChild(element);
        }
        confettiObjects.shift();
    }

    // https://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points
    function findConfettiAngle(cx, cy, px, py) {

        let dy = py - cy;
        let dx = px - cx;

        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;

        return theta;
    }

    return {
        resetSimThumbnailStyles: resetSimThumbnailStyles,
        resetLotThumbnailStyles: resetLotThumbnailStyles,
        handleCustomSimStyles: handleCustomSimStyles,
        handleCustomLotStyles: handleCustomLotStyles,
        spawnConfetti: spawnConfetti,
        removeConfetti: removeConfetti
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
    async function getIndex(selectedName) {

        // Get sim name from index
        let simName = selectedName;
        simName = apiUtils.cleanLink(simName);

        // Grab avatars shutdown data
        let selectedID = simDataHolder.name_search[simName];
        let selectedSimShort = await shutdownUtils.getSimGroup(selectedID);

        // Log to analytics
        apiUtils.sendSimEntityAnalytics(selectedSimShort.name, selectedSimShort.id);

        // Send data to sim bio writer
        writeGreaterSimContext(selectedSimShort);

        return;
    }

    // Write sim information
    function writeGreaterSimContext(selectedSimShort) {
        
        // Set bookmark button state, write sim bio
        guiUtils.updateBookmarkButton(selectedSimShort.id);
        guiUtils.writeSimThumbnail(selectedSimShort);
        
        // Show sim bio
        GUI_SIM_VIEW.style.display = "flex";
    }

    function returnSimTitle(selectedSimLong) {

        let isBirthday = simUtils.checkIfSimBirthday(selectedSimLong.date);
        let isStaff = simUtils.isSimStaffMember(selectedSimLong.name);

        let birthdayString = (isBirthday) ? " 🎂" : "";
        let staffString = (isStaff) ? " 🔧" : "";

        return `${selectedSimLong.name}${birthdayString}${staffString}`;
    }

    function returnLotTitle(selectedLotLong) {

        let isBirthday = simUtils.checkIfSimBirthday(selectedLotLong.created_date);
        let birthdayString = (isBirthday) ? " 🎂" : "";

        return `${selectedLotLong.name}${birthdayString}`;
    }

    // Build sim thumbnail
    function writeSimThumbnail(selectedSimShort) {

        writeToLabel(returnSimTitle(selectedSimShort), "", "sim-title");
        simDataHolder.selSimID = selectedSimShort.id;

        // Handle custom styles
        eggUtils.handleCustomSimStyles(selectedSimShort);

        // Write sim's bio text
        GUI_SIM_BIO.firstChild.textContent = selectedSimShort.about;

        // Sim description basics
        var descContent = `Age: ${simUtils.returnSimAge(selectedSimShort.date)} Days\n` + 
                          `Joined: ${simUtils.returnTextDateFromDateObject(simUtils.returnDateObjectFromUNIX(selectedSimShort.date))}\n` +
                          `ID: ${selectedSimShort.id}\n`;

        // Set sim description to constructed text
        GUI_SIM_DESCRIPTION.firstChild.textContent = descContent;

        // Show "online"
        GUI_SIM_THUMBNAIL_BG.classList.remove("thumbnail-offline");
    }

    // Write info to lot thumbnail box
    async function writeLotThumbnail(selectedLotShort, selectedLotLong, existence, selectedSimLong) {

        // If sim not landed at a lot, contextually fill lot bio
        if ((existence != "LANDED" && existence != "LANDED_HIDDEN") && existence != "") {

            writeAbsentLotThumbnail(existence, selectedSimLong);
            GUI_LOT_BIO.textContent = "";
            GUI_LOT_BIO.style.display = "none";

            return;
        }
        
        // Do custom styles
        eggUtils.handleCustomLotStyles(selectedLotLong);

        // Lot label
        writeToLabel(returnLotTitle(selectedLotLong), "", "thumbnail-title");

        // Grab lot thumbnail from API
        let cacheBust = Math.floor(Math.random() * 10000000);
        let imageSource = `https://api.freeso.org/userapi/city/1/${selectedLotLong.location}.png?cachebust:${cacheBust}`;
        console.log("%cFetching Lot Image:\n\n", "color: black; background-color: lightgreen;", imageSource);

        // Set image
        GUI_LOT_DESCRIPTION.textContent = "";
        GUI_LOT_THUMBNAIL.src = imageSource;
        simDataHolder.apiStats.incrementAPICalls();

        // Create lot bio elements
        const lotDesc = document.createElement("p");

        // Basic lot info
        lotDesc.textContent = `Category: ${LOT_CATEGORY[selectedLotLong.category]}\n` + 
                              `Established: ${simUtils.returnTextDateFromDateObject(simUtils.returnDateObjectFromUNIX(selectedLotLong.created_date))}\n` + 
                              `Neighborhood: ${simUtils.returnNeighborhood(selectedLotLong.neighborhood_id)}\n` +
                              `Admit Mode: ${ADMIT_MODES[selectedLotLong.admit_mode]}\n` + 
                              `${SKILL_MODES[selectedLotLong.skill_mode]}`;

        // Set thumbnail background and lot population
        let lotOffline = ("error" in simUtils.returnOpenState(selectedLotShort));
        if (lotOffline) GUI_LOT_THUMBNAIL_BG.classList.add("thumbnail-offline");
        else GUI_LOT_THUMBNAIL_BG.classList.remove("thumbnail-offline");

        // Append elements to lot bio
        GUI_LOT_DESCRIPTION.append(lotDesc);

        // Un-hide lot bio
        GUI_LOT_BIO.textContent = selectedLotLong.description;
        GUI_LOT_BIO.style.display = "block";
    }

    // If roommate not located, write contextual lot bio
    function writeAbsentLotThumbnail(existence, selectedSimLong) {

        // Set lot image to unknown
        GUI_LOT_THUMBNAIL.src = "./images/unknown.png?v0.2.4a";
        eggUtils.resetLotThumbnailStyles();

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
    function updateBookmarkButton(selID) {

        let bookSims = storageUtils.returnLocalStorage(STORAGE_BOOKMARK_KEY);
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

        listHead.append(leftHead);
        listHead.append(rightHead);

        return listHead;
    }

    function populateSimList(simList) {

        let simListContainer = document.getElementById('sims-table');
        simListContainer.replaceChildren();
        simListContainer.append(buildListHeader("Name", "Age"));

        for (let i = 0; i < simList.length; i++) {

            let simNode = createListNode(returnSimTitle(simList[i]), `${simUtils.returnSimAge(simList[i].date)} Days`);
            addIndexClickHandler(simNode, "sim");

            // If Reagan, add easter egg
            if (simList[i].name == CUSTOM_STYLE_REAGAN) simNode.children[0].classList.add("rainbow-text");

            simListContainer.append(simNode);
        }
    }

    // Write list of sims in selected lot
    async function writeSimsInLot(selectedLot, population) {

        // TODO: Adding support for townhalls has bloated this quite a bit
        // Refactor whenever I figure this out

        // Show sims in lot
        GUI_SIMS_IN_LOT.style.display = "flex";
        
        // Write number of sims in lot
        GUI_SIMS_IN_LOT_LABEL.textContent = `Sims In Lot: ${population}`;

        // Reset lists
        GUI_SIMS_IN_LOT_SIMS.innerHTML = "";
        GUI_SIMS_IN_LOT_ROOMMATES.innerHTML = "";

        // Build list for sims at lot
        let simListHeader = buildListHeader("Sims", "");
        simListHeader.id = "sim-in-lot-list-node";
        GUI_SIMS_IN_LOT_SIMS.append(simListHeader);

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
                
                // If Reagan, add easter egg
                if (simName == CUSTOM_STYLE_REAGAN) simNode.children[0].classList.add("rainbow-text");

                addIndexClickHandler(simNode, "sim-in-lot");
                GUI_SIMS_IN_LOT_SIMS.append(simNode);

                allCount++;
                knownCount++;
            }
        }

        // If townhall, get mayor instead of owner
        let mayor;
        let isTownHall = (selectedLot.category == 11);
        let townhallObj;
        if (isTownHall) {

            // Get townhall object
            townhallObj = await apiUtils.getAPIData(`https://api.freeso.org/userapi/neighborhoods/${selectedLot.neighborhood_id}`);

            // Get mayor
            if (townhallObj.mayor_id != null) {

                let avatarLong = await apiUtils.getAPIData(`https://api.freeso.org/userapi/avatars?ids=${townhallObj.mayor_id}`);
                mayor = avatarLong.avatars[0];
            }
            else mayor = {
                name: "The Llama",
                location: "Yo mama's house",
                privacy_mode: 69
            }
        }

        // If roommates have not been fetched from API, fetch roommate long data
        if (!("roommateLong" in selectedLot)) selectedLot.roommateLong = await apiUtils.getAPIData(apiUtils.buildRoommateLink(selectedLot));
        if (!("roommateShort" in selectedLot)) selectedLot.roommatesShort = new Array();
        
        // Get roommates and existence states
        if (!("error" in selectedLot.roommateLong)) {

            for (let i = 0; i < selectedLot.roommateLong.avatars.length; i++) {

                // Find online presence of sim
                let roomieShort = simUtils.returnShortSimFromLong(selectedLot.roommateLong.avatars[i]);
                selectedLot.roommatesShort.push(roomieShort);
    
                // Get roommates existence state
                selectedLot.roommateLong.avatars[i].existenceState = simUtils.returnExistenceState(roomieShort);

                if (roomieShort.location == selectedLot.location) allCount++;
            }
        }
        
        // Decide if should write (Maybe) on hidden sims
        let writeHidden = (allCount != population);

        // Check if owner data has been fetched from API, if not, fetch from API
        if (!("ownerLong" in selectedLot)) selectedLot.ownerLong = (isTownHall) ? mayor : simUtils.returnOwnerFromRoommateList(selectedLot.roommateLong, selectedLot.owner_id);
        if (!("ownerShort" in selectedLot)) selectedLot.ownerShort = simUtils.returnShortSimFromLong(selectedLot.ownerLong);
        selectedLot.ownerLong.existenceState = simUtils.returnExistenceState(selectedLot.ownerShort);

        // Add owner header to roommate list
        let ownerHeader = buildListHeader((isTownHall) ? "Mayor": "Owner", "");
        ownerHeader.id = "sim-in-lot-list-node";
        GUI_SIMS_IN_LOT_ROOMMATES.append(ownerHeader);

        // Add node for owner sim
        let ownerNode = createListNode(selectedLot.ownerLong.name, "");
        ownerNode.id = "sim-in-lot-list-node";

        // Conditionals for owner
        if (selectedLot.ownerLong.existenceState == "OFFLINE") ownerNode.classList.add("sim-list-node-offline");
        else if (selectedLot.ownerLong.existenceState == "LANDED_HIDDEN" && writeHidden) ownerNode.children[0].textContent += " (Maybe Hosting)";
        else if (selectedLot.ownerShort.location == selectedLot.location) ownerNode.children[0].textContent += " (Hosting)";

        // Add click handler and append to list
        if (!isTownHall || townhallObj.mayor_id != null) addIndexClickHandler(ownerNode, "sim-in-lot");
        GUI_SIMS_IN_LOT_ROOMMATES.append(ownerNode);

        // Create elements for roommates at lot text
        // Catch for townhalls
        if (!("error" in selectedLot.roommateLong)) {

            if (selectedLot.roommateLong.avatars.length > 1) {

                // Add spacing
                GUI_SIMS_IN_LOT_ROOMMATES.append(createListNode("", ""));
    
                // Create roommate header if roommates exist
                let roommatesHeader = buildListHeader("Roommates", "");
                roommatesHeader.id = "sim-in-lot-list-node";
                GUI_SIMS_IN_LOT_ROOMMATES.append(roommatesHeader);
            }

            // Compile roommates
            for (let i = 0; i < selectedLot.roommateLong.avatars.length; i++) {

                // Skip owner
                if (selectedLot.roommateLong.avatars[i].avatar_id == selectedLot.ownerLong.avatar_id) continue;
                let existenceState = selectedLot.roommateLong.avatars[i].existenceState;

                // Create roommate node
                let roommateNode = createListNode(selectedLot.roommateLong.avatars[i].name, "");
                roommateNode.id = "sim-in-lot-list-node";
                addIndexClickHandler(roommateNode, "sim-in-lot");

                // Conditional existence styling
                if (existenceState == "LANDED_HIDDEN" && writeHidden) roommateNode.children[0].textContent += " (Maybe Hosting)";
                if (existenceState == "OFFLINE") roommateNode.classList.add("sim-list-node-offline");
                if (selectedLot.roommatesShort[i].location == selectedLot.location) roommateNode.children[0].textContent += " (Hosting)";

                // Append roommate node to list
                GUI_SIMS_IN_LOT_ROOMMATES.append(roommateNode);
            }
        }
        
        // Write extra text for number of hidden sims
        if (population - allCount != 0 && writeHidden) {

            // Extra space
            let extraText = ""
            if (knownCount > 0) extraText += "\n";
            
            // Handle plurals
            if (knownCount == 0) extraText += `${population - allCount}  Hidden Sim` + (((population - allCount) == 1) ? "" : "s");
            else extraText += `And ${population - allCount} More Hidden Sim` + (((population - allCount) == 1) ? "" : "s");

            // Create node and append to list
            let hiddenNode = createListNode(extraText, "");
            hiddenNode.id = "sim-list-node-static";
            GUI_SIMS_IN_LOT_SIMS.append(hiddenNode);
        }
    }

    function writeBookmarkSims(simList) {

        // Reset bookmark list, append header
        GUI_BOOKMARK_LIST.innerHTML = "";
        GUI_BOOKMARK_LIST.append(buildListHeader("Name", ""));
    
        // Append and style bookmarked sims
        for (sim of simList) {
            
            let simName = returnSimTitle(sim);
            let simNode = createListNode(simName, "");
            addIndexClickHandler(simNode, "bookmark");

            // If Reagan, add easter egg
            if (sim.name == CUSTOM_STYLE_REAGAN) simNode.children[0].classList.add("rainbow-text");

            GUI_BOOKMARK_LIST.append(simNode);
        }
    }

    function createListNode(contentLeft, contentRight) {

        let listNode = document.createElement("div");
        listNode.id = "sim-list-node";

        let elementLeft = document.createElement("div");
        elementLeft.textContent = contentLeft;

        let elementRight = document.createElement("div");
        elementRight.textContent = contentRight;

        listNode.append(elementLeft);
        listNode.append(elementRight);
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
                guiUtils.getIndex(simName);
            });
        }
    }
    //#endregion

    return {
        writeGreaterSimContext: writeGreaterSimContext,
        buildListHeader: buildListHeader,
        populateSimList: populateSimList,
        writeToLabel: writeToLabel,
        getIndex: getIndex,
        updateBookmarkButton: updateBookmarkButton,
        writeSimThumbnail: writeSimThumbnail,
        writeLotThumbnail: writeLotThumbnail,
        writeBookmarkSims: writeBookmarkSims,
        writeSimsInLot: writeSimsInLot
    }
}();

searchUtils = function() {

    // Retrieve long sim from database
    async function searchSim() {

        // Search sim's name in api
        let simName = GUI_SEARCH_SIM.value;
        if (simName == "") return;

        let selectedID = 0;

        // Lookup name in database
        if (simDataHolder.name_search[simName] === undefined) {

            // If not found, check lowercase list
            if (simDataHolder.name_search_lower[simName] === undefined) {

                alert("Cannot find sim \"" + simName + "\"");
                return;
            }
            else selectedID = simDataHolder.name_search_lower[simName];
        }
        else selectedID = simDataHolder.name_search[simName];

        // Grab avatars shutdown data
        let selectedSimShort = await shutdownUtils.getSimGroup(selectedID);

        // Write to sim bio
        guiUtils.writeGreaterSimContext(selectedSimShort);
    }

    return {
        searchSim: searchSim,
    }
}();

sidebarUtils = function() {

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

    // Write about info in sidebar info panel 
    async function writeSidebarInfo() {

        let gitJson = await apiUtils.returnGitCommitJson();
        let date = gitJson.commit.commit.author.date.slice(0, 10);

        let infoText = `Sim Finder\n${VERSION_STR}\n\nLast Update:\n${date}`;
        SIDEBAR_INFO.textContent = infoText;
    }

    return {
        expandSidebar: expandSidebar,
        writeSidebarInfo: writeSidebarInfo,
        toggleSidebarElements: toggleSidebarElements
    }
}();

apiUtils = function() {

    //#region API Fetching
    async function returnGitCommitJson() {

        const apiLink = "https://api.github.com/repos/sam-chug/sim-finder/branches/master";

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();

        console.log("%cFetching Last Sim Finder Commit:\n\n", "color: white; background-color: darkgreen;", apiLink);
        
        return obj;
    }

    async function getDBLookupData() {

        const apiLink = "https://raw.githubusercontent.com/Sam-Chug/sim-finder-data/main/staff-names";

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
        console.log("%cFetching Sim Finder Lookup Data:\n\n", "color: white; background-color: darkgreen;", apiLink);
        
        return obj;
    }

    async function getShutdownSimlist(avatarGroup) {

        // This solution is probably beyond foolish
        // Maybe I'll change it eventually

        const apiLink = `https://raw.githubusercontent.com/Sam-Chug/sim-finder-data/refs/heads/main/sim-data/AvatarComp-${avatarGroup}.txt`;

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
        console.log("%cFetching Shutdown Data:\n\n", "color: white; background-color: darkgreen;", apiLink);
        
        return obj;
    }

    async function getAPIData (apiLink) {
        
        // Clean link
        apiLink = cleanLink(apiLink);

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
    
        console.log("%cFetching Api Data:\n\n", "color: white; background-color: green;", apiLink);
        simDataHolder.apiStats.incrementAPICalls();

        return obj;
    }
    //#endregion

    function cleanLink(linkText) {

        // Catches for conditionals I'm too stupid to fix in a good way
        if (linkText.includes("(Maybe Hosting)")) linkText = linkText.replace(" (Maybe Hosting)", "");
        if (linkText.includes("🎂")) linkText = linkText.replace(" 🎂", "");
        if (linkText.includes("🔧")) linkText = linkText.replace(" 🔧", "");
        if (linkText.includes("(Hosting)")) linkText = linkText.replace(" (Hosting)", "");

        return linkText;
    }

    //#region Analytics
    function sendSimEntityAnalytics(fetchedSimName, fetchedSimID) {

        gtag('event', 'api_sim_fetch', {
            'fetchedSimName' : fetchedSimName,
            'fetchedSimID' : fetchedSimID
        });
    }

    function sendLotEntityAnalytics(fetchedLotName, fetchedLotID) {

        gtag('event', 'api_lot_fetch', {
            'fetchedLotName' : fetchedLotName,
            'fetchedLotID' : fetchedLotID
        });
    }

    function sendBookmarkAnalytics(bookmarked, entityName, entityID) {

        gtag('event', 'bookmark_change', {
            'bookmarked' : bookmarked,
            'bookmarkedName' : entityName,
            'bookmarkedID' : entityID
        });
    }
    //#endregion

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

    function buildLongSimLink(simList) {

        let simIdString = "https://api.freeso.org/userapi/avatars?ids=";
        for (i = 0; i < simList.avatars.length; i++) {
    
            simIdString += simList.avatars[i].avatar_id + ",";
        }
    
        simIdString = simIdString.slice(0, -1);
        return simIdString;
    }

    function buildLongLotLink(lotList) {

        let lotIDString = "https://api.freeso.org/userapi/lots?ids=";
        for (i = 0; i < lotList.lots.length; i++) {
    
            lotIDString += lotList.lots[i].lot_id + ",";
        }
    
        lotIDString = lotIDString.slice(0, -1);
        return lotIDString;
    }

    // Builds api link from lot's roommates
    function buildRoommateLink(longLot) {

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
        returnGitCommitJson: returnGitCommitJson,
        sendSimEntityAnalytics: sendSimEntityAnalytics,
        sendBookmarkAnalytics: sendBookmarkAnalytics,
        sendLotEntityAnalytics: sendLotEntityAnalytics,
        getDBLookupData: getDBLookupData,
        cleanLink: cleanLink,
        getShutdownSimlist: getShutdownSimlist
    }
}();

shutdownUtils = function() {

    async function getSimGroup(simID) {

        // For bookmark lookups

        let group = Math.ceil(simID / 1000) * 1000;
        return shutdownUtils.returnShutdownSimData(simID, await apiUtils.getShutdownSimlist(group));
    }

    function returnShutdownSimData(simID, simGroup) {

        for (let i = 0; i < simGroup.avatars.length; i++) {

            if (simID == simGroup.avatars[i].id) return simGroup.avatars[i];
        }
    }

    function retrieveBookmarkNames() {

        // Load bookmarks from local storage
        bookmarkIDList = storageUtils.returnLocalStorage(STORAGE_BOOKMARK_KEY_OLD).simID;

        // Get sim names
        let bookmarkedNames = new Array();
        for (let i = 0; i < bookmarkIDList.length; i++) {

            let simName = simDataHolder.id_search[bookmarkIDList[i]];
            bookmarkedNames.push({avatar_id: bookmarkIDList[i], name: simName});
        }

        // Clear undefined names
        for (let i = bookmarkedNames.length - 1; i >= 0; i--) {

            if (bookmarkedNames[i].name === undefined) bookmarkedNames.splice(i, 1);
        }

        // Sort array by age
        bookmarkedNames = bookmarkedNames.sort(({avatar_id:a}, {avatar_id:b}) => a-b);

        return bookmarkedNames;
    }

    async function buildSearchObjects() {

        await fetch('./sim-data/id-list.txt')
        .then(response => response.text())
        .then((data) => {
            simDataHolder.id_search = JSON.parse(data);
        });

        await fetch('./sim-data/name-list.txt')
        .then(response => response.text())
        .then((data) => {
            simDataHolder.name_search = JSON.parse(data);
        });

        await fetch('./sim-data/name-list-lower.txt')
        .then(response => response.text())
        .then((data) => {
            simDataHolder.name_search_lower = JSON.parse(data);
        });
    }

    return {
        retrieveBookmarkNames: retrieveBookmarkNames,
        buildSearchObjects: buildSearchObjects,
        getSimGroup: getSimGroup,
        returnShutdownSimData: returnShutdownSimData
    }
}();

storageUtils = function() {

    // TODO: This is messy, try to merge with setDefaultStorage
    function setDefaultSettings() {

        // Check if user settings empty
        if (!checkIfSettingsEmpty()) return;
        localStorage.removeItem(SETTINGS_KEY);

        // Set default user settings
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(new UserSetting()));
    }

    function returnSettings() {

        if (checkIfSettingsEmpty()) setDefaultSettings();

        let settingObject = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return settingObject;
    }

    function checkIfSettingsEmpty() {

        return (JSON.parse(localStorage.getItem(SETTINGS_KEY) == null));
    }

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
        let bookmarkStorage = returnLocalStorage(STORAGE_BOOKMARK_KEY);
        bookmarkStorage.simID.push(addID);
        
        // Save local storage
        let storageString = JSON.stringify(bookmarkStorage);
        saveStorage(STORAGE_BOOKMARK_KEY, storageString);
    }

    function deleteBookmark(deleteID) {

        // Get bookmark storage
        let bookmarkStorage = returnLocalStorage(STORAGE_BOOKMARK_KEY);

        // Remove id from bookmarks
        let index = bookmarkStorage.simID.indexOf(deleteID);
        if (index > -1) {
            bookmarkStorage.simID.splice(index, 1);
        }
        
        // Save local storage
        let storageString = JSON.stringify(bookmarkStorage);
        saveStorage(STORAGE_BOOKMARK_KEY, storageString);
    }

    function returnLocalStorage(storageKey) {

        // If storage empty, set default storage
        if (checkIfStorageEmpty(storageKey)) setDefaultStorage(storageKey);

        // Return json from local storage
        let simIDObject = JSON.parse(localStorage.getItem(storageKey));
        return simIDObject;
    }

    function exportLocalStorage(storageKey) {

        let dateObj = simUtils.returnDateObjectFromUNIX(Date.now() / 1000);
        let dateString = `${dateObj.month}-${dateObj.day}-${dateObj.year}`

        let saveObject = returnLocalStorage(storageKey);
        let saveString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObject));

        let downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", saveString);
        downloadAnchorNode.setAttribute("download", `SimFinder Bookmarks ${dateString}.json`);
        document.body.append(downloadAnchorNode);

        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function importLocalStorage(storageKey) {

        // Open file dialog
        let fileInput = document.createElement("input");
        fileInput.setAttribute("type", "file");
        fileInput.click();
        fileInput.onchange = e => {

            // Read chosen file
            let file = e.target.files[0];
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = readerEvent => {

                // Set to bookmark key
                let content = readerEvent.target.result;
                
                // Try converting content string to json
                let contentObject;
                try {

                    contentObject = JSON.parse(content);
                }
                catch (error) {

                    alert("The file you are importing is invalid. Reverting to previous bookmarks.");
                }

                // Check validity of imported bookmarks
                let validImport = checkImportValidity(contentObject);

                // If import valid
                if (validImport) {

                    // Set item and reload page
                    localStorage.setItem(storageKey, content);
                    alert("Bookmarks imported, press OK to reload page.");
                    location.reload();
                }
                // Else, alert user
                else {

                    alert("The file you are importing is invalid. Reverting to previous bookmarks.");
                }
            }
        }
    }

    function checkImportValidity(importObj) {

        // Check if import has idList attribute
        if (!importObj.hasOwnProperty("simID")) return false;

        // Check if all entries in idList are integers
        for (let i = 0; i < importObj.simID.length; i++) {

            if (!Number.isInteger(importObj.simID[i])) return false;
        }

        // Return true if checks are passed
        return true;
    }

    // When bookmark button clicked
    async function handleBookmarkCheck() {

        // If adding bookmark
        if (GUI_BOOKMARK_BUTTON.checked) {

            // Add bookmark to list
            storageUtils.addBookmark(simDataHolder.selSimID);

            // Get data from new bookmark list, fetch in case sim was offline
            let addSim = await apiUtils.getAPIData(apiUtils.buildLongSimLinkFromID([simDataHolder.selSimID]));
            apiUtils.sendBookmarkAnalytics(true, addSim.name, addSim.avatar_id);
            simDataHolder.bookmarkList.avatars.push(addSim.avatars[0]);
        }
        // If removing bookmark
        else {

            // Remove bookmark
            storageUtils.deleteBookmark(simDataHolder.selSimID);

            // Remove sim from bookmark list
            for (let i = 0; i < simDataHolder.bookmarkList.avatars.length; i++) {

                if (simDataHolder.bookmarkList.avatars[i].avatar_id == simDataHolder.selSimID) {

                    let delSim = simDataHolder.bookmarkList.avatars[i];
                    apiUtils.sendBookmarkAnalytics(true, delSim.name, delSim.avatar_id);

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
        addBookmark: addBookmark,
        importLocalStorage: importLocalStorage,
        exportLocalStorage: exportLocalStorage,
        setDefaultSettings: setDefaultSettings,
        returnSettings: returnSettings,
        saveStorage: saveStorage
    }
}();