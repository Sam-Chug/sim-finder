var selSimID;

// When bookmark button clicked
async function checkBookmark() {

    const checkBox = document.getElementById("bookmark-checkbox");

    if(checkBox.checked) {
        setBookmark(selSimID);
    }
    else if (!checkBox.checked) {
        delBookmark(selSimID);
    }
    
    //update bookmark list
    const simList = await idListToSimLongList(getBookmark().simID);
    writeBookmarkSims(simList);
}

// Change bookmark button styles
function updateBookmarkButton (selID) {

    selSimID = selID;

    const checkBox = document.getElementById("bookmark-checkbox");
    const bookSims = getBookmark();

    for (let i = 0; i < bookSims.simID.length; i++) {

        if (selID == bookSims.simID[i]) {

            console.log(selID, bookSims.simID[i]);
            checkBox.checked = true;
            return;
        }
    }
    checkBox.checked = false;
    return;

    if (state == "CHECK") {
        checkBox.background = "url(./images/bookmark-icons.png) 50 0";
    }
    else if (state == "UNCHECK") {
        checkBox.background = "url(./images/bookmark-icons.png) 0 0";
    }
}

// Return bookmark object
function getBookmark () {

    if (localStorage.length == 0) {

        const initStorage = {
            simID: []
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

    console.log("set: " + newID);
    console.log(localStorage);
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

    console.log("del: " + delID);
    console.log(localStorage);
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

    for (let i = 0; i < simList.avatars.length; i++) {

        var online = false;

        for (let j = 0; j < simShortList.avatars.length; j++) {

            if (simList.avatars[i].avatar_id == simShortList.avatars[j].avatar_id) {

                newRow = createBookmarkTableRow(simList.avatars[i], "ONLINE");
                tableBody.append(newRow);

                online = true;
                break;
            }
        }
        if (!online) {

            newRow = createBookmarkTableRow(simList.avatars[i], "OFFLINE");
            tableBody.append(newRow);
        }
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