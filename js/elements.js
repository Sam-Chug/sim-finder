// Style change on mouse movement over text
function styleMouseOverChange (selectedIndex, movement) {

    if (movement == "in") {

        selectedIndex.classList.add("mouse-over-list-index");
    }
    else if (movement == "out") {

        selectedIndex.classList.remove("mouse-over-list-index");
    }
}

// Write info to lot thumbnail box
async function writeLotThumbnail (lotShort, lotLong, existence, simLong) {

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
            writeToLabel("Working - " + JOB_STRINGS[simLong.current_job], "", "thumbnail-title");
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
    console.log("Pinged: " + "https://api.freeso.org/userapi/city/1/" + lotLong.location + ".png");

    const lotDesc = document.createElement("p");
    const lotOwnerTitle = document.createElement("p");
    const lotRoommateTitle = document.createElement("p");
    const lotOwner = document.createElement("p");
    const lotRoommates = document.createElement("p");

    lotDesc.textContent = "Category: " + LOT_CATEGORY[lotLong.category] + "\n" + 
                          "Established: " + returnDateStringFromUNIX(lotLong.created_date) + "\n" + 
                          "Neighborhood: " + returnNeighborhood(lotLong.neighborhood_id) + "\n" +
                          "Admit Mode: " + ADMIT_MODES[lotLong.admit_mode] + "\n" + 
                          SKILL_MODES[lotLong.skill_mode] + "\n";

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

// Build sim thumbnail
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

// Write sim information
function writeGreaterSimContext (simShort, simLong, existence) {

    updateBookmarkButton(simLong.avatar_id);
    writeSimThumbnail(simShort, simLong);

    const simView = document.getElementById("sim-viewer");
    simView.style.display = "flex";

    switch (existence){

        case "LANDED":
            var selShortLot = returnShortLotFromLocation(simShort.location);
            var selLongLot = returnLongLotFromLocation(simShort.location);
            writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
            break;

        case "WORKING":
            var selShortLot = {name:"WORKING"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        case "FLOATING":
            var selShortLot = {name:"FLOATING"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        case "LANDED_HIDDEN":
            var selLongLot = returnLongLotOfRoommate(simShort.avatar_id);
            var selShortLot = returnShortLotFromLocation(selLongLot.location);
            writeSimsInLot(selLongLot, selShortLot.avatars_in_lot);
            break;

        case "HIDDEN":
            var selShortLot = {name:"HIDDEN"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        case "OFFLINE":
            var selShortLot = {name:"OFFLINE"};
            var simsInLot = document.getElementById("show-sims-in-lot");
            simsInLot.style.display = "none";
            break;

        default:
            break;
    }
    writeLotThumbnail(selShortLot, selLongLot, existence, simLong);
}

// Write list of sims in selected lot
function writeSimsInLot (selLot, population) {

    var simsInLot = document.getElementById("show-sims-in-lot");
    simsInLot.style.display = "flex";

    const simList = document.getElementById("lot-sims-list");
    const roommateList = document.getElementById("lot-roommates-list");
    
    simList.textContent = "";
    roommateList.textContent = "";

    // Write sims
    const simsHeader = document.createElement("p");
    simsHeader.classList.add("column-header");
    simsHeader.textContent = "Sims:\n";

    const simsContent = document.createElement("p");
    var simListText = "";
    var simTally = 0;

    for (let i = 0; i < simShortList.avatars.length; i++) {

        if (selLot.roommates.includes(simShortList.avatars[i].avatar_id)) continue;

        if (simShortList.avatars[i].location == selLot.location) {

            simListText += simShortList.avatars[i].name + "\n";
            simTally++;
        }
    }
    // Write roommates
    const roommatesHeader = document.createElement("p");
    roommatesHeader.classList.add("column-header");
    roommatesHeader.textContent = "Roommates:\n";

    const roommatesContent = document.createElement("p");
    var roomListText = "";
    for (i = 0; i < simShortList.avatars.length; i++) {

        if (selLot.roommates.includes(simShortList.avatars[i].avatar_id)) {

            if (simShortList.avatars[i].privacy_mode == 1) {

                roomListText += simShortList.avatars[i].name + " (Maybe)\n"
            }
            else if (simShortList.avatars[i].location == selLot.location) {

                roomListText += simShortList.avatars[i].name + "\n"
                simTally++;
            }
        }
    }
    if (population - simTally > 0) {

        simListText += "\nAnd " + (population - simTally) + " More Hidden Sim(s)"
    }
    simsContent.textContent = simListText;
    simList.appendChild(simsHeader);
    simList.appendChild(simsContent);

    roommatesContent.textContent = roomListText;
    roommateList.appendChild(roommatesHeader);
    roommateList.appendChild(roommatesContent);
}

// Write market data to market watch element
function writeMarketWatch (marketObj) {

    const marketBreakdown = document.getElementById("market-breakdown");
    var breakdownText = "$" + (marketObj.moneyPerHourJob + marketObj.moneyPerHourSMO).toLocaleString("en-US") + " Generated Per Hour\n\n" + 
                        "SMO Total $/Hr: $" + marketObj.moneyPerHourSMO.toLocaleString("en-US") + "\n" + 
                        marketObj.simsSMO + " Sims at " + marketObj.moneyLots.length + " Money Lots\n\n" +
                        "Job Total $/Hr: $" + marketObj.moneyPerHourJob.toLocaleString("en-US") + "\n" +
                        marketObj.simsWorking + " Sims at " + returnJobsOpen().length + " Job(s)\n\n\n" + 
                        "(Values Heavily Estimated)";

    marketBreakdown.textContent = breakdownText;

    const marketHotspots = document.getElementById("market-hotspots");
    var hotspotText = "Top Money Lots: \n\n";

    marketObj.moneyLots.sort(({lotMoney:a}, {lotMoney:b}) => b - a);

    for ( let i = 0; i < 3 && i < marketObj.moneyLots.length; i++) {

        hotspotText += (i + 1) + ". " + marketObj.moneyLots[i].lotObj.name + "\n" + 
                       " - $" + (marketObj.moneyLots[i].lotMoney).toLocaleString("en-US") + " $/Hr Total\n\n";
    }
    hotspotText = hotspotText.slice(0, -1);
    marketHotspots.textContent = hotspotText;
}