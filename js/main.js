const simDataHolder = new SimData();
var selSimID;

document.addEventListener("DOMContentLoaded", async e => {

    simFinderMain.start();
});

simFinderMain = function() {

    async function start() {

        // Fetch online data
        await getOnlineData();

        // Populate GUI
        populateGui();
    }

    // Get data from api
    async function getOnlineData() {

        // Grab sim data
        let simShortList = await apiUtils.getAPIData(SIM_ONLINE_URL);
        let simLongList = await apiUtils.getAPIData(apiUtils.buildLongSimLink(simShortList));

        // Grab lot data
        let lotShortList = await apiUtils.getAPIData(LOTS_ONLINE_URL);
        let lotLongList = await apiUtils.getAPIData(apiUtils.buildLongLotLink(lotShortList));

        // Sort
        lotShortList.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);
        simShortList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
        simLongList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);

        // Get bookmarks
        let bookmarkList = await apiUtils.getAPIData(apiUtils.buildLongSimLinkFromID(storageUtils.returnLocalStorage(STORAGE_KEY_OLD).simID));

        // Put into data holder
        simDataHolder.simShortList = simShortList;
        simDataHolder.simLongList = simLongList;
        simDataHolder.lotShortList = lotShortList;
        simDataHolder.lotLongList = lotLongList;
        simDataHolder.bookmarkList = bookmarkList;

        // Get market watch data
        simDataHolder.marketData = marketWatchUtils.returnMarketObject(
            simDataHolder.simLongList, 
            simDataHolder.simShortList, 
            simDataHolder.lotShortList
        );
    }

    // Write online sims/lots to lists
    function populateGui() {

        // Generate filter buttons
        guiUtils.fillButtonGraphics();

        // Fill sim/lot lists
        guiUtils.populateSimList(simDataHolder.simLongList.avatars);
        guiUtils.writeToLabel(
            "Sims Online: ", 
            simDataHolder.simShortList.avatars_online_count, 
            "sims-online-count-label"
        );
        
        guiUtils.populateLotList(simDataHolder.lotShortList.lots);
        guiUtils.writeToLabel(
            "Lots Online: ", 
            simDataHolder.lotShortList.total_lots_online, 
            "lots-online-count-label"
        );

        // Fill bookmark lists
        guiUtils.writeBookmarkSims(simDataHolder.bookmarkList);

        // Write market watch
        marketWatchUtils.writeMarketWatch(simDataHolder.marketData);
    }

    return {
        start: start,
        getOnlineData: getOnlineData
    }
}();

// Main
async function getOnline() {

    // Style buttons (Converted)
    fillButtonGraphics();

    // Check if localstorage empty
    // TODO: Change localstorage key for better storage safety
    if (JSON.parse(localStorage.getItem("idList")) == null ||
    JSON.parse(localStorage.getItem("idList")).simID.length == 0) {

        localStorage.clear();

        let initStorage = {
            simID: [194687]
        };
        localStorage.setItem("idList", JSON.stringify(initStorage));
    }

    // Fill bookmark list (Converted)
    bookmarkList = await idListToSimLongList(getBookmark().simID);
    writeBookmarkSims(bookmarkList);

    // Write market watch (Converted)
    const marketObj = returnMarketObject(simLongList.avatars, simShortList.avatars, lotShortList.lots);
    writeMarketWatch(marketObj);

    // Start sim clock
    setInterval(writeSimClock, 1000);
    writeSimClock();

    // Write sidebar info
    writeSidebarInfo();

    // Set list sizes
    sizeLists();

    // Top neighborhoods
    // topLotShort = await grabAPI("https://api.freeso.org/userapi/city/1/lots/top100/all");
    // topLotLong = await grabAPI(buildTopLotsLink(topLotShort));
    // const topNhood = returnNeighborhoodScore(topLotShort, topLotLong);
    // writeNeighborhoodWatch(topNhood);
}