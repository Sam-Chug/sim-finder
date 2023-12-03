class SimData{
    constructor() {

        //#region Sim/Lot data
        // Live data from online sims
        this.simShortList;

        // Cached data from all sims, holds data not necessary for immediate live play (mostly)
        this.simLongList;

        // Live data from online lots
        this.lotShortList;

        // Cached data from all lots, holds data not necessary for immediate live play (mostly)
        this.lotLongList;
        //#endregion
        
        // Sim bookmark list
        // List of sim's cached long data grabbed from api upon website opening
        this.bookmarkList;

        // Market data
        // Contains current market information
        this.marketData;

        // Keep track of selected sim ID for bookmarking
        this.selSimID;

        // Current filter
        this.simFilter = "REMOVE";
        this.lotFilter = "REMOVE";

        // Keep track of how entities are sorted
        this.simSort = "age";
        this.lotSort = "pop";

        // Keep track of API pings
        this.apiStats = new APIStats();

        // User settings
        this.userSetting = new UserSetting();
    }
};

class APIStats{
    constructor() {

        this.totalCalls = 0;
        this.timeOpened = Date.now();

        // For every n calls, print API call stats in console
        this.debugIncrement = 10;
    }

    callsPerMinute() {

        return this.totalCalls / this.minutesOpen();
    }

    minutesOpen() {

        return (Date.now() - this.timeOpened) / 60000;
    }

    incrementAPICalls() {

        this.totalCalls++;

        // If hit debug increment, print API stats to console
        if (this.totalCalls % this.debugIncrement == 0) this.printAPIStats();
    }

    printAPIStats() {

        console.log("%cAPI Ping Stats", "color: white; background-color: darkblue");
        console.log(`Total API calls: ${this.totalCalls}`);
        console.log(`Time since page open: ${Math.round(this.minutesOpen())} minute${(Math.round(this.minutesOpen()) == 1) ? "" : "s"}`);
        console.log(`Calls/minute: ${Math.round(this.callsPerMinute())}`);
    }
}

class UserSetting{
    constructor(load) {

        this.colorMode = (load === undefined || load.colorMode === undefined) ? "lightmode" : load.colorMode;
    }
}

class StyleObject{
    constructor(simData) {

        // Check if data is sim or lot
        this.isSim = ("avatar_id" in simData);

        this.usesStyle;
        this.usesShorthand;

        // Sim only
        this.avatarHead;
        if (this.isSim) this.setSimHead(simData);

        // Style list
        this.styles = {
            head: "",
            body: "",
            label: "",
            block: "",
            inset: "",
            bookmarkLabel: ""
        }

        // Check if sim uses style
        this.checkIfUsesStyle(simData.description);
        if (!this.usesStyle) return;
        
        // Build object of sim styles
        this.handleSimStyles(simData.description);
    }

    setSimHead(simData) {

        // If bear sim, set to bear
        if (simData.name.toLowerCase().includes("bear")) this.avatarHead = CUSTOM_STYLE_SIMHEADS.bear;
        else if (simData.gender == 0) this.avatarHead = CUSTOM_STYLE_SIMHEADS.male;
        else if (simData.gender == 1) this.avatarHead = CUSTOM_STYLE_SIMHEADS.female;
    }

    checkIfUsesStyle(simDescription) {

        // Get if uses style
        if (simDescription.includes("sifi:")) this.usesStyle = true;
        // New shorthand
        if (simDescription.includes("sf:")) {

            this.usesStyle = true;
            this.usesShorthand = true;
        }
    }

    handleSimStyles(simDescription) {

        let styleList = this.returnStyleList(simDescription);
        this.getSelectedStyles(styleList);
    }

    // Find styles from list
    getSelectedStyles(styleList) {

        for (let i = 0; i < styleList.length; i++) {

            // Block styles
            if (styleList[i].charAt(0) == "b") {

                // Check if block style list contains requested style
                if (!CUSTOM_STYLE_BLOCK.hasOwnProperty(styleList[i])) continue;
                this.styles.block = CUSTOM_STYLE_BLOCK[styleList[i]].cssClass;
                this.styles.bookmarkLabel = CUSTOM_STYLE_BLOCK[styleList[i]].bookmarkLabelClass;
            }
            // Label styles
            else if (styleList[i].charAt(0) == "l") {

                // Check if block style list contains requested style
                if (!CUSTOM_STYLE_LABEL.hasOwnProperty(styleList[i])) continue;
                this.styles.label = CUSTOM_STYLE_LABEL[styleList[i]].cssClass;
            }
            else if (styleList[i].charAt(0) == "i") {

                // Check if block style list contains requested style
                if (!CUSTOM_STYLE_INSET.hasOwnProperty(styleList[i])) continue;
                this.styles.inset = CUSTOM_STYLE_INSET[styleList[i]].cssClass;
            }
        }
    }

    returnStyleList(simDescription) {

        let indexShift = (this.usesShorthand) ? 3 : 5;
        let styleIndicator = (this.usesShorthand) ? "sf:" : "sifi:";

        let startIndex = simDescription.indexOf(styleIndicator) + indexShift;
        let endIndex = 0;

        for (let i = startIndex; i < simDescription.length; i++) {

            if (simDescription[i] == ":") {

                endIndex = i;
                break;
            }
        }
        let styleList = simDescription.substring(startIndex, endIndex);
        return styleList.split(",");
    }
}

class MarketObject{
    constructor(simLong, simShort, lotShort) {

        this.moneyPerHourSMO = 0;
        this.moneyPerHourJob = 0;

        this.moneyLots = [];
        
        this.simsSMO = 0;
        this.simsWorking = 0;

        this.simLong = simLong;
        this.simShort = simShort;
        this.lotShort = lotShort;

        this.findMoneyLots();
        this.calculateSMOMoney();
        this.calculateJobMoney();
    }

    findMoneyLots() {

        // Get online money lots
        for (let i = 0; i < this.lotShort.lots.length; i++) {

            if (this.lotShort.lots[i].category == 1) {

                let lotObj = new MoneyLot(this.lotShort.lots[i]);
                this.moneyLots.push(lotObj);
            }
        }
    }

    // Get current SMO money per hour
    // Get number of sims at money lots
    calculateSMOMoney() {
        
        // For all online sims
        for (let i = 0; i < this.simShort.avatars.length; i++) {
            
            // For online money lots
            for (let j = 0; j < this.moneyLots.length; j++) {
                
                // If sim is at a money lot
                if (this.simShort.avatars[i].location == this.moneyLots[j].lotObj.location) {
    
                    // Estimate sim's skill count by averaging their total lock count across all 6 skills
                    let lockCount = Math.min(20 + Math.floor(simUtils.returnSimAge(this.simLong.avatars[i].date) / 7), 120);
                    let lockAvg = lockCount / 6;
    
                    // Equation courtesy of Gurra's SMO Spreadsheet (link)
                    // Assumes given SMO is at 150% payout
                    let payout = SMO_AVERAGE_BASE_PAYOUT * (1 + 0.2 * lockAvg) * (1 + (2 / 15) * Math.min(this.moneyLots[j].lotObj.avatars_in_lot, 9)) * 150 / 100;
                    payout = Math.floor((payout / SMO_AVERAGE_COMPLETION_TIME) * 3600)
    
                    // Tally SMO money per hour, sims doing SMOs, and smo money per hour per money lot
                    this.moneyPerHourSMO += payout;
                    this.simsSMO++;
                    this.moneyLots[j].lotMoney += payout;

                    break;
                }
            }
        }
    }

    calculateJobMoney() {

        // Get list of lot locations
        let lotLocations = [];
        for (let i = 0; i < this.lotShort.lots.length; i++) lotLocations.push(this.lotShort.lots[i].location);

        // Check if sim working
        let jobsOpen = simUtils.returnJobsOpen();

        // For all sims
        for (let i = 0; i < this.simShort.avatars.length; i++) {

            // For currently active jobs
            for (let j = 0; j < jobsOpen.length; j++) {

                // Sim has job
                let hasJob = this.simLong.avatars[i].current_job == jobsOpen[j];

                // Sim location not in lot location list (probably working)
                let locationNotInLotList = !lotLocations.includes(this.simShort.avatars[i].location);

                // Sim is at work
                let isWorking = simUtils.returnExistenceState(this.simShort.avatars[i]) == "WORKING";

                // Calculate sim job payout per hour
                if (hasJob && locationNotInLotList && isWorking) {

                    // Sim's job performance is based on 0 -> 1 year age, scaled into job payout
                    // These estimates are bound to be wonky, but no way to know job level for sure
                    let payPercent = Math.min(simUtils.returnSimAge(this.simLong.avatars[i].date), 365) / 365;
                    this.moneyPerHourJob += Math.floor(payPercent * JOB_AVERAGE_PAY_SECOND[jobsOpen[j]] * 3600) + 1500;
                    this.simsWorking++;

                    break;
                }
            }
        }
    }
}

class MoneyLot{
    constructor(lot) {

        this.lotObj = lot;
        this.lotMoney = 0;
    }
}