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

// Style change on mouse movement over text
function styleMouseOverChange (selectedIndex, movement) {

    if (movement == "in") {

        selectedIndex.classList.add("mouse-over-list-index");
    }
    else if (movement == "out") {

        selectedIndex.classList.remove("mouse-over-list-index");
    }
}

// Write amount of sims online
function writeToLabel (contentString, content, target) {

    const location = document.getElementById(target);
    const labelText = contentString + content;
    
    location.textContent = labelText;
}

// Write info to lot thumbnail box
async function writeLotThumbnail (lotShort, lotLong, existence) {

    const descTarget = document.getElementById("thumbnail-desc-content");
    const imageTarget = document.getElementById("thumbnail-image");

    switch (existence) {

        case "FLOATING":
            descTarget.textContent = "Category: Air\n" + 
                                     "Established: Dawn of Time\n" + 
                                     "Admit Mode: Admit All";

            imageTarget.src = "./images/unknown.png";
            writeToLabel("Floating", "", "thumbnail-title");
            return;

        case "WORKING":
            descTarget.textContent = "Category: Job\n" +
                                     "Making: Simoleons";

            imageTarget.src = "./images/unknown.png";
            writeToLabel("Working", "", "thumbnail-title");
            return;

        case "HIDDEN":
            descTarget.textContent = "Hidden";
            imageTarget.src = "./images/unknown.png";
            writeToLabel("Hidden", "", "thumbnail-title");
            return;

        case "OFFLINE":
            descTarget.textContent = "This sim is touching grass";
            imageTarget.src = "./images/unknown.png";
            writeToLabel("Offline", "", "thumbnail-title");
            return;

        default:
            break;
    }

    writeToLabel(lotLong.name, "", "thumbnail-title");
    descTarget.textContent = "";
    imageTarget.src = "https://api.freeso.org/userapi/city/1/" + lotLong.location + ".png";

    const lotDesc = document.createElement("p");
    const lotOwnerTitle = document.createElement("p");
    const lotRoommateTitle = document.createElement("p");
    const lotOwner = document.createElement("p");
    const lotRoommates = document.createElement("p");

    lotDesc.textContent = "Category: " + LOT_CATEGORY[lotLong.category] + "\n" + 
                          "Established: " + returnDateStringFromUNIX(lotLong.created_date) + "\n" + 
                          "Neighborhood: " + returnNeighborhood(lotLong.neighborhood_id) + "\n" +
                          "Admit Mode: " + ADMIT_MODES[lotLong.admit_mode] + "\n";

    const lotBG = document.getElementById("lot-thumbnail-bg");
    if ("error" in returnOpenState(lotShort)) {

        lotBG.classList.add("thumbnail-offline");
        lotDesc.textContent += "Population: 0" + "\n\n";
    }
    else if (!("error" in returnOpenState(lotShort))) {

        lotBG.classList.remove("thumbnail-offline");
        lotDesc.textContent += "Population: " + lotShort.avatars_in_lot + "\n\n";
    }
    if (lotShort.category == 11) {

        descTarget.appendChild(lotDesc);
        descTarget.appendChild(lotOwnerTitle);
        descTarget.appendChild(lotOwner);
        descTarget.appendChild(lotRoommateTitle);
    }
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

function writeSimThumbnail (simShort, simLong) {

    writeToLabel(simLong.name, "", "sim-title");
    doEasterEggs(0, simLong.name);

    const imageTarget = document.getElementById("sim-thumbnail-image");
    if (simLong.gender == 0) {

        imageTarget.src = "./images/simface-m.png";
    }
    else if (simLong.gender == 1) {

        imageTarget.src = "./images/simface-f.png";
    }

    doEasterEggs(1, simLong.name);

    const bioTarget = document.getElementById("sim-bio");
    bioTarget.textContent = simLong.description;

    const descTarget = document.getElementById("sim-desc");
    var descContent = "Age: " + simDayAge(simLong.date) + " Days\n" + 
                      "ID: " + simLong.avatar_id + "\n" + 
                      "Joined: " + returnDateStringFromUNIX(simLong.date) + "\n" +
                      "Job: " + JOB_TITLES[simLong.current_job] + "\n";

    if (simLong.mayor_nhood != null) {

        descContent += "Mayor of " + returnNeighborhood(simLong.mayor_nhood) + "\n";
    }

    if (simShort.privacy_mode == 1) {

        descContent += "Privacy Mode: On\n";
    }
    else if (simShort.privacy_mode == 0) {

        descContent += "Privacy Mode: Off\n";
    }

    descContent += returnExistenceText(simShort) + "\n";
    descTarget.textContent = descContent;

    const simBG = document.getElementById("sim-thumbnail-bg");
    const lotBG = document.getElementById("lot-thumbnail-bg");
    switch (returnExistenceState(simShort)) {

        case "OFFLINE":
            simBG.classList.add("thumbnail-offline");
            lotBG.classList.add("thumbnail-offline");
            break;

        default:
            simBG.classList.remove("thumbnail-offline");
            lotBG.classList.remove("thumbnail-offline");
            break;
            
    }
}