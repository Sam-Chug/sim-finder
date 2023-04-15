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
    const tableHead = buildTableHead("Name", "Age");
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for (i = 0; i < simList.avatars.length; i++) {

        var newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdAge = document.createElement("td");

        tdName.textContent = simList.avatars[i].name;
        tdAge.textContent = simDayAge(simList.avatars[i].date) + " days";

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
    const tableHead = buildTableHead("Name", "Population");
    target.appendChild(tableHead);

    const tableBody = document.createElement("tbody");
    for (i = 0; i < lotList.lots.length; i++) {

        var newRow = document.createElement("tr");
        const tdName = document.createElement("td");
        const tdPop = document.createElement("td");

        tdName.textContent = lotList.lots[i].name;
        tdPop.textContent = lotList.lots[i].avatars_in_lot + " sims";

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
async function writeLotThumbnail (lotShort, lotLong) {

    const descTarget = document.getElementById("thumbnail-desc-content");
    const imageTarget = document.getElementById("thumbnail-image");

    if (lotShort.name == "FLOATING") {

        descTarget.textContent = "Category: Air\n" + 
                                 "Established: Dawn of Time\n" + 
                                 "Admit Mode: Admit All";

        imageTarget.src = "./images/unknown.png";
        writeToLabel("Floating", "", "thumbnail-title");
        return;
    }
    else if (lotShort.name == "HIDDEN") {

        descTarget.textContent = "Hidden";
        imageTarget.src = "./images/unknown.png";
        writeToLabel("Hidden", "", "thumbnail-title");
        return;
    }

    writeToLabel(lotShort.name, "", "thumbnail-title");
    descTarget.textContent = "";
    imageTarget.src = "https://api.freeso.org/userapi/city/1/" + lotShort.location + ".png";

    const lotDesc = document.createElement("p");
    const lotOwnerTitle = document.createElement("p");
    const lotRoommateTitle = document.createElement("p");
    const lotOwner = document.createElement("p");
    const lotRoommates = document.createElement("p");

    lotDesc.textContent = "Category: " + LOT_CATEGORY[lotShort.category] + "\n" + 
                          "Established: " + returnDateStringFromUNIX(lotLong.created_date) + "\n" + 
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

async function writeSimThumbnail (simShort, simLong) {

    writeToLabel(simShort.name, "", "sim-title")

    const imageTarget = document.getElementById("sim-thumbnail-image");
    if (simLong.gender == 0) {

        imageTarget.src = "./images/simface-m.png";
    }
    else if (simLong.gender == 1) {

        imageTarget.src = "./images/simface-f.png";
    }

    const bioTarget = document.getElementById("sim-bio");
    bioTarget.textContent = simLong.description;

    const descTarget = document.getElementById("sim-desc");
    var descContent = "Age: " + simDayAge(simLong.date) + " Days\n" + 
                      "ID: " + simShort.avatar_id + "\n" + 
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

    descContent += returnExistenceText(simShort);

    descTarget.textContent = descContent;
}