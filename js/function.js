simUtils = function() {

    //#region Sim time functions
    function returnSimAge(joinDate) {

        let utcNow = new Date().getTime();
        let now = Math.round(utcNow / 1000);
        return Math.floor((now - joinDate) / 86400);
    }

    function checkIfSimBirthday(simUnix) {

        let utcNow = Date.now() / 1000;
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

        return {
            month: mm,
            day: dd,
            year: yyyy
        }
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

        for (let i = 0; i < STAFF_NAMES.length; i++) {

            if (STAFF_NAMES[i].match(simName)) return true;
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
                
                GUI_SORT_SIM_NAMES.style.background = `url(./images/buttons/name-sort-selected.png?v0.2.2b)`;
                simDataHolder.simSort = "name";
            }
            else if (simDataHolder.simSort == "name") {

                simDataHolder.simShortList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
                simDataHolder.simLongList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);

                GUI_SORT_SIM_NAMES.style.background = `url(./images/buttons/name-sort.png?v0.2.2b)`;
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

                GUI_SORT_LOT_NAMES.style.background = `url(./images/buttons/name-sort-selected.png?v0.2.2b)`;
                simDataHolder.lotSort = "name";
            }
            else if (simDataHolder.lotSort == "name") {

                simDataHolder.lotLongList.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);
                simDataHolder.lotShortList.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);

                GUI_SORT_LOT_NAMES.style.background = `url(./images/buttons/name-sort.png?v0.2.2b)`;
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

        navigator.clipboard.writeText(e.textContent);
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

        if (state == "lightmode") {

            DOM_ROOT.style.setProperty("--bg-fallback", "#7ca1bf");

            DOM_ROOT.style.setProperty("--inset-bg", "#32455b");
            DOM_ROOT.style.setProperty("--inset-bg-dark", "#2f4158");
            DOM_ROOT.style.setProperty("--block-gradient-light", "#96bad0");
            DOM_ROOT.style.setProperty("--block-gradient-dark", "#5f88af");
            DOM_ROOT.style.setProperty("--outset-title-bg", "#5077a3");

            DOM_ROOT.style.setProperty("--bg-dark-gradient-light", "#5f88af");
            DOM_ROOT.style.setProperty("--bg-dark-gradient-dark", "#476a8d");
        }
        else if (state == "darkmode") {

            DOM_ROOT.style.setProperty("--bg-fallback", "#7c7c7c");

            DOM_ROOT.style.setProperty("--inset-bg", "#222222");
            DOM_ROOT.style.setProperty("--inset-bg-dark", "#111111");
            DOM_ROOT.style.setProperty("--block-gradient-light", "#444444");
            DOM_ROOT.style.setProperty("--block-gradient-dark", "#333333");
            DOM_ROOT.style.setProperty("--outset-title-bg", "#555555");

            DOM_ROOT.style.setProperty("--bg-dark-gradient-light", "#222222");
            DOM_ROOT.style.setProperty("--bg-dark-gradient-dark", "#111111");
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
    }

    function addTooltipToButton(element, type) {

        element.addEventListener("mouseover", function() {
    
            filterUtils.mouseOverFilterChange(this, "in", type);
            let tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");

            if (type == "export") {

                tooltip.textContent = "Export Bookmarks";
                tooltip.classList.add("low-tooltip");
            }
            else if (type == "import") {

                tooltip.textContent = "Import Bookmarks";
                tooltip.classList.add("low-tooltip");
            }
            else if (type == "search") {

                tooltip.textContent = "Search";
                tooltip.classList.add("mid-tooltip");
            }
            else if (type == "sort") {

                tooltip.textContent = "Toggle Alphabetical Sort";
                tooltip.classList.add("mid-tooltip");
            }
            else if (type == "min") {

                tooltip.textContent = "Toggle Filter List Visibility";
                tooltip.classList.add("low-tooltip");
            }
            else if (type == "style-help") {

                tooltip.textContent = "Open Sim Panel Formatting Help Page";
                tooltip.classList.add("under-tooltip");
            }
            else if (type == "colormode") {

                tooltip.textContent = "Toggle Light";
                tooltip.classList.add("mid-tooltip");
            }
            this.appendChild(tooltip);
        });

        element.addEventListener("mouseout", function(){
    
            filterUtils.mouseOverFilterChange(this, "out", type);
            this.removeChild(this.children[0]);
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
        GUI_SIM_THUMBNAIL.src = CUSTOM_STYLE_SIMHEADS.reagan;

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

        // Test any custom style
        //testCustomStyle("o");
        //return;

        // Do reagan
        if (selectedSim.name == CUSTOM_STYLE_REAGAN) {

            reaganEgg();
        }

        // Get sim's custom styles
        let styleObj = new StyleObject(selectedSim);
        if (!styleObj.usesStyle) return;

        // Set styles
        if (styleObj.styles.block != "") GUI_SIM_VIEW.classList.add(styleObj.styles.block);
        if (styleObj.styles.bookmarkLabel != "") GUI_BOOKMARK_LABEL.classList.add(styleObj.styles.bookmarkLabel);
        if (styleObj.styles.label != "") GUI_SIM_LABEL.classList.add(styleObj.styles.label);
        if (styleObj.styles.inset != "") {

            GUI_SIM_BIO.classList.add(styleObj.styles.inset);
            GUI_SIM_DESCRIPTION.classList.add(styleObj.styles.inset);
        }
    }

    return {
        resetSimThumbnailStyles: resetSimThumbnailStyles,
        resetLotThumbnailStyles: resetLotThumbnailStyles,
        handleCustomSimStyles: handleCustomSimStyles,
        handleCustomLotStyles: handleCustomLotStyles
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
                if (!simUtils.checkIfSimInLongCache(simName)) {

                    // If sim not in long cache, fetch from API and add to cache
                    selectedSimLong = await apiUtils.getAPIData("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));
                    simDataHolder.offlineLongSimList.push(selectedSimLong);
                    console.log(simDataHolder.offlineLongSimList);
                }
                else {

                    // If cached, grab sim data from cache
                    selectedSimLong = simUtils.returnSimFromLongCache(simName);
                }
                
                // Get sim short if available
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
    function writeSimThumbnail(selectedSimShort, selectedSimLong) {

        writeToLabel(returnSimTitle(selectedSimLong), "", "sim-title");
        simDataHolder.selSimID = selectedSimLong.avatar_id;

        // Set head graphic
        let headStyle = new StyleObject(selectedSimLong);
        GUI_SIM_THUMBNAIL.src = headStyle.avatarHead;

        // Handle custom styles
        eggUtils.handleCustomSimStyles(selectedSimLong);

        // Write sim's bio text
        GUI_SIM_BIO.textContent = selectedSimLong.description;

        // Sim description basics
        var descContent = `Age: ${simUtils.returnSimAge(selectedSimLong.date)} Days\n` + 
                          `Joined: ${simUtils.returnTextDateFromDateObject(simUtils.returnDateObjectFromUNIX(selectedSimLong.date))}\n` +
                          `ID: ${selectedSimLong.avatar_id}\n` + 
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

        // Reset description, get thumbnail from API
        GUI_LOT_DESCRIPTION.textContent = "";
        let randomCacheBust = Math.floor(Math.random() * 10000000);
        GUI_LOT_THUMBNAIL.src = "https://api.freeso.org/userapi/city/1/" + selectedLotLong.location + `.png?cachebust:${randomCacheBust}`;
        console.log("%cFetching Lot Image:\n\n", "color: black; background-color: lightgreen;", "https://api.freeso.org/userapi/city/1/" + selectedLotLong.location + `.png?cachebust:${randomCacheBust}`);
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
        GUI_LOT_DESCRIPTION.appendChild(lotDesc);

        // Un-hide lot bio
        GUI_LOT_BIO.textContent = selectedLotLong.description;
        GUI_LOT_BIO.style.display = "block";
    }

    // If roommate not located, write contextual lot bio
    function writeAbsentLotThumbnail(existence, selectedSimLong) {

        // Set lot image to unknown
        GUI_LOT_THUMBNAIL.src = "./images/unknown.png?v0.2.2b";
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

            let simNode = createListNode(returnSimTitle(simList[i]), `${simUtils.returnSimAge(simList[i].date)} Days`);
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
        
            let lotNode = createListNode(returnLotTitle(lotList[i]), lotList[i].avatars_in_lot + " sims");
            addIndexClickHandler(lotNode, "lot");
            GUI_ONLINELOTS.appendChild(lotNode);
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
        GUI_SIMS_IN_LOT_ROOMMATES.appendChild(ownerHeader);

        // Add node for owner sim
        let ownerNode = createListNode(selectedLot.ownerLong.name, "");
        ownerNode.id = "sim-in-lot-list-node";

        // Conditionals for owner
        if (selectedLot.ownerLong.existenceState == "OFFLINE") ownerNode.classList.add("sim-list-node-offline");
        else if (selectedLot.ownerLong.existenceState == "LANDED_HIDDEN" && writeHidden) ownerNode.children[0].textContent += " (Maybe Hosting)";
        else if (selectedLot.ownerShort.location == selectedLot.location) ownerNode.children[0].textContent += " (Hosting)";

        // Add click handler and append to list
        if (!isTownHall || townhallObj.mayor_id != null) addIndexClickHandler(ownerNode, "sim-in-lot");
        GUI_SIMS_IN_LOT_ROOMMATES.appendChild(ownerNode);

        // Create elements for roommates at lot text
        // Catch for townhalls
        if (!("error" in selectedLot.roommateLong)) {

            if (selectedLot.roommateLong.avatars.length > 1) {

                // Add spacing
                GUI_SIMS_IN_LOT_ROOMMATES.appendChild(createListNode("", ""));
    
                // Create roommate header if roommates exist
                let roommatesHeader = buildListHeader("Roommates", "");
                roommatesHeader.id = "sim-in-lot-list-node";
                GUI_SIMS_IN_LOT_ROOMMATES.appendChild(roommatesHeader);
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
                GUI_SIMS_IN_LOT_ROOMMATES.appendChild(roommateNode);
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
            GUI_SIMS_IN_LOT_SIMS.appendChild(hiddenNode);
        }
    }

    function writeBookmarkSims(simList) {

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
    function writeFilterToTable(type, filter) {

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
    function returnFilterSimList(filter) {

        let longList = new Array();

        let simLongList = simDataHolder.simLongList;
        let simShortList = simDataHolder.simShortList;

        switch (filter) {

            case "JOB_DINER":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job == 2) longList.push(simLongList.avatars[i]);
                }
                break;

            case "JOB_CLUB_DJ":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job == 4) longList.push(simLongList.avatars[i]);
                }
                break;

            case "JOB_CLUB_DANCER":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job == 5) longList.push(simLongList.avatars[i]);
                }
                break;

            case "JOB_ROBOT":

                for (i = 0; i < simLongList.avatars.length; i++) {
                    if (simLongList.avatars[i].current_job == 1) longList.push(simLongList.avatars[i]);
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

            case "UNFOUND":

                for (let i = 0; i < simShortList.avatars.length; i++) {

                    let isPrivate = simShortList.avatars[i].privacy_mode;
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (isPrivate && existence != "LANDED_HIDDEN") longList.push(simLongList.avatars[i]);
                }
                break;

            case "FLOATING":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "FLOATING") longList.push(simLongList.avatars[i]);
                }
                break;

            case "LANDED":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "LANDED") longList.push(simLongList.avatars[i]);
                }
                break;

            case "WORKING":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    let existence = simUtils.returnExistenceState(simShortList.avatars[i]);
                    if (existence == "WORKING") longList.push(simLongList.avatars[i]);
                }
                break;

            case "STAFF":

                for (let i = 0; i < simShortList.avatars.length; i++) {
                    if (simUtils.isSimStaffMember(simShortList.avatars[i].name)) longList.push(simLongList.avatars[i]);
                }
                break;

            default:
                break;
        }
        return longList;
    }

    // Return filtered lot list from selected filter
    function returnFilterLotList(filter) {

        let shortList = new Array();

        for (let i = 0; i < simDataHolder.lotShortList.lots.length; i++) {

            if (simDataHolder.lotShortList.lots[i].category == LOT_SEARCH_ID[filter]) shortList.push(simDataHolder.lotShortList.lots[i]);
        }
        return shortList;
    }

    //#region Filter Icons
    // Populate filter buttons
    function fillButtonGraphics() {

        const lotFilterArray = document.getElementById("lot-filter-array");
        const simFilterArray = document.getElementById("sim-filter-array");
    
        for (let i = 0; i < 12; i++) {
    
            let button = document.createElement("button");
    
            var x = (i % 4) * 71;
            var y = Math.floor(i / 4) * 71;
            button.style.background = "url(./images/filter-spritesheets/lot-filter.png?v0.2.2b) " + -x + "px " + -y + "px";
    
            addFilterClasses(button, "lot");
            lotFilterArray.appendChild(button);
        }
        for (let i = 0; i < 12; i++) {
    
            let button = document.createElement("button");
    
            var x = (i % 4) * 71;
            var y = Math.floor(i / 4) * 71;
            button.style.background = "url(./images/filter-spritesheets/sim-filter.png?v0.2.2b) " + -x + "px " + -y + "px";
    
            addFilterClasses(button, "sim");
            simFilterArray.appendChild(button);
        }
    }

    // Add classes to filter buttons
    function addFilterClasses(element, type) {

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
    function mouseOverFilterChange(button, action, type) {

        const index = Array.from(button.parentElement.children).indexOf(button);
    
        var x = (index % 4) * 71;
        var y = Math.floor(index / 4) * 71;
    
        if (type == "lot") {
    
            if (button.classList.contains("lot-filter-active")) return;
    
            if (action == "in") {
            
                button.style.background = "url(./images/filter-spritesheets/lot-filter-hover.png?v0.2.2b) " + -x + "px " + -y + "px";
            }
            else if (action == "out") {
    
                button.style.background = "url(./images/filter-spritesheets/lot-filter.png?v0.2.2b) " + -x + "px " + -y + "px";
            }
        }
        else if (type == "sim") {
    
            if (button.classList.contains("sim-filter-active")) return;
    
            if (action == "in") {
            
                button.style.background = "url(./images/filter-spritesheets/sim-filter-hover.png?v0.2.2b) " + -x + "px " + -y + "px";
            }
            else if (action == "out") {
    
                button.style.background = "url(./images/filter-spritesheets/sim-filter.png?v0.2.2b) " + -x + "px " + -y + "px";
            }
        }
    }

    // On click filter button
    function filterButtonClick(button, type) {

        const index = Array.from(button.parentElement.children).indexOf(button);
        filterArray = button.parentElement;
    
        var count = 0;
    
        if (type == "lot") {
    
            var sameButton = (button.classList.contains("lot-filter-active"));
            for (let button of filterArray.children) {
    
                button.classList.remove("lot-filter-active");
                var x = (count % 4) * 71;
                var y = Math.floor(count / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/lot-filter.png?v0.2.2b) " + -x + "px " + -y + "px";
        
                count++;
            }
            // If already selected, deselect and reset filter
            if (sameButton) {

                writeFilterToTable("lot", "REMOVE");
                simDataHolder.lotFilter = "REMOVE";
            }
            else {
                var x = (index % 4) * 71;
                var y = Math.floor(index / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/lot-filter-selected.png?v0.2.2b) " + -x + "px " + -y + "px";
                button.classList.add("lot-filter-active");
                writeFilterToTable("lot", index);
                simDataHolder.lotFilter = index;
            }
            return;
        }
        else if (type == "sim") {
    
            var sameButton = (button.classList.contains("sim-filter-active"));
            for (let button of filterArray.children) {
    
                button.classList.remove("sim-filter-active");
                var x = (count % 4) * 71;
                var y = Math.floor(count / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/sim-filter.png?v0.2.2b) " + -x + "px " + -y + "px";
        
                count++;
            }
            if (sameButton) {

                writeFilterToTable("sim", "REMOVE");
                simDataHolder.simFilter = "REMOVE";
            }
            else {
    
                var x = (index % 4) * 71;
                var y = Math.floor(index / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/sim-filter-selected.png?v0.2.2b) " + -x + "px " + -y + "px";
                button.classList.add("sim-filter-active");
                writeFilterToTable("sim", SIM_FILTER_KEYS[index]);
                simDataHolder.simFilter = index;
            }
            return;
        }
    }
    //#endregion

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
        if (simName == "") return;

        // Check if simlong in cache
        let simLong;
        if (!simUtils.checkIfSimInLongCache(simName)) {

            // If sim not cached, fetch from API and add to cache
            simLong = await apiUtils.getAPIData("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));
            simDataHolder.offlineLongSimList.push(simLong);
        }
        else {

            // If sim cached, return from cache
            simLong = simUtils.returnSimFromLongCache(simName);
        }

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
        if (lotName == "") return;

        let lotLong;
        if (!simUtils.checkIfLotInLongCache(lotName)) {

            // If lot not cached, fetch from API and add to cache
            lotLong = await apiUtils.getAPIData("https://api.freeso.org/userapi/city/1/lots/name/" + lotName.replace(" ", "%20"));
            simDataHolder.offlineLongLotList.push(lotLong);
            console.log(simDataHolder.offlineLongLotList)
        }
        else {

            // If cached, return from cache
            lotLong = simUtils.returnLotFromLongCache(lotName);
        }

        // Alert if lot doesn't exist
        if ("error" in lotLong) {

            alert("Cannot find lot \"" + lotName + "\"");
            return;
        }

        // Get lot data
        let lotShort = simUtils.returnShortLotFromLocation(lotLong.location);
        guiUtils.writeLotThumbnail(lotShort, lotLong, "");

        // Write sims in lot
        let lotPopulation = (("error") in lotShort) ? 0 : lotShort.avatars_in_lot;
        GUI_SIMS_IN_LOT.style.display = "flex";
        guiUtils.writeSimsInLot(lotLong, lotPopulation);

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
        SIDEBAR_JOB_FACTORY.style.background = "url(./images/buttons/jobs-active.png?v0.2.2b) 40px 0";
        SIDEBAR_JOB_DINER.style.background = "url(./images/buttons/jobs-active.png?v0.2.2b) 40px 80px";
        SIDEBAR_JOB_CLUB.style.background = "url(./images/buttons/jobs-active.png?v0.2.2b) 40px 40px";

        // Set active jobs to active icon
        if (jobsActive.includes(1)) SIDEBAR_JOB_FACTORY.style.background = "url(./images/buttons/jobs-active.png?v0.2.2b) 0 0";
        if (jobsActive.includes(2)) SIDEBAR_JOB_DINER.style.background = "url(./images/buttons/jobs-active.png?v0.2.2b) 0 80px";
        if (jobsActive.includes(4)) SIDEBAR_JOB_CLUB.style.background = "url(./images/buttons/jobs-active.png?v0.2.2b) 0 40px";
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
        updateSidebar: updateSidebar,
        toggleSidebarElements: toggleSidebarElements
    }
}();

marketWatchUtils = function() {

    function returnMarketObject(simLong, simShort, lotShort) {

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

        console.log("%cFetching Last Sim Finder Commit:\n\n", "color: white; background-color: darkgreen;", apiLink);
        
        return obj;
    }

    async function getAPIData (apiLink) {

        // Catches for conditionals I'm too stupid to fix in a good way
        if (apiLink.includes("(Maybe Hosting)")) apiLink = apiLink.replace("(Maybe Hosting)", "");
        if (apiLink.includes("🎂")) apiLink = apiLink.replace("🎂", "");
        if (apiLink.includes("(Hosting)")) apiLink = apiLink.replace("(Hosting)", "");

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
    
        console.log("%cFetching Api Data:\n\n", "color: white; background-color: green;", apiLink);
        simDataHolder.apiStats.incrementAPICalls();

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
        returnGitCommitJson: returnGitCommitJson
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

    function exportLocalStorage(storageKey) {

        let dateObj = simUtils.returnDateObjectFromUNIX(Date.now() / 1000);
        let dateString = `${dateObj.month}-${dateObj.day}-${dateObj.year}`

        let saveObject = returnLocalStorage(storageKey);
        let saveString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObject));

        let downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", saveString);
        downloadAnchorNode.setAttribute("download", `SimFinder Bookmarks ${dateString}.json`);
        document.body.appendChild(downloadAnchorNode);

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
            simDataHolder.bookmarkList.avatars.push(addSim.avatars[0]);
        }
        // If removing bookmark
        else {

            // Remove bookmark
            storageUtils.deleteBookmark(simDataHolder.selSimID);

            // Remove sim from bookmark list
            for (let i = 0; i < simDataHolder.bookmarkList.avatars.length; i++) {

                if (simDataHolder.bookmarkList.avatars[i].avatar_id == simDataHolder.selSimID) {

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