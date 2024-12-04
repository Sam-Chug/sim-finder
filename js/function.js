simUtils = function() {

    // Return sim age from UNIX timestamp
    function returnSimAge(joinDate) {

        let utcNow = new Date().getTime();
        let now = Math.round(utcNow / 1000);
        return Math.floor((now - joinDate) / 86400);
    }

    // Return if sim has a birthday today (can be inaccurate)
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

    // Return text-formatted date string
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

    // Check if sim is in list of known staff sims
    function isSimStaffMember(simName) {

        let simLower = simName.toLowerCase();
        for (let i = 0; i < STAFF_NAMES.length; i++) {

            let staffLower = STAFF_NAMES[i].toLowerCase();
            if (simLower === staffLower) return true;
        }
    }

    return {
        returnDateObjectFromUNIX: returnDateObjectFromUNIX,
        returnSimAge: returnSimAge,
        returnSimTime: returnSimTime,
        returnTextDateFromDateObject: returnTextDateFromDateObject,
        checkIfSimBirthday: checkIfSimBirthday,
        isSimStaffMember: isSimStaffMember,
    }
}();

domUtils = function() {

    // hacky solution to find list entry's index in it's own list
    function getIndexInParent(element) {

        return Array.from(element.parentNode.children).indexOf(element);
    }

    // Clear sim selection in list
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

    // Copy sim/lot name to clipboard when clicking the sim/lot's name plate
    function copyTextToClipboard(e) {

        navigator.clipboard.writeText(apiUtils.cleanLink(e.textContent));
    }

    // Swap between light mode and dark mode
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

    // Swap between light mode and dark mode
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

    // Add tooltip to various GUI buttons
    function buildButtonTooltips() {

        addTooltipToButton(GUI_EXPORT_BUTTON, "export");
        addTooltipToButton(GUI_IMPORT_BUTTON, "import");

        addTooltipToButton(GUI_SIM_HELP_BUTTON, "style-help");
        addTooltipToButton(GUI_COLORMODE_BUTTON, "colormode");
    }

    // Add tooltip to various GUI buttons
    function addTooltipToButton(element, type) {

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
                
                case "style-help":
                    tooltip.textContent = "Open Sim Panel Formatting Help Page";
                    tooltip.classList.add("under-tooltip");
                    break;

                case "colormode":
                    tooltip.textContent = "Toggle Light";
                    tooltip.classList.add("mid-tooltip");
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

    // Special easter egg for your's truly
    function reaganEgg() {

        GUI_SIM_LABEL.classList.add("label-gold");
        GUI_SIM_VIEW.classList.add("block-gold");
        
        GUI_SIM_THUMBNAIL.classList.add("reagan-image");

        GUI_SIM_BIO.classList.add("inset-gold");
        GUI_SIM_DESCRIPTION.classList.add("inset-gold");

        GUI_BOOKMARK_LABEL.classList.add("bookmark-gold");
    }   

    // Test function for custom styles
    function testCustomStyle(color) {

        // Test specified style
        GUI_SIM_VIEW.classList.add(CUSTOM_STYLE_BLOCK[`b${color}`].cssClass);
        GUI_SIM_LABEL.classList.add(CUSTOM_STYLE_LABEL[`l${color}`].cssClass);
        GUI_SIM_BIO.classList.add(CUSTOM_STYLE_INSET[`i${color}`].cssClass);
        GUI_SIM_DESCRIPTION.classList.add(CUSTOM_STYLE_INSET[`i${color}`].cssClass);
    }

    // Process a sim's custom styles
    function handleCustomSimStyles(selectedSim) {

        // Reset previous styles
        resetSimThumbnailStyles();

        // Assure sim view is open
        GUI_SIM_VIEW.style.display = "flex";

        // Do Reagan
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

    // Spawn confetti particles if sim is special
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

    // Remove confetti particles after around a second
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

    // Appropriately scatter confetti at random angles
    function findConfettiAngle(cx, cy, px, py) {

        let dy = py - cy;
        let dx = px - cx;

        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;

        return theta;
    }

    return {
        resetSimThumbnailStyles: resetSimThumbnailStyles,
        handleCustomSimStyles: handleCustomSimStyles,
        spawnConfetti: spawnConfetti,
        removeConfetti: removeConfetti
    }
}();

guiUtils = function() {

    // Write string to label
    function writeToLabel(contentString, content, target) {

        const location = document.getElementById(target);
        const labelText = contentString + content;
        
        location.textContent = labelText;
    }

    // Get sim name from index in list (hacky solution to a non-problem)
    function getSimNameFromList(listElement, index) {

        let simName = listElement.children[index].children[0].textContent;
        return simName;
    }

    // Write sim bio from selected list index
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

    // Format a sim's name plate based on various possible aspects
    function returnSimTitle(selectedSimLong) {

        let isBirthday = simUtils.checkIfSimBirthday(selectedSimLong.date);
        let isStaff = simUtils.isSimStaffMember(selectedSimLong.name);

        let birthdayString = (isBirthday) ? " 🎂" : "";
        let staffString = (isStaff) ? " 🔧" : "";

        return `${selectedSimLong.name}${birthdayString}${staffString}`;
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

    // Build sim/lot lists
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

    // Populate sim bookmark list
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

    // Create list entry with two columns of content (Ideally a sim's name, and age)
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

    // Add click event listener to list entry
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

    return {
        writeGreaterSimContext: writeGreaterSimContext,
        buildListHeader: buildListHeader,
        populateSimList: populateSimList,
        writeToLabel: writeToLabel,
        getIndex: getIndex,
        updateBookmarkButton: updateBookmarkButton,
        writeSimThumbnail: writeSimThumbnail,
        writeBookmarkSims: writeBookmarkSims,
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
            if (simDataHolder.name_search_lower[simName.toLowerCase()] === undefined) {

                alert("Cannot find sim \"" + simName + "\"");
                return;
            }
            else selectedID = simDataHolder.name_search_lower[simName.toLowerCase()];
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

    // Get json of latest sim-finder commit
    async function returnGitCommitJson() {

        const apiLink = "https://api.github.com/repos/sam-chug/sim-finder/branches/master";

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();

        console.log("%cFetching Last Sim Finder Commit:\n\n", "color: white; background-color: darkgreen;", apiLink);
        
        return obj;
    }

    // Get json of currently known staff names
    async function getDBLookupData() {

        const apiLink = "https://raw.githubusercontent.com/Sam-Chug/sim-finder-data/main/staff-names";

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
        console.log("%cFetching Sim Finder Lookup Data:\n\n", "color: white; background-color: darkgreen;", apiLink);
        
        return obj;
    }

    // Return block of 1000 sims from archived database
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

    // Clean link of any crap I couldn't figure out how to remove otherwise
    function cleanLink(linkText) {

        // Catches for conditionals I'm too stupid to fix in a good way
        if (linkText.includes("(Maybe Hosting)")) linkText = linkText.replace(" (Maybe Hosting)", "");
        if (linkText.includes("🎂")) linkText = linkText.replace(" 🎂", "");
        if (linkText.includes("🔧")) linkText = linkText.replace(" 🔧", "");
        if (linkText.includes("(Hosting)")) linkText = linkText.replace(" (Hosting)", "");

        return linkText;
    }

    // Send analytics entry when a user looks up a sim
    function sendSimEntityAnalytics(fetchedSimName, fetchedSimID) {

        gtag('event', 'api_sim_fetch', {
            'fetchedSimName' : fetchedSimName,
            'fetchedSimID' : fetchedSimID
        });
    }

    // Send analytics entry when a user bookmarks a sim
    function sendBookmarkAnalytics(bookmarked, entityName, entityID) {

        gtag('event', 'bookmark_change', {
            'bookmarked' : bookmarked,
            'bookmarkedName' : entityName,
            'bookmarkedID' : entityID
        });
    }

    return {
        returnGitCommitJson: returnGitCommitJson,
        sendSimEntityAnalytics: sendSimEntityAnalytics,
        sendBookmarkAnalytics: sendBookmarkAnalytics,
        getDBLookupData: getDBLookupData,
        cleanLink: cleanLink,
        getShutdownSimlist: getShutdownSimlist
    }
}();

shutdownUtils = function() {

    // Get sim-data block a specified sim belongs to. (In groups of thousands)
    async function getSimGroup(simID) {

        let group = Math.ceil(simID / 1000) * 1000;
        return shutdownUtils.returnShutdownSimData(simID, await apiUtils.getShutdownSimlist(group));
    }

    // Call to retrieve a sim's data from database
    function returnShutdownSimData(simID, simGroup) {

        for (let i = 0; i < simGroup.avatars.length; i++) {

            if (simID == simGroup.avatars[i].id) return simGroup.avatars[i];
        }
    }

    // Build list of bookmarked sim names from id-name cache
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

    // Build search caches from various small sim-id pair lists (probably could be optimized)
    async function buildSearchObjects() {

        // TODO: Optimize for low bandwidth

        // ID: Name
        await fetch('./sim-data/id-list.txt')
        .then(response => response.text())
        .then((data) => {
            simDataHolder.id_search = JSON.parse(data);
        });

        // Name: ID
        await fetch('./sim-data/name-list.txt')
        .then(response => response.text())
        .then((data) => {
            simDataHolder.name_search = JSON.parse(data);
        });

        // Name (lowercase): ID
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

    // Set default user settings
    function setDefaultSettings() {

        // Check if user settings empty
        if (!checkIfSettingsEmpty()) return;
        localStorage.removeItem(SETTINGS_KEY);

        // Set default user settings
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(new UserSetting()));
    }

    // Retrieve user settings
    function returnSettings() {

        if (checkIfSettingsEmpty()) setDefaultSettings();

        let settingObject = JSON.parse(localStorage.getItem(SETTINGS_KEY));
        return settingObject;
    }

    // Check if a user has set their settings yet
    function checkIfSettingsEmpty() {

        return (JSON.parse(localStorage.getItem(SETTINGS_KEY) == null));
    }

    // Check if bookmark list empty
    function checkIfStorageEmpty(storageKey) {

        // If storage empty or sim ID list is empty
        return (JSON.parse(localStorage.getItem(storageKey)) == null ||
        JSON.parse(localStorage.getItem(storageKey)).simID.length == 0);
    }

    // If bookmark list is empty, set to default value (Reagan bookmark)
    function setDefaultStorage(storageKey) {

        // If storage is not empty, return
        if (!checkIfStorageEmpty(storageKey)) return;

        // Clear previous storage, just in case
        localStorage.removeItem(storageKey);

        // Set storage to have one sim ID
        let initStorage = { simID: [194687] };
        localStorage.setItem(storageKey, JSON.stringify(initStorage));
    }

    // Remove data from localstorage by specified key
    function removeStorageKey(storageKey) {

        localStorage.removeItem(storageKey);
    }

    // Change the key of data in localstorage
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

    // Save data to localstorage
    function saveStorage(storageKey, storageString) {

        localStorage.setItem(storageKey, storageString);
    }

    // Add bookmark to stored bookmarks
    function addBookmark(addID) {

        // Get bookmark storage, append new bookmark
        let bookmarkStorage = returnLocalStorage(STORAGE_BOOKMARK_KEY);
        bookmarkStorage.simID.push(addID);
        
        // Save local storage
        let storageString = JSON.stringify(bookmarkStorage);
        saveStorage(STORAGE_BOOKMARK_KEY, storageString);
    }

    // Remove bookmark from stored bookmarks
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

    // Return localstorage
    function returnLocalStorage(storageKey) {

        // If storage empty, set default storage
        if (checkIfStorageEmpty(storageKey)) setDefaultStorage(storageKey);

        // Return json from local storage
        let simIDObject = JSON.parse(localStorage.getItem(storageKey));
        return simIDObject;
    }

    // Export localstorage (currently used for bookmarks)
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

    // Import localstorage (currently used for bookmarks)
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

    // Check if imported bookmarks are valid
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

    // Handle the action of bookmarking a sim
    async function handleBookmarkCheck() {

        // If adding bookmark
        if (GUI_BOOKMARK_BUTTON.checked) {

            // Add bookmark to list
            storageUtils.addBookmark(simDataHolder.selSimID);

            // Get data from new bookmark list, fetch in case sim was offline
            let addedSimName = simDataHolder.id_search[simDataHolder.selSimID];
            apiUtils.sendBookmarkAnalytics(true, addedSimName, simDataHolder.selSimID);

            simDataHolder.bookmarkList.push({avatar_id: simDataHolder.selSimID, name: addedSimName});
        }
        // If removing bookmark
        else {

            // Remove bookmark
            storageUtils.deleteBookmark(simDataHolder.selSimID);

            // Remove sim from bookmark list
            for (let i = 0; i < simDataHolder.bookmarkList.length; i++) {

                if (simDataHolder.bookmarkList[i].avatar_id == simDataHolder.selSimID) {

                    let delSim = simDataHolder.bookmarkList[i];
                    apiUtils.sendBookmarkAnalytics(true, delSim.name, delSim.avatar_id);

                    simDataHolder.bookmarkList.splice(i, 1);
                    break;
                }
            }
        }

        // Sort sims by id, rewrite bookmark list
        simDataHolder.bookmarkList.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
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