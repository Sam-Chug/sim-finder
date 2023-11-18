var selSimID;

// When bookmark button clicked
async function checkBookmark() {

    const checkBox = document.getElementById("bookmark-checkbox");

    if (checkBox.checked) {

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