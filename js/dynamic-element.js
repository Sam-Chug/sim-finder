// Build table head, shorten code
function buildTableHead (columnLeftText, columnRightText) {

    const tableHead = document.createElement("thead");
    const headRow = document.createElement("tr");

    const thLeft = document.createElement("th");
    const thRight = document.createElement("th");
    thLeft.textContent = columnLeftText;
    thRight.textContent = columnRightText;

    headRow.appendChild(thLeft);
    headRow.appendChild(thRight);

    tableHead.appendChild(headRow);

    return tableHead;
}

// Write to online sims table
function createSimsTable (simList) {

    const target = document.getElementById('sims-table');
    target.textContent = "";

    const tableHead = buildTableHead("Name", "Age");
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for (i = 0; i < simList.length; i++) {

        var newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdAge = document.createElement("td");

        tdName.textContent = simList[i].name;
        tdAge.textContent = simDayAge(simList[i].date) + " days";

        if (simList[i].name == "Reaganomics Lamborghini") tdName.classList.add("rainbow-text");

        newRow.appendChild(tdName);
        newRow.appendChild(tdAge);

        newRow = addClassesToTableRow(newRow);
        newRow.setAttribute("id", "sim");

        tableBody.appendChild(newRow);
    }
    target.appendChild(tableBody);
}

// Write to online sims table
function createLotsTable (lotList) {

    const target = document.getElementById('lots-table');
    target.textContent = "";

    const tableHead = buildTableHead("Name", "Population");
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for (i = 0; i < lotList.length; i++) {

        var newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdPop = document.createElement("td");

        tdName.textContent = lotList[i].name;
        tdPop.textContent = lotList[i].avatars_in_lot + " sims";

        newRow.appendChild(tdName);
        newRow.appendChild(tdPop);

        newRow = addClassesToTableRow(newRow);
        newRow.setAttribute("id", "lot");

        tableBody.appendChild(newRow);
    }
    target.appendChild(tableBody);
}

// Write amount of sims online
function writeToLabel (contentString, content, target) {

    const location = document.getElementById(target);
    const labelText = contentString + content;
    
    location.textContent = labelText;
}

// Onclick function for sim/lot lists
// Sends data to writers
async function getIndex (selectedIndex) {

    if(selectedIndex.id == "sim"){

        const simName = selectedIndex.cells[0].textContent;
        var selSimShort;
        var selSimLong;

        var simOnline = false;
        for (let i = 0; i < simShortList.avatars.length; i++) {

            if (simShortList.avatars[i].name == simName) {
                
                selSimLong = simLongList.avatars[i];
                selSimShort = returnShortSimFromLong(selSimLong);
                simOnline = true;
                break;
            }
        }
        if (!simOnline) {
            selSimLong = await grabAPI("https://api.freeso.org/userapi/city/1/avatars/name/" + simName.replace(" ", "%20"));
            selSimShort = returnShortSimFromLong(selSimLong);
        }
        writeGreaterSimContext(selSimShort, selSimLong, returnExistenceState(selSimShort));
    }
    else if (selectedIndex.id == "lot"){

        const lotName = selectedIndex.cells[0].textContent;
        var selLotShort;
        var selLotLong;

        for (let i = 0; i < lotShortList.lots.length; i++) {

            if (lotShortList.lots[i].name == lotName) {
                
                selLotShort = lotShortList.lots[i];
                selLotLong = returnLongLotFromLocation(selLotShort.location);
                break;
            }
        }
        const simView = document.getElementById("sim-viewer");
        simView.style.display = "none";

        writeLotThumbnail(selLotShort, selLotLong, "");
        writeSimsInLot(selLotLong, selLotShort.avatars_in_lot);
    }
    return;
}

// Add classes and eventlisteners to table row
function addClassesToTableRow (tableRow) {

    tableRow.addEventListener("click", 
    function(){

        getIndex(this);

        const elements = document.querySelectorAll("*");
        elements.forEach((element) => {
            element.classList.remove("table-row-selected");
        });
            
        this.classList.add("table-row-selected");
    });
    tableRow.addEventListener("mouseover",
    function(){

        styleMouseOverChange(this, "in");
    });

    tableRow.addEventListener("mouseout",
    function(){

        styleMouseOverChange(this, "out");
    });
    return tableRow;
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