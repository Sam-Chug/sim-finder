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