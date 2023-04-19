// load the scripts
// This is probably ass
const SCRIPTS = [

    "bookmarks",
    "definitions",
    "dynamic-css",
    "elements",
    "filters",
    "utils",
];

// Load scripts
for (let i = 0; i < SCRIPTS.length; i++) {

    let scriptElement = document.createElement("script");
    scriptElement.setAttribute("src", "./js/scripts/" + SCRIPTS[i] + ".js");

    scriptElement.addEventListener("load", () => console.log(SCRIPTS[i] + ".js loaded"));
    document.body.appendChild(scriptElement);
}

// Load main
let scriptElement = document.createElement("script");
scriptElement.setAttribute("src", "./js/scripts/main.js");

scriptElement.addEventListener("load", function (){
    console.log("main.js loaded"); 
    getOnline();
    });

document.body.appendChild(scriptElement);