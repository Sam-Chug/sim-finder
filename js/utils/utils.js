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

    //#region Build sim/lot lists
    function buildListHeader(columnLeftText, columnRightText) {

        let listHead = document.createElement("div");
        listHead.id = "sim-list-node";
        listHead.classList.add("sim-list-title");

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
    //#endregion

    function writeToLabel(contentString, content, target) {

        const location = document.getElementById(target);
        const labelText = contentString + content;
        
        location.textContent = labelText;
    }

    //#region Filter Icons
    function fillButtonGraphics () {

        const lotFilterArray = document.getElementById("lot-filter-array");
        const simFilterArray = document.getElementById("sim-filter-array");
    
        for (let i = 0; i < 12; i++) {
    
            let button = document.createElement("button");
    
            var x = (i % 4) * 71;
            var y = Math.floor(i / 4) * 71;
            button.style.background = "url(./images/filter-spritesheets/lot-filter.png) " + -x + "px " + -y + "px";
    
            addFilterClasses(button, "lot");
            lotFilterArray.appendChild(button);
        }
        for (let i = 0; i < 9; i++) {
    
            let button = document.createElement("button");
    
            var x = (i % 4) * 71;
            var y = Math.floor(i / 4) * 71;
            button.style.background = "url(./images/filter-spritesheets/sim-filter.png) " + -x + "px " + -y + "px";
    
            addFilterClasses(button, "sim");
            simFilterArray.appendChild(button);
        }
    }

    function addFilterClasses (element, type) {

        element.classList.add("filter-button");
        if (type == "sim") element.id = "sim-filter-button";
        if (type == "lot") element.id = "lot-filter-button";
    
        element.addEventListener("click",
        function() {
    
        filterButtonClick(this, type);
        });
        element.addEventListener("mouseover",
        function() {
    
            mouseOverFilterChange(this, "in", type);
    
            const tooltip = document.createElement("span");
            tooltip.classList.add("tooltip");
            
            if (type == "sim") tooltip.textContent = SIM_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
            if (type == "lot") tooltip.textContent = LOT_FILTER_TOOLTIP[Array.from(this.parentElement.children).indexOf(this)];
    
            this.appendChild(tooltip);
        });
        element.addEventListener("mouseout",
        function(){
    
            mouseOverFilterChange(this, "out", type);
    
            this.removeChild(this.children[0]);
        });
    }

    function mouseOverFilterChange (button, action, type) {

        const index = Array.from(button.parentElement.children).indexOf(button);
    
        var x = (index % 4) * 71;
        var y = Math.floor(index / 4) * 71;
    
        if (type == "lot") {
    
            if (button.classList.contains("lot-filter-active")) return;
    
            if (action == "in") {
            
                button.style.background = "url(./images/filter-spritesheets/lot-filter-hover.png) " + -x + "px " + -y + "px";
            }
            else if (action == "out") {
    
                button.style.background = "url(./images/filter-spritesheets/lot-filter.png) " + -x + "px " + -y + "px";
            }
        }
        else if (type == "sim") {
    
            if (button.classList.contains("sim-filter-active")) return;
    
            if (action == "in") {
            
                button.style.background = "url(./images/filter-spritesheets/sim-filter-hover.png) " + -x + "px " + -y + "px";
            }
            else if (action == "out") {
    
                button.style.background = "url(./images/filter-spritesheets/sim-filter.png) " + -x + "px " + -y + "px";
            }
        }
    }

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
                button.style.background = "url(./images/filter-spritesheets/lot-filter.png) " + -x + "px " + -y + "px";
        
                count++;
            }
            if (sameButton) {
                writeFilterToTable("lot", "REMOVE");
            }
            else {
                var x = (index % 4) * 71;
                var y = Math.floor(index / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/lot-filter-selected.png) " + -x + "px " + -y + "px";
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
                button.style.background = "url(./images/filter-spritesheets/sim-filter.png) " + -x + "px " + -y + "px";
        
                count++;
            }
            if (sameButton) {
    
                writeFilterToTable("sim", "REMOVE");
            }
            else {
    
                var x = (index % 4) * 71;
                var y = Math.floor(index / 4) * 71;
                button.style.background = "url(./images/filter-spritesheets/sim-filter-selected.png) " + -x + "px " + -y + "px";
                button.classList.add("sim-filter-active");
                writeFilterToTable("sim", SIM_SEARCH[index]);
            }
            return;
        }
    }
    //#endregion

    return {
        buildListHeader: buildListHeader,
        populateSimList: populateSimList,
        populateLotList: populateLotList,
        writeToLabel: writeToLabel,
        fillButtonGraphics: fillButtonGraphics
    }
}();

drawUtils = function() {

    function generateFilterIcons() {

        // for amount of filter icons
        // generate normal, hovered, selected sprite canvas
    }

    function buildFilterCanvas() {



    }

    return {
        generateFilterIcons: generateFilterIcons,
        buildFilterCanvas: buildFilterCanvas
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