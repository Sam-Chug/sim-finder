const simDataHolder = new SimData();

document.addEventListener("DOMContentLoaded", async e => {

    console.log(`%c Sim Finder ${VERSION_STR} `, "color: yellow; background-color: purple; font-size: 1.9em;");
    console.log(`%c A Website By Reaganomics Lamborghini `, "color: yellow; background-color: purple;");

    simFinderMain.start();
});

simFinderMain = function() {

    async function start() {

        console.log("Loading site...");
        console.time("Load Complete");

        // Grab or init user settings
        simDataHolder.userSetting = storageUtils.returnSettings();
        domUtils.siteColorMode(simDataHolder.userSetting.colorMode);

        // Fetch online data
        console.time("Fetching data from API");
        await getOfflineData();
        console.timeEnd("Fetching data from API");

        // Populate GUI
        console.time("Populating GUI")
        populateGui();
        console.timeEnd("Populating GUI");

        console.timeEnd("Load Complete")
    }

    async function getOfflineData() {

        await shutdownUtils.buildSearchObjects();

        simDataHolder.bookmarkList = shutdownUtils.retrieveBookmarkNames();

        let staffObject = await apiUtils.getDBLookupData();
        STAFF_NAMES = staffObject.staffNames;

        console.log(simDataHolder);
    }

    // Get data from api
    async function getOnlineData() {

        // Get bookmarks
        let bookmarkList = await apiUtils.getAPIData(apiUtils.buildLongSimLinkFromID(storageUtils.returnLocalStorage(STORAGE_BOOKMARK_KEY_OLD).simID));

        // Put into data holder
        simDataHolder.simShortList = simShortList;
        simDataHolder.simLongList = simLongList;
        simDataHolder.lotShortList = lotShortList;
        simDataHolder.lotLongList = lotLongList;
        simDataHolder.bookmarkList = bookmarkList;

        let staffObject = await apiUtils.getDBLookupData();
        STAFF_NAMES = staffObject.staffNames;
    }

    // Write online sims/lots to lists
    function populateGui() {

        // Fill bookmark lists
        guiUtils.writeBookmarkSims(simDataHolder.bookmarkList);

        // Write site info
        sidebarUtils.writeSidebarInfo();
    }

    return {
        start: start,
        getOnlineData: getOnlineData
    }
}();