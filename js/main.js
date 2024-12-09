const simDataHolder = new SimData();

document.addEventListener("DOMContentLoaded", async e => {

    console.log(`%c Sim Finder ${VERSION_STR} `, "color: yellow; background-color: purple; font-size: 1.9em;");
    console.log(`%c A Website By Reaganomics Lamborghini `, "color: yellow; background-color: purple;");

    simFinderMain.start();
});

simFinderMain = function() {

    // Program start
    async function start() {

        // Time the load of site
        console.log("Loading site...");
        console.time("Load Complete");

        // Grab or init user settings
        simDataHolder.userSetting = storageUtils.returnSettings();
        domUtils.siteColorMode(simDataHolder.userSetting.colorMode);

        // Fetch online data
        console.time("Fetching Data...");
        await getOfflineData();
        console.timeEnd("Fetching Data...");

        // Populate GUI
        console.time("Populating GUI")
        populateGui();
        console.timeEnd("Populating GUI");

        console.timeEnd("Load Complete");
    }

    // Since the FreeSO API is no longer online, grab data I've collected instead
    async function getOfflineData() {

        await shutdownUtils.buildSearchObjects();
        simDataHolder.bookmarkList = shutdownUtils.retrieveBookmarkNames();

        let staffObject = await apiUtils.getDBLookupData();
        STAFF_NAMES = staffObject.staffNames;
    }

    // Write online sims/lots to lists
    function populateGui() {

        // Fill bookmark lists
        guiUtils.writeBookmarkSims(simDataHolder.bookmarkList);

        // Generate tooltips
        domUtils.buildButtonTooltips();

        // Write site info
        sidebarUtils.writeSidebarInfo();

        // Set size of bookmark list
        domUtils.setDefaults();
    }

    return {
        start: start
    }
}();