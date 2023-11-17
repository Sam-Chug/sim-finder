class SimData{
    constructor() {

        this.simShortList;
        this.simLongList;

        this.lotShortList;
        this.lotLongList;
    
        this.topLotShort;
        this.topLotLong;

        this.bookmarkList;
    }
};

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

        this.findMoneyLots()
        this.calculateSMOMoney();
        this.calculateJobMoney();
    }

    findMoneyLots() {

        // Get online money lots
        this.lotShort.forEach(function(lot) {
        
            if (lot.category == 1) {
    
                lotObj = new MoneyLot(lot);
                this.moneyLots.push(lotObj);
            } 
        });
    }

    // Get current SMO money per hour
    // Get number of sims at money lots
    calculateSMOMoney() {

        // For all online sims
        for (let i = 0; i < this.simShort.length; i++) {

            // For online money lots
            for (let j = 0; j < this.moneyLots.length; j++) {
    
                // If sim is at a money lot
                if (this.simShort[i].location == this.moneyLots[j].lotObj.location) {
    
                    // Estimate sim's skill count by averaging their total lock count across all 6 skills
                    var lockCount = Math.min(20 + Math.floor(simDayAge(simLong[i].date) / 7), 120);
                    var lockAvg = lockCount / 6;
    
                    // Equation courtesy of Gurra's SMO Spreadsheet (link)
                    // Assumes given SMO is at 150% payout
                    let payout = SMO_AVERAGE_BASE_PAYOUT * (1 + 0.2 * lockAvg) * (1 + 0.134 * Math.min(marketObj.moneyLots[j].lotObj.avatars_in_lot, 9)) * 150 / 100;
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
        var lotLocations = [];
        this.lotShort.forEach(function(lot) {
            lotLocations.push(lot.location);
        });

        // Check if sim working
        const jobsOpen = returnJobsOpen();

        // For all sims
        for (let i = 0; i < this.simShort.length; i++) {

            // For currently active jobs
            for (let j = 0; j < jobsOpen.length; j++) {

                // Sim has job
                let hasJob = this.simLong[i].current_job == jobsOpen[j];

                // Sim location not in lot location list (probably working)
                let locationNotInLotList = !lotLocations.includes(this.simShort[i].location);

                // Sim is at work
                let isWorking = returnExistenceState(this.simShort[i]) == "WORKING";

                // Calculate sim job payout per hour
                if (hasJob && locationNotInLotList && isWorking) {

                    // Sim's job performance is based on 0 -> 1 year age, scaled into job payout
                    // These estimates are bound to be wonky, but no way to know job level for sure
                    var payPercent = Math.min(simDayAge(this.simLong[i].date), 365) / 365;
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