const simDataHolder = new SimData();

document.addEventListener("DOMContentLoaded", async e => {

    console.log(`%c Sim Finder ${VERSION_STR} `, "color: yellow; background-color: purple;");
    console.log(`%c A Website By Reaganomics Lamborghini `, "color: yellow; background-color: purple;");

    simFinderMain.start();
});

simFinderMain = function() {

    async function start() {

        console.log("Loading site...");
        console.time("Load Complete");

        // Fetch online data
        console.time("Fetching data from API");
        await getOnlineData();
        console.timeEnd("Fetching data from API");

        // Populate GUI
        console.time("Populating GUI")
        populateGui();
        console.timeEnd("Populating GUI");

        console.timeEnd("Load Complete")
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
        filterUtils.fillButtonGraphics();
        domUtils.buildButtonTooltips();

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

        // Set list sizes
        domUtils.sizeLists();

        // Start sidebar update
        setInterval(sidebarUtils.updateSidebar, 1000);
        sidebarUtils.writeSidebarInfo();
    }

    return {
        start: start,
        getOnlineData: getOnlineData
    }
}();