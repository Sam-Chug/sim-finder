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

// Fill search button arrays on load
function fillButtonGraphics () {

    const lotFilterArray = document.getElementById("lot-filter-array");
    const simFilterArray = document.getElementById("sim-filter-array");

    for (let i = 0; i < 12; i++) {

        let button = document.createElement("button");

        var x = (i % 4) * 71;
        var y = Math.floor(i / 4) * 71;
        button.style.background = "url(./images/lot-filter.png) " + -x + "px " + -y + "px";

        addClassesToButton(button, "lot");
        lotFilterArray.appendChild(button);
    }
    for (let i = 0; i < 8; i++) {

        let button = document.createElement("button");

        var x = (i % 4) * 71;
        var y = Math.floor(i / 4) * 71;
        button.style.background = "url(./images/sim-filter.png) " + -x + "px " + -y + "px";

        addClassesToButton(button, "sim");
        simFilterArray.appendChild(button);
    }
}

// Add functions to filter buttons
function addClassesToButton (element, type) {

    element.classList.add("filter-button");
    if (type == "sim") element.id = "sim-filter-button";
    if (type == "lot") element.id = "lot-filter-button";

    element.addEventListener("click",
    function() {

    filterButtonClick(this, type);
    });
    element.addEventListener("mouseover",
    function() {

        mouseOverButtonChange(this, "in", type);

        const tooltip = document.createElement("span");
        tooltip.classList.add("tooltip");
        
        if (type == "sim") tooltip.textContent = SIM_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
        if (type == "lot") tooltip.textContent = LOT_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];

        this.appendChild(tooltip);
    });
    element.addEventListener("mouseout",
    function(){

        mouseOverButtonChange(this, "out", type);

        this.removeChild(this.children[0]);
    });
}

// Style change on button mouseover
function mouseOverButtonChange (button, action, type) {

    const index = Array.from(button.parentElement.children).indexOf(button);

    var x = (index % 4) * 71;
    var y = Math.floor(index / 4) * 71;

    if (type == "lot") {

        if (button.classList.contains("lot-filter-active")) return;

        if (action == "in") {
        
            button.style.background = "url(./images/lot-filter-hover.png) " + -x + "px " + -y + "px";
        }
        else if (action == "out") {

            button.style.background = "url(./images/lot-filter.png) " + -x + "px " + -y + "px";
        }
    }
    else if (type == "sim") {

        if (button.classList.contains("sim-filter-active")) return;

        if (action == "in") {
        
            button.style.background = "url(./images/sim-filter-hover.png) " + -x + "px " + -y + "px";

        }
        else if (action == "out") {

            button.style.background = "url(./images/sim-filter.png) " + -x + "px " + -y + "px";
        }
    }
}

// Style change on button click
function filterButtonClick (button, type) {

    const index = Array.from(button.parentElement.children).indexOf(button);
    filterArray = button.parentElement;

    var count = 0;

    if (type == "lot") {

        var sameButton = (button.classList.contains("lot-filter-active"));

        for (let button of filterArray.children) {

            button.classList.remove("lot-filter-active");
            var x = (count % 4) * 71;
            var y = Math.floor(count / 4) * 71;
            button.style.background = "url(./images/lot-filter.png) " + -x + "px " + -y + "px";
    
            count++;
        }
        if (sameButton) {
            writeFilterToTable("lot", "REMOVE");
        }
        else {
            var x = (index % 4) * 71;
            var y = Math.floor(index / 4) * 71;
            button.style.background = "url(./images/lot-filter-selected.png) " + -x + "px " + -y + "px";
            button.classList.add("lot-filter-active");
            writeFilterToTable("lot", index);
        }
        return;
    }
    else if (type == "sim") {

        var sameButton = (button.classList.contains("sim-filter-active"));

        for (let button of filterArray.children) {

            button.classList.remove("sim-filter-active");
            var x = (count % 4) * 71;
            var y = Math.floor(count / 4) * 71;
            button.style.background = "url(./images/sim-filter.png) " + -x + "px " + -y + "px";
    
            count++;
        }

        if (sameButton) {

            writeFilterToTable("sim", "REMOVE");
        }
        else {

            var x = (index % 4) * 71;
            var y = Math.floor(index / 4) * 71;
            button.style.background = "url(./images/sim-filter-selected.png) " + -x + "px " + -y + "px";
            button.classList.add("sim-filter-active");
            writeFilterToTable("sim", SIM_SEARCH[index]);
        }
        return;
    }
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