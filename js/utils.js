// Neighborhood id's are wonky, return correct from id
function returnNeighborhood (nhood_id) {

    if (nhood_id == 0) return "Unknown";

    if (nhood_id == 1) {
        return NEIGHBORHOOD[0];
    }
    else {
        return NEIGHBORHOOD[nhood_id - 34];
    }
}

// Reset sim thumbnail styles
function resetSimThumbnailStyles () {

    GUI_SIM_LABEL.className = "";
    GUI_SIM_VIEW.className = "";
    GUI_SIM_THUMBNAIL.className = "";

    GUI_SIM_LABEL.classList.add("outset-title", "sim-title");
    GUI_SIM_VIEW.classList.add("div-sim-view", "block-background");
}

// Parse sim bio for style markers
function returnStyleMarker (styleString) {

    let startIndex = styleString.indexOf("sifi:") + 5;
    let endIndex = 0;

    for (let i = startIndex; i < styleString.length; i++) {
        
        if (styleString[i] == ":") {

            endIndex = i;
            break;
        }
    }
    let styleText = styleString.substring(startIndex, endIndex);
    return styleText.split(",");
}

// Easter Eggs
function doEasterEggs (eggID, value) {

    switch (eggID){

        // Sim's panel
        case 0:
            const simStyles = returnStyleMarker(value.description);
            resetSimThumbnailStyles();

            var title = document.getElementById("sim-title");
            var block = document.getElementById("sim-viewer");
            var image = document.getElementById("sim-thumbnail-image");

            if (value.name == "Reaganomics Lamborghini") {

                title.classList.add("rainbow-title");
                image.classList.add("rainbow-image");

                block.classList.add("golden-block");
                block.classList.remove("block-background");
            }
            else if (simStyles.includes("bp")) {

                block.classList.remove("block-background");
                block.classList.add("pink-block");
            }
            else if (simStyles.includes("bsg")) {

                block.classList.remove("block-background");
                block.classList.add("seagreen-block");
            }
            else if (simStyles.includes("bdg")) {

                block.classList.remove("block-background");
                block.classList.add("dark-block");
            }
            else if (simStyles.includes("br")) {

                block.classList.remove("block-background");
                block.classList.add("red-block");
            }
            else if (simStyles.includes("bw")) {

                block.classList.remove("block-background");
                block.classList.add("bone-block");
            }
            else if (simStyles.includes("bpr")) {

                block.classList.remove("block-background");
                block.classList.add("purple-block");
            }

            break;

        // Rea sim head
        case 1:
            var image = document.getElementById("sim-thumbnail-image");
            if (value.name == "Reaganomics Lamborghini"){
        
                image.src = "./images/sim-faces/simface-rea.png?v0.2.1a";
            }
            break;

        default:
            break;
    }
}

// Format between human readable and freeso neighborhood_id format
function returnFixedNeighborhoodID (format, id) {

    if (format == "to_freeso") {

        if (id == 0) return 1;
        return id + 34;
    }
    else if (format == "to_normal") {

        if (id == 1) return 0;
        return id - 34;
    }
}