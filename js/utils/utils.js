simUtils = function() {

    function returnSimAge(joinDate) {

        const now = Math.round(Date.now() / 1000);
        return Math.round((now - joinDate) / 86400);
    }

    return {
        returnSimAge: returnSimAge
    }
}();

guiUtils = function() {

    function buildListHeader(columnLeftText, columnRightText) {

        let listHead = document.createElement("div");
        listHead.id = "sim-list-node";

        let leftHead = document.createElement("p");
        leftHead.textContent = columnLeftText;

        let rightHead = document.createElement("p");
        rightHead.textContent = columnRightText;

        listHead.appendChild(leftHead);
        listHead.appendChild(rightHead);

        return listHead;
    }

    function populateSimList(simList) {

        GUI_ONLINESIMS.innerHTML = "";
        GUI_ONLINESIMS.appendChild(buildListHeader("Name", "Age"));

        for (let i = 0; i < simList.length; i++) {

            let simNode = document.createElement("div");
            simNode.id = "sim-list-node";

            let simName = document.createElement("p");
            simName.textContent = simList[i].name;

            let simAge = document.createElement("p");
            simAge.textContent = `${simUtils.returnSimAge(simList[i].date)} Days`;

            simNode.appendChild(simName);
            simNode.appendChild(simAge);
            GUI_ONLINESIMS.appendChild(simNode);
        }
    }

    function populateLotList(lotList) {

        GUI_ONLINELOTS.textContent = "";
        GUI_ONLINELOTS.appendChild(buildTableHead("Name", "Population"));
        
        for (i = 0; i < lotList.length; i++) {
        
            let lotNode = document.createElement("div");
            lotNode.id = "sim-list-node";

            let lotName = document.createElement("p");
            lotName.textContent = lotList[i].name;

            let lotPop = document.createElement("p");
            lotPop.textContent = lotList[i].avatars_in_lot + " sims";

            lotNode.appendChild(lotName);
            lotNode.appendChild(lotPop);
            GUI_ONLINELOTS.appendChild(lotNode);
        }
    }

    function writeToLabel(contentString, content, target) {

        const location = document.getElementById(target);
        const labelText = contentString + content;
        
        location.textContent = labelText;
    }

    return {
        buildListHeader: buildListHeader,
        populateSimList: populateSimList,
        populateLotList: populateLotList,
        writeToLabel: writeToLabel
    }
}();

apiUtils = function() {

    async function getAPIData (apiLink) {

        let obj;
        const res = await fetch(apiLink);
        obj = await res.json();
    
        console.log("Pinged: " + apiLink);
    
        return obj;
    }

    //#region API url building
    function buildLongSimLink (simList) {

        var simIdString = "https://api.freeso.org/userapi/avatars?ids=";
        for (i = 0; i < simList.avatars.length; i++) {
    
            simIdString += simList.avatars[i].avatar_id + ",";
        }
    
        simIdString = simIdString.slice(0, -1);
        return simIdString;
    }

    function buildLongLotLink (lotList) {

        var lotIDString = "https://api.freeso.org/userapi/lots?ids=";
        for (i = 0; i < lotList.lots.length; i++) {
    
            lotIDString += lotList.lots[i].lot_id + ",";
        }
    
        lotIDString = lotIDString.slice(0, -1);
        return lotIDString;
    }
    //#endregion

    return {
        getAPIData: getAPIData,
        buildLongSimLink: buildLongSimLink,
        buildLongLotLink: buildLongLotLink
    }
}();