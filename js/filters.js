// Filter array and send to list
function writeFilterToTable (type, filter) {

    if (type == "sim") {

        if (filter == "REMOVE") {

            createSimsTable(simLongList.avatars);
        }
        else {

            createSimsTable(returnFilterSimList(filter));
        }
        
    } 
    else if(type == "lot") {

        if (filter == "REMOVE") {

            createLotsTable(lotShortList.lots);
        }
        else {
            
            createLotsTable(returnFilterLotList(filter));
        }
    }
}

function returnFilterSimList (filter) {

    const longList = new Array();

    switch (filter) {

        case "JOB_DINER":
            for (i = 0; i < simLongList.avatars.length; i++) {
                
                if (simLongList.avatars[i].current_job == 2) {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "JOB_CLUB":
            for (i = 0; i < simLongList.avatars.length; i++) {
            
                if (simLongList.avatars[i].current_job > 3) {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "JOB_ROBOT":
            for (i = 0; i < simLongList.avatars.length; i++) {
            
                if (simLongList.avatars[i].current_job == 1) {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "LANDED":
            for (let i = 0; i < simShortList.avatars.length; i++) {

                //debugger;

                if (returnExistenceState(simShortList.avatars[i]) == "LANDED") {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "SHOWN":
            for (i = 0; i < simShortList.avatars.length; i++) {
            
                if (simShortList.avatars[i].privacy_mode == 0) {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "HIDDEN":
            for (let i = 0; i < simShortList.avatars.length; i++) {
            
                if (returnExistenceState(simShortList.avatars[i]) == "HIDDEN" ||
                    returnExistenceState(simShortList.avatars[i]) == "LANDED_HIDDEN") {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "FOUND":
            for (let i = 0; i < simShortList.avatars.length; i++) {
            
                if (returnExistenceState(simShortList.avatars[i]) == "LANDED_HIDDEN") {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        case "FLOATING":
            for (let i = 0; i < simShortList.avatars.length; i++) {
            
                if (returnExistenceState(simShortList.avatars[i]) == "FLOATING") {

                    longList.push(simLongList.avatars[i]);
                }
            }
            break;

        default:
            break;
    }
    return longList;
}

function returnFilterLotList (filter) {

    const shortList = new Array();

    for (let i = 0; i < lotShortList.lots.length; i++) {

        if (lotShortList.lots[i].category == LOT_SEARCH_ID[filter]) {

            shortList.push(lotShortList.lots[i]);
        }
    }
    return shortList;
}
  