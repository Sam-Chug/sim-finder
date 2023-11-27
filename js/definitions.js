//#region Strings
const VERSION_STR = "v0.2.1a";

const SIM_ONLINE_URL = "https://api.freeso.org/userapi/avatars/online";
const LOTS_ONLINE_URL = "https://api.freeso.org/userapi/city/1/lots/online";

const JOB_TITLES = [
    "Unemployed",
    "Robot Factory",
    "Restaurant",
    "Dog Sitting",
    "Nightclub - DJ",
    "Nightclub - Dancer"
];

const JOB_STRINGS = [
    "Unemployed",
    "Factory",
    "Restaurant",
    "Unused",
    "Club",
    "Club"
]

const LOT_CATEGORY = [
    "None",
    "Money",
    "Offbeat",
    "Romance",
    "Service",
    "Shopping",
    "Skills",
    "Welcome",
    "Games",
    "Entertainment",
    "Residence",
    "Community"
];

const SKILL_MODES = [
    "Skill Gameplay Enabled",
    "Visitor Skills Disabled",
    "Skill Gameplay Disabled"
];

const ADMIT_MODES = [
    "Admit All",
    "Admit List",
    "Ban List",
    "Ban All",
    "Job Lot",
    "Community - Public",
    "Community - Private"
];

const BULLETIN_TYPE = [
    "Mayor Post",
    "System Message",
    "Community Post"
];

const NEIGHBORHOOD = [
    "Trio Lake", //1
    "The Sunrise Riviera", //35
    "Bhugarbha Triangle",
    "Journey's End",
    "Offbeat Islands",
    "Spiral Cove",
    "Riverblossom Ravines",
    "Dragon's Isle",
    "Strangetown",
    "Serpent's Spine",
    "Crescent Rock",
    "Specific Ocean",
    "Turtle Rock",
    "M.O.M.I. Mire",
    "Eagles Cliff",
    "Little Cornerstone",
    "Quack's Creek",
    "Corns Cobb",
    "Aurora Summit",
    "Lumberborough",
    "D.A.M.N.",
    "Fisherman's Front",
    "Clover Heights",
    "Calvin's Coast",
    "Tourist Trap",
    "Wright Shoals",
    "Sunset Canyon",
    "Remingtons Reef",
    "Meta Mesa",
    "Servo's Slice",
    "Volcanic Springs",
    "Sim Francisco",
    "Lunar Lake",
    "Multilevel Metropolis"
];

const SIM_SEARCH = [
    "JOB_DINER",
    "JOB_CLUB_DJ",
    "JOB_CLUB_DANCER",
    "JOB_ROBOT",
    "SHOWN",
    "HIDDEN",
    "FOUND",
    "UNFOUND",
    "FLOATING",
    "LANDED",
    "WORKING"
]

const SIM_FILTER_TOOLTIP = [
    "Job: Diner",
    "Job: Club - DJ",
    "Job: Club - Dancer",
    "Job: Robot Factory",
    "Privacy Mode: Off",
    "Privacy Mode: On",
    "Located Private Sims",
    "Unlocatable Sims",
    "Floating",
    "Landed at Lot",
    "Working"
]

const LOT_FILTER_TOOLTIP = [
    "Most Popular Places with the Welcome Category",
    "Most Popular Places with the Money Category",
    "Most Popular Places with the Skills Category",
    "Most Popular Places with the Services Category",
    "Most Popular Places with the Entertainment Category",
    "Most Popular Places with the Romance Category",
    "Most Popular Places with the Stores Category",
    "Most Popular Places with the Games Category",
    "Most Popular Places with the Offbeat Category",
    "Most Popular Places with the Residence Category",
    "Places with the Community Category",
    "Most Popular Places with the No Category"
]
//#endregion

//#region Misc
const STORAGE_KEY = "idList"; //simfinder-id-list
const STORAGE_KEY_OLD = "idList";
//#endregion

//#region Market Watch Constants
const SMO_AVERAGE_BASE_PAYOUT = 31.7;
const SMO_AVERAGE_COMPLETION_TIME = 242.25;
const JOB_AVERAGE_PAY_SECOND = [0, 2, 5.2, 0, 5.9, 5.9];

// Job start/end times
// Feathers shift-end by one hour to account for any late shifts
const CLUB_START_TIME = 19;
const CLUB_END_TIME = 4;

const DINER_START_TIME = 10;
const DINER_END_TIME = 19;

const FACTORY_START_TIME = 8;
const FACTORY_END_TIME = 17;

// Converts search id to lot category id
const LOT_SEARCH_ID = [7, 1, 6, 4, 9, 3, 5, 8, 2, 10, 11, 0];
const FILTER_ICON_CACHE = {
    sim_filters: [],
    lot_filters: [],
};
//#endregion

//#region DOM cache
const GUI_ONLINESIMS = document.getElementById('sims-table');
const GUI_ONLINELOTS = document.getElementById('lots-table');

const GUI_BOOKMARK_BUTTON = document.getElementById('bookmark-checkbox');
const GUI_BOOKMARK_LIST = document.getElementById("bookmark-table");

const GUI_SIM_VIEW = document.getElementById('sim-viewer');
const GUI_SIM_LABEL = document.getElementById('sim-title');
const GUI_SIM_THUMBNAIL = document.getElementById('sim-thumbnail-image');
const GUI_SIM_THUMBNAIL_BG = document.getElementById('sim-thumbnail-bg');
const GUI_SIM_BIO = document.getElementById('sim-bio');
const GUI_SIM_DESCRIPTION = document.getElementById('sim-desc');

const GUI_LOT_VIEW = document.getElementById("lot-viewer");
const GUI_LOT_THUMBNAIL = document.getElementById("lot-thumbnail-image");
const GUI_LOT_THUMBNAIL_BG = document.getElementById('lot-thumbnail-bg');
const GUI_LOT_LABEL = document.getElementById('thumbnail-title');
const GUI_LOT_DESCRIPTION = document.getElementById("thumbnail-desc-content");
const GUI_LOT_BIO = document.getElementById("thumbnail-lot-bio");

const GUI_SIMS_IN_LOT_LABEL = document.getElementById("lot-sims-in-lot-title");
const GUI_SIMS_IN_LOT = document.getElementById('show-sims-in-lot');
const GUI_SIMS_IN_LOT_SIMS = document.getElementById("lot-sims-list");
const GUI_SIMS_IN_LOT_ROOMMATES = document.getElementById("lot-roommates-list");

const GUI_MARKET_BREAKDOWN = document.getElementById("market-breakdown");
const GUI_MARKET_HOTSPOTS = document.getElementById("market-hotspots");

const GUI_SEARCH_SIM = document.getElementById("sim-search-input");
const GUI_SEARCH_SIM_PANEL = document.getElementById("sim-search-panel");
const GUI_SEARCH_LOT = document.getElementById("lot-search-input");
const GUI_SEARCH_LOT_PANEL = document.getElementById("lot-search-panel");

const GUI_FILTER_SIM_ICON = document.getElementById("sim-filter-min-image");
const GUI_FILTER_SIM_ICON_ARRAY = document.getElementById("sim-filter-array");
const GUI_FILTER_SIM_PANEL = document.getElementById("sim-filter-panel");
const GUI_FILTER_LOT_ICON = document.getElementById("lot-filter-min-image");
const GUI_FILTER_LOT_ICON_ARRAY = document.getElementById("lot-filter-array");
const GUI_FILTER_LOT_PANEL = document.getElementById("lot-filter-panel");

const SIDEBAR = document.getElementById("sidebar");
const SIDEBAR_EXPAND_BUTTON = document.getElementById("sidebar-button");
const SIDEBAR_CONTAINER = document.getElementById("sidebar-holder");
const SIDEBAR_INFO = document.getElementById("sidebar-site-info");
const SIDEBAR_JOB_DINER = document.getElementById("job-diner");
const SIDEBAR_JOB_CLUB = document.getElementById("job-club");
const SIDEBAR_JOB_FACTORY = document.getElementById("job-robot");
const SIDEBAR_CLOCK = document.getElementById("sim-clock");

const GUI_SORT_SIM_NAMES = document.getElementById("sort-sims-by-name");
const GUI_SORT_LOT_NAMES = document.getElementById("sort-lots-by-name");

const DOM_ROOT = document.querySelector(":root");
//#endregion

//#region Sim style lists
const CUSTOM_STYLE_SIMHEADS = {
    male: "./images/sim-faces/simface-m.png?v0.2.1a",
    female: "./images/sim-faces/simface-f.png?v0.2.1a",
    reagan: "./images/sim-faces/simface-rea.png?v0.2.1a",
    bear: "./images/sim-faces/simface-b.png?v0.2.1a"
};
const IMAGE_UNKNOWN_SIM = new Image().src = "./images/sim-faces/simface-u.png?v0.2.1a"
const CUSTOM_STYLE_REAGAN = "Reaganomics Lamborghini";
const CUSTOM_STYLE_BLOCK = {
    bp: {
        cssClass: `block-pink`
    },
    bsg: {
        cssClass: `block-seagreen`
    },
    bdg: {
        cssClass: `block-dark`
    },
    br: {
        cssClass: `block-red`
    },
    bw: {
        cssClass: `block-bone`
    },
    bpr: {
        cssClass: `block-purple`
    }
};

const CUSTOM_STYLE_LABEL = {
    lp: {
        cssClass: 'label-pink'
    },
    lsg: {
        cssClass: `label-seagreen`
    },
    ldg: {
        cssClass: `label-dark`
    },
    lr: {
        cssClass: `label-red`
    },
    lw: {
        cssClass: `label-bone`
    },
    lpr: {
        cssClass: `label-purple`
    }
};

const CUSTOM_STYLE_INSET = {
    ip: {
        cssClass: 'inset-pink'
    },
    isg: {
        cssClass: `inset-seagreen`
    },
    idg: {
        cssClass: `inset-dark`
    },
    ir: {
        cssClass: `inset-red`
    },
    iw: {
        cssClass: `inset-bone`
    },
    ipr: {
        cssClass: `inset-purple`
    }
};
//#endregion