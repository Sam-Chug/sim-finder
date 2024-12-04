// Current version
const VERSION_STR = "v0.2.4a";

// List of known staff sims
var STAFF_NAMES;

// Storage keys
const STORAGE_BOOKMARK_KEY = "idList";
const STORAGE_BOOKMARK_KEY_OLD = "idList";
const STORAGE_BOOKMARK_CACHE_KEY = "sf-idList-cache";
const SETTINGS_KEY = "simfinder-settings";

// Style vars and resources
const CONFETTI_SPAWN_COUNT = 128;
const MAX_STYLES = 10; // Maximum styles to loop through

const CONFETTI_DATA = {
    confetti: {
        src: "./images/confetti-sprites/confetti.png",
        sheetWidth: 3,
        sheetHeight: 2
    },
    staff: {
        src: "./images/confetti-sprites/staff-confetti.png",
        sheetWidth: 2,
        sheetHeight: 2
    },
    reagan: {
        src: "./images/confetti-sprites/reagan-confetti.png",
        sheetWidth: 2,
        sheetHeight: 2
    }
}

const CUSTOM_STYLE_REAGAN = "Reaganomics Lamborghini";

const CUSTOM_STYLE_SIMHEADS = {
    male: "./images/sim-faces/simface-m.png?v0.2.4a",
    female: "./images/sim-faces/simface-f.png?v0.2.4a",
    reagan: "./images/sim-faces/simface-rea.png?v0.2.4a",
    bear: "./images/sim-faces/simface-b.png?v0.2.4a"
};
const CUSTOM_STYLE_BLOCK = {
    bp: {
        cssClass: `block-pink`,
        bookmarkLabelClass: `bookmark-pink`
    },
    bsg: {
        cssClass: `block-seagreen`,
        bookmarkLabelClass: ``
    },
    bdg: {
        cssClass: `block-dark`,
        bookmarkLabelClass: ``
    },
    br: {
        cssClass: `block-red`,
        bookmarkLabelClass: ``
    },
    bw: {
        cssClass: `block-bone`,
        bookmarkLabelClass: `bookmark-bone`
    },
    bpr: {
        cssClass: `block-purple`,
        bookmarkLabelClass: ``
    },
    bo: {
        cssClass: `block-orange`,
        bookmarkLabelClass: `bookmark-orange`
    },
    by: {
        cssClass: `block-yellow`,
        bookmarkLabelClass: `bookmark-yellow`
    },
    bnb: {
        cssClass: `block-blue`,
        bookmarkLabelClass: ``
    },
    bs: {
        cssClass: `block-silver`,
        bookmarkLabelClass: ``
    },
    bm: {
        cssClass: `block-maroon`,
        bookmarkLabelClass: `bookmark-maroon`
    },
    bg: {
        cssClass: `block-darkgreen`,
        bookmarkLabelClass: `bookmark-green`
    },
    bcc: {
        cssClass: `block-candy-cane`,
        bookmarkLabelClass: `bookmark-candy-cane`
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
    },
    lo: {
        cssClass: `label-orange`
    },
    ly: {
        cssClass: `label-yellow`
    },
    lnb: {
        cssClass: `label-blue`
    },
    ls: {
        cssClass: `label-silver`
    },
    lm: {
        cssClass: `label-maroon`
    },
    lg: {
        cssClass: `label-darkgreen`
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
    },
    io: {
        cssClass: `inset-orange`
    },
    iy: {
        cssClass: `inset-yellow`
    },
    inb: {
        cssClass: `inset-blue`
    },
    is: {
        cssClass: `inset-silver`
    },
    im: {
        cssClass: `inset-maroon`
    },
    ig: {
        cssClass: `inset-darkgreen`
    }
};

// DOM cache
const GUI_BOOKMARK_BUTTON = document.getElementById('bookmark-checkbox');
const GUI_BOOKMARK_LIST = document.getElementById('bookmark-table');

const GUI_SIM_VIEW = document.getElementById('sim-viewer');
const GUI_SIM_LABEL = document.getElementById('sim-title');
const GUI_SIM_THUMBNAIL = document.getElementById('sim-thumbnail-image');
const GUI_SIM_THUMBNAIL_BG = document.getElementById('sim-thumbnail-bg');
const GUI_SIM_BIO = document.getElementById('sim-bio');
const GUI_SIM_DESCRIPTION = document.getElementById('sim-desc');
const GUI_SIM_HELP_BUTTON = document.getElementById('button-sim-help');

const GUI_SEARCH_SIM = document.getElementById('sim-search-input');
const GUI_SEARCH_SIM_BUTTON = document.getElementById('sim-search-button');
const GUI_SEARCH_SIM_PANEL = document.getElementById('sim-search-panel');

const SIDEBAR = document.getElementById('sidebar');
const SIDEBAR_EXPAND_BUTTON = document.getElementById('sidebar-button');
const SIDEBAR_CONTAINER = document.getElementById('sidebar-holder');
const SIDEBAR_INFO = document.getElementById('sidebar-site-info');

const GUI_EXPORT_BUTTON = document.getElementById('export-button');
const GUI_IMPORT_BUTTON = document.getElementById('import-button');

const GUI_BOOKMARK_LABEL = document.getElementById('bookmark-label');
const GUI_COLORMODE_BUTTON = document.getElementById('colormode-button');