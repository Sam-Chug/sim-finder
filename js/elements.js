// Build table head, shorten code
function buildTableHead(columnLeftText, columnRightText){

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
function createSimsTable(simList){

    const target = document.getElementById('sims-table');
    const tableHead = buildTableHead("Name", "Age");
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for(i = 0; i < simList.avatars.length; i++){

        const newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdAge = document.createElement("td");

        tdName.textContent = simList.avatars[i].name;
        tdAge.textContent = simDayAge(simList.avatars[i].date) + " days";

        newRow.appendChild(tdName);
        newRow.appendChild(tdAge);

        newRow.addEventListener("click", 
        function(){
            getIndex(this);
        });

        newRow.addEventListener("mouseover",
        function(){
            styleMouseOverChange(this, "in");
        });

        newRow.addEventListener("mouseout",
        function(){
            styleMouseOverChange(this, "out");
        });

        newRow.setAttribute("id", "sim");

        tableBody.appendChild(newRow);
    }
    target.appendChild(tableBody);
}

// Write to online sims table
function createLotsTable(lotList){

    const target = document.getElementById('lots-table');
    const tableHead = buildTableHead("Name", "Population");
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for(i = 0; i < lotList.lots.length; i++){

        const newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdPop = document.createElement("td");

        tdName.textContent = lotList.lots[i].name;
        tdPop.textContent = lotList.lots[i].avatars_in_lot + " sims";

        newRow.appendChild(tdName);
        newRow.appendChild(tdPop);

        newRow.addEventListener("click", 
        function(){
            getIndex(this);
        });

        newRow.addEventListener("mouseover",
        function(){
            styleMouseOverChange(this, "in");
        });

        newRow.addEventListener("mouseout",
        function(){
            styleMouseOverChange(this, "out");
        });

        newRow.setAttribute("id", "lot");
        tableBody.appendChild(newRow);
    }
    target.appendChild(tableBody);
}

// Style change on mouse movement over text
function styleMouseOverChange(selectedIndex, movement) {

    if (movement == "in") {

        selectedIndex.classList.add("mouse-over-list-index");
    }
    else if (movement == "out") {

        selectedIndex.classList.remove("mouse-over-list-index");
    }
}

// Write amount of sims online
function writeToLabel(contentString, content, target){

    const location = document.getElementById(target);
    const labelText = contentString + content;

    location.textContent = labelText;
}

// Write info to lot thumbnail box
async function writeLotThumbnail (lotShort, lotLong) {

    writeToLabel(lotShort.name, "", "thumbnail-title");
    const descTarget = document.getElementById("thumbnail-desc-content");
    const imageTarget = document.getElementById("thumbnail-image");

    descTarget.textContent = "";
    imageTarget.src = "https://api.freeso.org/userapi/city/1/" + lotShort.location + ".png";

    const lotDesc = document.createElement("p");
    const lotOwnerTitle = document.createElement("p");
    const lotRoommateTitle = document.createElement("p");
    const lotOwner = document.createElement("p");
    const lotRoommates = document.createElement("p");

    lotDesc.textContent = "Category: " + LOT_CATEGORY[lotShort.category] + "\n" + 
                          "Estabolished: " + returnDateStringFromUNIX(lotLong.created_date) + "\n" + 
                          "Neighborhood: " + returnNeighborhood(lotShort.neighborhood_id) + "\n" +
                          "Admit Mode: " + ADMIT_MODES[lotShort.admit_mode] + "\n" + 
                          "Population: " + lotShort.avatars_in_lot + "\n\n";

    const roommates = await grabAPI(buildRoommateLink(lotLong));
    const owner = returnOwner(roommates, lotLong.owner_id);

    lotOwnerTitle.textContent = "Owner: ";
    lotRoommateTitle.textContent = "\nRoommates: ";

    lotOwner.textContent = owner.name;
    lotOwner.classList.add("user-offline");

    for (i = 0; i < simShortList.avatars.length; i++) {

        if (lotLong.owner_id == simShortList.avatars[i].avatar_id){

            lotOwner.classList.remove("user-offline");
        }
    }

    for (i = 0; i < roommates.avatars.length; i++) {

        if (roommates.avatars[i].avatar_id != owner.avatar_id) {

            // Check if roommate online

            const listRoommate = document.createElement("p");
            listRoommate.classList.add("user-offline");
            listRoommate.textContent = roommates.avatars[i].name;

            for (j = 0; j < simShortList.avatars.length; j++) {

                if (roommates.avatars[i].avatar_id == simShortList.avatars[j].avatar_id) {

                    listRoommate.classList.remove("user-offline");
                }
            }

            lotRoommates.appendChild(listRoommate);
        }
    }

    descTarget.appendChild(lotDesc);
    descTarget.appendChild(lotOwnerTitle);
    descTarget.appendChild(lotOwner);
    descTarget.appendChild(lotRoommateTitle);
    descTarget.appendChild(lotRoommates);
}