// Style change on mouse movement over text
function styleMouseOverChange (selectedIndex, movement) {

    if (movement == "in") {

        selectedIndex.classList.add("mouse-over-list-index");
    }
    else if (movement == "out") {

        selectedIndex.classList.remove("mouse-over-list-index");
    }
}

// Write info to lot thumbnail box
async function writeLotThumbnail (lotShort, lotLong, existence, simLong) {

    const descTarget = document.getElementById("thumbnail-desc-content");
    const imageTarget = document.getElementById("thumbnail-image");

    switch (existence) {

        case "FLOATING":
            descTarget.textContent = "Category: Air\n" + 
                                     "Established: Dawn of Time\n" + 
                                     "Admit Mode: Admit All";

            imageTarget.src = "./images/unknown.png";
            writeToLabel("Floating", "", "thumbnail-title");
            return;

        case "WORKING":
            descTarget.textContent = "Category: Job\n" +
                                     "Making: Simoleons";

            imageTarget.src = "./images/unknown.png";
            writeToLabel("Working - " + JOB_STRINGS[simLong.current_job], "", "thumbnail-title");
            return;

        case "HIDDEN":
            descTarget.textContent = "Hidden";
            imageTarget.src = "./images/unknown.png";
            writeToLabel("Hidden", "", "thumbnail-title");
            return;

        case "OFFLINE":
            descTarget.textContent = "This sim is touching grass";
            imageTarget.src = "./images/unknown.png";
            writeToLabel("Offline", "", "thumbnail-title");
            return;

        default:
            break;
    }
    writeToLabel(lotLong.name, "", "thumbnail-title");
    descTarget.textContent = "";
    imageTarget.src = "https://api.freeso.org/userapi/city/1/" + lotLong.location + ".png";
    console.log("Pinged: " + "https://api.freeso.org/userapi/city/1/" + lotLong.location + ".png");

    const lotDesc = document.createElement("p");
    const lotOwnerTitle = document.createElement("p");
    const lotRoommateTitle = document.createElement("p");
    const lotOwner = document.createElement("p");
    const lotRoommates = document.createElement("p");

    lotDesc.textContent = "Category: " + LOT_CATEGORY[lotLong.category] + "\n" + 
                          "Established: " + returnDateStringFromUNIX(lotLong.created_date) + "\n" + 
                          "Neighborhood: " + returnNeighborhood(lotLong.neighborhood_id) + "\n" +
                          "Admit Mode: " + ADMIT_MODES[lotLong.admit_mode] + "\n" + 
                          SKILL_MODES[lotLong.skill_mode] + "\n";

    const lotBG = document.getElementById("lot-thumbnail-bg");
    if ("error" in returnOpenState(lotShort)) {

        lotBG.classList.add("thumbnail-offline");
        lotDesc.textContent += "Population: 0" + "\n\n";
    }
    else if (!("error" in returnOpenState(lotShort))) {

        lotBG.classList.remove("thumbnail-offline");
        lotDesc.textContent += "Population: " + lotShort.avatars_in_lot + "\n\n";
    }
    // If town hall, skip roommates
    if (lotShort.category == 11) {

        descTarget.appendChild(lotDesc);
        descTarget.appendChild(lotOwnerTitle);
        descTarget.appendChild(lotOwner);
        descTarget.appendChild(lotRoommateTitle);
        return;
    }
    const roommates = await grabAPI(buildRoommateLink(lotLong));
    const owner = returnOwner(roommates, lotLong.owner_id);

    lotOwnerTitle.textContent = "Owner: ";
    lotRoommateTitle.textContent = "\nRoommates: ";

    lotOwner.textContent = owner.name;
    lotOwner.classList.add("user-offline");

    for (i = 0; i < simShortList.avatars.length; i++) {

        if (lotLong.owner_id == simShortList.avatars[i].avatar_id){

            lotOwner.classList.remove("user-offline");
        }
    }
    for (i = 0; i < roommates.avatars.length; i++) {

        if (roommates.avatars[i].avatar_id != owner.avatar_id) {

            // Check if roommate online
            const listRoommate = document.createElement("p");
            listRoommate.classList.add("user-offline");
            listRoommate.textContent = roommates.avatars[i].name;

            for (j = 0; j < simShortList.avatars.length; j++) {

                if (roommates.avatars[i].avatar_id == simShortList.avatars[j].avatar_id) {

                    listRoommate.classList.remove("user-offline");
                }
            }
            lotRoommates.appendChild(listRoommate);
        }
    }
    descTarget.appendChild(lotDesc);
    descTarget.appendChild(lotOwnerTitle);
    descTarget.appendChild(lotOwner);
    descTarget.appendChild(lotRoommateTitle);
    descTarget.appendChild(lotRoommates);
}

// Build sim thumbnail
function writeSimThumbnail (simShort, simLong) {

    writeToLabel(simLong.name, "", "sim-title");
    
    const imageTarget = document.getElementById("sim-thumbnail-image");
    if (simLong.gender == 0) {

        imageTarget.src = "./images/sim-faces/simface-m.png";
    }
    else if (simLong.gender == 1) {

        imageTarget.src = "./images/sim-faces/simface-f.png";
    }
    doEasterEggs(0, simLong);
    doEasterEggs(1, simLong);
    
    const bioTarget = document.getElementById("sim-bio");
    bioTarget.textContent = simLong.description;

    const descTarget = document.getElementById("sim-desc");
    var descContent = "Age: " + simDayAge(simLong.date) + " Days\n" + 
                      "ID: " + simLong.avatar_id + "\n" + 
                      "Joined: " + returnDateStringFromUNIX(simLong.date) + "\n" +
                      "Job: " + JOB_TITLES[simLong.current_job] + "\n";

    if (simLong.mayor_nhood != null) {

        descContent += "Mayor of " + returnNeighborhood(simLong.mayor_nhood) + "\n";
    }
    if (simShort.privacy_mode == 1) {

        descContent += "Privacy Mode: On\n";
    }
    else if (simShort.privacy_mode == 0) {

        descContent += "Privacy Mode: Off\n";
    }
    descContent += returnExistenceText(simShort) + "\n";
    descTarget.textContent = descContent;

    const simBG = document.getElementById("sim-thumbnail-bg");
    const lotBG = document.getElementById("lot-thumbnail-bg");
    switch (returnExistenceState(simShort)) {

        case "OFFLINE":
            simBG.classList.add("thumbnail-offline");
            lotBG.classList.add("thumbnail-offline");
            break;

        default:
            simBG.classList.remove("thumbnail-offline");
            lotBG.classList.remove("thumbnail-offline");
            break;
    }
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
    writeLotThumbnail(selShortLot, selLongLot, existence, simLong);
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

    var visitCount = 0;
    for (let i = 0; i < simShortList.avatars.length; i++) {

        if (selLot.roommates.includes(simShortList.avatars[i].avatar_id)) continue;

        if (simShortList.avatars[i].location == selLot.location) {

            simListText += simShortList.avatars[i].name + "\n";
            simTally++;
            visitCount++;
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

            if (simShortList.avatars[i].privacy_mode == 1) {

                roomListText += simShortList.avatars[i].name + " (Maybe)\n"
            }
            else if (simShortList.avatars[i].location == selLot.location) {

                roomListText += simShortList.avatars[i].name + "\n"
                simTally++;
            }
        }
    }
    if (population - simTally > 0) {

        if (visitCount == 0) {

            if ((population - simTally) == 1) {

                simListText += (population - simTally) + " Hidden Sim";
            }
            else {
                simListText += (population - simTally) + " Hidden Sims";
            }
        }
        else {

            if ((population - simTally) == 1) {

                simListText += "\nAnd " + (population - simTally) + " More Hidden Sim";
            }
            else {
                simListText += "\nAnd " + (population - simTally) + " More Hidden Sims";
            }
        }
    }
    simsContent.textContent = simListText;
    simList.appendChild(simsHeader);
    simList.appendChild(simsContent);

    roommatesContent.textContent = roomListText;
    roommateList.appendChild(roommatesHeader);
    roommateList.appendChild(roommatesContent);
}

// Write market data to market watch element
function writeMarketWatch (marketObj) {

    const marketBreakdown = document.getElementById("market-breakdown");
    var breakdownText = "$" + (marketObj.moneyPerHourJob + marketObj.moneyPerHourSMO).toLocaleString("en-US") + " Generated Per Hour\n\n" + 
                        "SMO Total $/Hr: $" + marketObj.moneyPerHourSMO.toLocaleString("en-US") + "\n" + 
                        marketObj.simsSMO + " Sims at " + marketObj.moneyLots.length + " Money Lots\n\n" +
                        "Job Total $/Hr: $" + marketObj.moneyPerHourJob.toLocaleString("en-US") + "\n" +
                        marketObj.simsWorking + " Sims at " + returnJobsOpen().length + " Job(s)\n\n\n" + 
                        "(Values Heavily Estimated)";

    marketBreakdown.textContent = breakdownText;

    const marketHotspots = document.getElementById("market-hotspots");
    var hotspotText = "Top Money Lots: \n\n";

    marketObj.moneyLots.sort(({lotMoney:a}, {lotMoney:b}) => b - a);

    for ( let i = 0; i < 3 && i < marketObj.moneyLots.length; i++) {

        hotspotText += (i + 1) + ". " + marketObj.moneyLots[i].lotObj.name + "\n" + 
                       " - $" + (marketObj.moneyLots[i].lotMoney).toLocaleString("en-US") + " $/Hr Total\n\n";
    }
    hotspotText = hotspotText.slice(0, -1);
    marketHotspots.textContent = hotspotText;
}

// Write to neighborhood watch div
function writeNeighborhoodWatch (nhoodObj) {

    const topNeighborhoods = document.getElementById("top-nhoods");
    var topText = "Top 10 Neighborhoods:\n\n";
    for (let i = 0; i < 10; i++) {

        topText += (i + 1) + ". " + returnNeighborhood(returnFixedNeighborhoodID("to_freeso", nhoodObj[i].nhood_id)) + "\n";
    }
    topText += "\n(Values Heavily Estimated)";
    topNeighborhoods.textContent = topText;

    const nextMovement = document.getElementById("nhood-movement");
    activeRegions = returnNHoodTopMovers(lotShortList, lotLongList, simShortList.avatars_online_count);
    activeRegions.sort(({rating:a}, {rating:b}) => b - a);
    const ratingMax = activeRegions[0].rating;

    const thead = buildTableHead("Region", "Movement");
    nextMovement.appendChild(thead);

    const tbody = document.createElement("tbody");
    for (let i = 0; i < activeRegions.length; i++) {
        
        if (activeRegions[i].rating == 0) {

            break;
        }
        let rating = activeRegions[i].rating;
        let chevronCount = "";
        if (ratingMax == rating) {

            chevronCount += "▲▲▲";
        }
        else if (ratingMax / .667 <= rating) {

            chevronCount += "▲▲"; 
        }
        else {
            
            chevronCount += "▲";
        }
        var newRow = document.createElement("tr");
        const tdRegion = document.createElement("td");
        const tdChevron = document.createElement("td");

        tdRegion.textContent = (i + 1) + ". " + returnNeighborhood(activeRegions[i].nhood_id);
        tdChevron.textContent = chevronCount;

        newRow.appendChild(tdRegion);
        newRow.appendChild(tdChevron);

        newRow = addClassesToTableRow(newRow);
        tbody.appendChild(newRow);
    }
    nextMovement.appendChild(tbody);
    return;
}

// Do animation for expanding/retracting sidebar window
// This is probably stupid but i dont know any better
function expandSidebar() {

    const sidebar = document.getElementById("sidebar");
    const button = document.getElementById("sidebar-button");
    const sidebarHolder = document.getElementById("sidebar-holder");

    if (!sidebar.classList.contains("animate-sidebar")) {

        sidebar.classList.remove("animate-sidebar-reverse");
        button.classList.remove("animate-sidebar-button-reverse");
        sidebarHolder.classList.remove("animate-sidebar-holder-reverse");

        sidebarHolder.classList.add("animate-sidebar-holder");
        sidebar.classList.add("animate-sidebar");
        button.classList.add("animate-sidebar-button");

        toggleSidebarElements("show");
    }
    else {

        sidebar.classList.remove("animate-sidebar");
        button.classList.remove("animate-sidebar-button");
        sidebarHolder.classList.remove("animate-sidebar-holder");

        sidebarHolder.classList.add("animate-sidebar-holder-reverse");
        sidebar.classList.add("animate-sidebar-reverse");
        button.classList.add("animate-sidebar-button-reverse");

        toggleSidebarElements("hide");
    }
}

// Hide sidebar elements when sidebar retracted
function toggleSidebarElements(visibility) {

    const toggleElements = document.getElementsByClassName("sidebar-hide");

    if (visibility == "hide") {

        for (let i = 0; i < toggleElements.length; i++) {

            toggleElements[i].style.display = "none";
        }
    }
    else if (visibility == "show") {

        for (let i = 0; i < toggleElements.length; i++) {

            toggleElements[i].style.display = "block";
        }
    }
}

// Format to sim-time and write to clock
function writeSimClock() {

    const simClock = document.getElementById("sim-clock");
    const simTime = returnSimTime();
    var timeDenom = "AM";

    if (simTime[0] > 12) {

        timeDenom = "PM";
        simTime[0] %= 12;
    }
    if (simTime[0] == 0) {

        simTime[0] = 12;
    }
    if (simTime[1] < 10) {
        simTime[1] = "0" + simTime[1];
    }
    simClock.textContent = simTime[0] + ":" + simTime[1] + " " + timeDenom;

    writeActiveJobs();
}

// Display which jobs are currently active
function writeActiveJobs() {

    const jobsActive = returnJobsOpen();

    const jobRobot = document.getElementById("job-robot");
    const jobDiner = document.getElementById("job-diner");
    const jobClub = document.getElementById("job-club");

    jobRobot.style.background = "url(./images/buttons/jobs-active.png) 40px 0";
    jobDiner.style.background = "url(./images/buttons/jobs-active.png) 40px 80px";
    jobClub.style.background = "url(./images/buttons/jobs-active.png) 40px 40px";

    if (jobsActive.includes(1)) {

        jobRobot.style.background = "url(./images/buttons/jobs-active.png) 0 0";
    }
    if (jobsActive.includes(2)) {

        jobDiner.style.background = "url(./images/buttons/jobs-active.png) 0 80px";
    }
    if (jobsActive.includes(4)) {

        jobClub.style.background = "url(./images/buttons/jobs-active.png) 0 40px";
    }
}

// Process min/max window button on click
function minWindow(type) {

    if (type == "sim") {

        const filterImg = document.getElementById("sim-filter-min-image");
        const filterPanel = document.getElementById("sim-filter-array");

        if (filterImg.classList.contains("window-minable")) {

            filterImg.classList.remove("window-minable");
            filterImg.classList.add("window-maxable");
        }
        else {

            filterImg.classList.add("window-minable");
            filterImg.classList.remove("window-maxable");
        }
        if (filterPanel.style.display === "none") {

            filterPanel.style.display = "flex";
        }
        else {

            filterPanel.style.display = "none";
        }
    }
    else if (type == "lot") {

        const filterImg = document.getElementById("lot-filter-min-image");
        const filterPanel = document.getElementById("lot-filter-array");

        if (filterImg.classList.contains("window-minable")) {

            filterImg.classList.remove("window-minable");
            filterImg.classList.add("window-maxable");
        }
        else {

            filterImg.classList.add("window-minable");
            filterImg.classList.remove("window-maxable");
        }
        if (filterPanel.style.display === "none") {

            filterPanel.style.display = "flex";

        } else {

            filterPanel.style.display = "none";
        }
    }
    sizeLists();
}

// Write about info in sidebar info panel 
async function writeSidebarInfo() {

    const infoBox = document.getElementById("sidebar-site-info");
    const gitJson = await returnGitCommitJson();
    var date = gitJson.commit.commit.author.date.slice(0, 10);
    
    var infoText = "Sim Finder\n\nLast Update:\n" + date;
    infoBox.textContent = infoText;
}

// Auto size lists to fit screen
function sizeLists() {

    const windowHeight = window.innerHeight;

    const simSearch = document.getElementById("sim-search-panel");
    const simFilter = document.getElementById("sim-filter-panel");
    const simList = document.getElementById("sims-table");
    var height = Math.max(windowHeight - (simSearch.offsetHeight + simFilter.offsetHeight) - 145, 416);
    height = Math.min(height, 1016);
    var heightPX = height + "px";
    simList.style.maxHeight = heightPX;


    const lotSearch = document.getElementById("lot-search-panel");
    const lotFilter = document.getElementById("lot-filter-panel");
    const bookList = document.getElementById("bookmark-table");
    const lotList = document.getElementById("lots-table");
    var height = Math.max((windowHeight - (lotSearch.offsetHeight + lotFilter.offsetHeight) - 261) / 2, 150);
    height = Math.min(height, 450);
    var heightPX = height + "px";
    lotList.style.maxHeight = heightPX;
    bookList.style.maxHeight = heightPX;
}