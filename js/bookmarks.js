var selSimID;

// When bookmark button clicked
async function checkBookmark() {

    const checkBox = document.getElementById("bookmark-checkbox");

    if(checkBox.checked) {

        setBookmark(selSimID);
        const addSim = await idListToSimLongList([selSimID]);
        bookmarkList.avatars.push(addSim.avatars[0]);
    }
    else if (!checkBox.checked) {

        delBookmark(selSimID);
        for (let i = 0; i < bookmarkList.avatars.length; i++) {

            if (bookmarkList.avatars[i].avatar_id == selSimID) {

                bookmarkList.avatars.splice(i, 1);
                break;
            }
        }
    }
    bookmarkList.avatars.sort(({avatar_id:a}, {avatar_id:b}) => a - b);
    writeBookmarkSims(bookmarkList);
}

// Change bookmark button styles
function updateBookmarkButton (selID) {

    selSimID = selID;

    const checkBox = document.getElementById("bookmark-checkbox");
    const bookSims = getBookmark();

    for (let i = 0; i < bookSims.simID.length; i++) {

        if (selID == bookSims.simID[i]) {

            checkBox.checked = true;
            return;
        }
    }
    checkBox.checked = false;
    return;
}

// Return bookmark object
function getBookmark () {

    // Check if localstorage empty
    if (JSON.parse(localStorage.getItem("idList")) == null ||
        JSON.parse(localStorage.getItem("idList")).simID.length == 0) {

        localStorage.clear();

        let initStorage = {
            simID: [194687]
        };
        localStorage.setItem("idList", JSON.stringify(initStorage));
    }
    const simIDObject = JSON.parse(localStorage.getItem("idList"));

    return simIDObject;
}

// Add id to bookmark list
function setBookmark (newID) {

    const idStorage = getBookmark();

    idStorage.simID.push(newID);

    const storageString = JSON.stringify(idStorage);
    localStorage.setItem("idList", storageString);

    //console.log("set: " + newID);
    //console.log(localStorage);
}

// Remove id from bookmark list
function delBookmark (delID) {

    const idStorage = getBookmark();

    const index = idStorage.simID.indexOf(delID);
    if (index > -1) {
        idStorage.simID.splice(index, 1);
    }

    const storageString = JSON.stringify(idStorage);
    localStorage.setItem("idList", storageString);

    //console.log("del: " + delID);
    //console.log(localStorage);
}

// Id list to sim object
async function idListToSimLongList (idList) {

    var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
    for (i = 0; i < idList.length; i++) {

        simIdString += idList[i] + ",";
    }
    simIdString = simIdString.slice(0, -1);
    
    simLong = await grabAPI(simIdString);
    return simLong;
}

// Write bookmarks to table
function writeBookmarkSims (simList) {

    const target = document.getElementById("bookmark-table");
    target.textContent = "";

    const tableHead = buildTableHead("Name", "Age");
    target.append(tableHead);

    const tableBody = document.createElement("tbody");

    const onlineSims = new Array();
    const offlineSims = new Array();

    for (let i = 0; i < simList.avatars.length; i++) {

        var online = false;

        for (let j = 0; j < simShortList.avatars.length; j++) {

            if (simList.avatars[i].avatar_id == simShortList.avatars[j].avatar_id) {

                onlineSims.push(simList.avatars[i]);
                online = true;
                break;
            }
        }
        if (!online) {

            offlineSims.push(simList.avatars[i]);
        }
    }
    for (sim of onlineSims) {

        newRow = createBookmarkTableRow(sim, "ONLINE");
        tableBody.append(newRow);
    }
    for (sim of offlineSims) {

        newRow = createBookmarkTableRow(sim, "OFFLINE");
        tableBody.append(newRow);
    }
    target.appendChild(tableBody);
}

// Make table row
function createBookmarkTableRow (sim, state) {

    var newRow = document.createElement("tr");
    const tdName = document.createElement("td");
    const tdAge = document.createElement("td");

    tdName.textContent = sim.name;
    tdAge.textContent = simDayAge(sim.date) + " days";

    if (state == "OFFLINE") {

        tdName.classList.add("user-offline");
        tdAge.classList.add("user-offline");
    }
    else if (state == "ONLINE") {

        if (sim.name == "Reaganomics Lamborghini") tdName.classList.add("rainbow-text");
    }
    newRow.appendChild(tdName);
    newRow.appendChild(tdAge);

    newRow = addClassesToTableRow(newRow);
    newRow.setAttribute("id", "sim");

    return newRow;
}