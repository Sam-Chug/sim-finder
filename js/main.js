const SIM_ONLINE_URL = "https://api.freeso.org/userapi/avatars/online";
const LOTS_ONLINE_URL = "https://api.freeso.org/userapi/city/1/lots/online";

var simShortList;
var simLongList;

var lotShortList;
var lotLongList;

var topLotShort;
var topLotLong;

var bookmarkList;

document.addEventListener("DOMContentLoaded", getOnline);

// Main
async function getOnline() {

    // Grab sims
    simShortList = await grabAPI(SIM_ONLINE_URL);
    simLongList = await grabAPI(buildSimLink(simShortList));

    // Grab lots
    lotShortList = await grabAPI(LOTS_ONLINE_URL);
    lotLongList = await grabAPI(buildLotLink(lotShortList));
    
    // Sort
    lotShortList.lots.sort(({avatars_in_lot:a}, {avatars_in_lot:b}) => b - a);
    simShortList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
    simLongList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);

    // Build sims
    createSimsTable(simLongList.avatars);
    writeToLabel("Sims Online: ", simShortList.avatars_online_count, "sims-online-count-label");

    // Build lots
    createLotsTable(lotShortList.lots);
    writeToLabel("Lots Online: ", lotShortList.total_lots_online, "lots-online-count-label");

    //console.log(lotShortList, lotLongList, simShortList, simLongList);

    // Style buttons
    fillButtonGraphics();

    // Check if localstorage empty
    if (JSON.parse(localStorage.getItem("idList")) == null ||
    JSON.parse(localStorage.getItem("idList")).simID.length == 0) {

        localStorage.clear();

        let initStorage = {
            simID: [194687]
        };
        localStorage.setItem("idList", JSON.stringify(initStorage));
    }

    // Fill bookmark list
    bookmarkList = await idListToSimLongList(getBookmark().simID);
    writeBookmarkSims(bookmarkList);

    // Write market watch
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