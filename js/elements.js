// Do animation for expanding/retracting sidebar window
// This is probably stupid but i dont know any better
function expandSidebar() {

    const sidebar = document.getElementById("sidebar");
    const button = document.getElementById("sidebar-button");
    const sidebarHolder = document.getElementById("sidebar-holder");

    if (!sidebar.classList.contains("animate-sidebar")) {

        sidebar.classList.remove("animate-sidebar-reverse");
        button.classList.remove("animate-sidebar-button-reverse");
        sidebarHolder.classList.remove("animate-sidebar-holder-reverse");

        sidebarHolder.classList.add("animate-sidebar-holder");
        sidebar.classList.add("animate-sidebar");
        button.classList.add("animate-sidebar-button");

        toggleSidebarElements("show");
    }
    else {

        sidebar.classList.remove("animate-sidebar");
        button.classList.remove("animate-sidebar-button");
        sidebarHolder.classList.remove("animate-sidebar-holder");

        sidebarHolder.classList.add("animate-sidebar-holder-reverse");
        sidebar.classList.add("animate-sidebar-reverse");
        button.classList.add("animate-sidebar-button-reverse");

        toggleSidebarElements("hide");
    }
}

// Hide sidebar elements when sidebar retracted
function toggleSidebarElements(visibility) {

    const toggleElements = document.getElementsByClassName("sidebar-hide");

    if (visibility == "hide") {

        for (let i = 0; i < toggleElements.length; i++) {

            toggleElements[i].style.display = "none";
        }
    }
    else if (visibility == "show") {

        for (let i = 0; i < toggleElements.length; i++) {

            toggleElements[i].style.display = "block";
        }
    }
}

// Format to sim-time and write to clock
function writeSimClock() {

    const simClock = document.getElementById("sim-clock");
    const simTime = returnSimTime();
    var timeDenom = "AM";

    if (simTime[0] > 12) {

        timeDenom = "PM";
        simTime[0] %= 12;
    }
    if (simTime[0] == 0) {

        simTime[0] = 12;
    }
    if (simTime[1] < 10) {
        simTime[1] = "0" + simTime[1];
    }
    simClock.textContent = simTime[0] + ":" + simTime[1] + " " + timeDenom;

    writeActiveJobs();
}

// Display which jobs are currently active
function writeActiveJobs() {

    const jobsActive = returnJobsOpen();

    const jobRobot = document.getElementById("job-robot");
    const jobDiner = document.getElementById("job-diner");
    const jobClub = document.getElementById("job-club");

    jobRobot.style.background = "url(./images/buttons/jobs-active.png) 40px 0";
    jobDiner.style.background = "url(./images/buttons/jobs-active.png) 40px 80px";
    jobClub.style.background = "url(./images/buttons/jobs-active.png) 40px 40px";

    if (jobsActive.includes(1)) {

        jobRobot.style.background = "url(./images/buttons/jobs-active.png) 0 0";
    }
    if (jobsActive.includes(2)) {

        jobDiner.style.background = "url(./images/buttons/jobs-active.png) 0 80px";
    }
    if (jobsActive.includes(4)) {

        jobClub.style.background = "url(./images/buttons/jobs-active.png) 0 40px";
    }
}

// Write about info in sidebar info panel 
async function writeSidebarInfo() {

    const infoBox = document.getElementById("sidebar-site-info");
    const gitJson = await returnGitCommitJson();
    var date = gitJson.commit.commit.author.date.slice(0, 10);
    
    var infoText = "Sim Finder\n\nLast Update:\n" + date;
    infoBox.textContent = infoText;
}