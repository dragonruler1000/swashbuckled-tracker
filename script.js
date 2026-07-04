/*
=========================================
 Swashbuckled Companion
 Part 1
=========================================
*/

const SAVE_KEY = "swashbuckledTracker";

// ---------- Elements ----------

const cash = document.getElementById("cash");
const buybackCost = document.getElementById("buybackCost");
const routeNumber = document.getElementById("routeNumber");

const startContinent = document.getElementById("startContinent");
const startPort = document.getElementById("startPort");

const destinationContinent = document.getElementById("destinationContinent");
const destinationPort = document.getElementById("destinationPort");

const commodity = document.getElementById("commodity");
const cargoWorth = document.getElementById("cargoWorth");

const stolenCargo = document.getElementById("stolenCargo");
const routeNotes = document.getElementById("routeNotes");

const treasureHints = document.getElementById("treasureHints");

const completedRoutes = document.getElementById("completedRoutes");
const shipsLost = document.getElementById("shipsLost");
const totalEarnings = document.getElementById("totalEarnings");
const largestCargo = document.getElementById("largestCargo");

const historyContainer = document.getElementById("historyContainer");

const continents = [
    "",
    "Europe",
    "Asia",
    "North America",
    "South America",
    "Africa",
    "Australia"
];



// ---------- Game Data ----------

let gameData = {

    cash: 0,

    routeNumber: 1,

    history: [],

    treasureHints: "",

    stats: {

        completedRoutes: 0,
        shipsLost: 0,
        totalEarnings: 0,
        largestCargo: 0

    }

};



// ---------- Formatting ----------

function formatMoney(value){

    return "$" + Number(value).toLocaleString();

}



// ---------- Buyback ----------

function updateBuyback(){

    const buyback = Math.floor(gameData.cash * 0.10);

    buybackCost.textContent = formatMoney(buyback);

}



// ---------- Cargo Worth ----------

function updateCargoWorth(){

    const origin = Number(startContinent.value);

    const destination = Number(destinationContinent.value);

    const item = commodity.value;

    if(!origin || !destination || !item){

        cargoWorth.value = 0;
        return;

    }

    cargoWorth.value = getTradeValue(
        item,
        origin,
        destination
    );

}

function getTradeValue(commodity, origin, destination){

    // Same-continent trade isn't allowed
    if(origin === destination){
        return 0;
    }

    // Always sort so 5→2 and 2→5 use the same key
    const first = Math.min(origin, destination);
    const second = Math.max(origin, destination);

    const key = `${first}-${second}`;

    return tradeValues[commodity]?.[key] ?? 0;

}



// ---------- Populate Commodity List ----------

function populateCommodityDropdown(){

    commodity.innerHTML = '<option value="">Select...</option>';

    commodities.forEach(item => {

        const option = document.createElement("option");

        option.value = item;

        option.textContent = item;

        commodity.appendChild(option);

    });
}



// ---------- Save ----------

function saveGame(){

    gameData.cash = Number(cash.value);

    gameData.treasureHints = treasureHints.value;

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(gameData)
    );

}



// ---------- Load ----------

function loadGame(){

    const save = localStorage.getItem(SAVE_KEY);

    if(save){

        gameData = JSON.parse(save);

    }

    cash.value = gameData.cash;

    treasureHints.value = gameData.treasureHints;

    routeNumber.textContent = gameData.routeNumber;

    completedRoutes.textContent =
        gameData.stats.completedRoutes;

    shipsLost.textContent =
        gameData.stats.shipsLost;

    totalEarnings.textContent =
        formatMoney(gameData.stats.totalEarnings);

    largestCargo.textContent =
        formatMoney(gameData.stats.largestCargo);

    updateBuyback();

}



// ---------- Auto Save ----------

[
treasureHints,
startContinent,
startPort,
destinationContinent,
destinationPort,
commodity,
stolenCargo,
routeNotes

].forEach(element => {

    element.addEventListener("input", () => {

        updateCargoWorth();

        saveGame();

    });

});

/*
=========================================
 Swashbuckled Companion
 Part 2
=========================================
*/


// ---------- Current Route ----------

function saveCurrentRoute(){

    gameData.currentRoute = {

        startContinent: startContinent.value,
        startPort: startPort.value,

        destinationContinent: destinationContinent.value,
        destinationPort: destinationPort.value,

        commodity: commodity.value,

        cargoWorth: Number(cargoWorth.value),

        stolenCargo: stolenCargo.value,

        notes: routeNotes.value

    };

}


// ---------- Restore Current Route ----------

function loadCurrentRoute(){

    if(!gameData.currentRoute)
        return;

    startContinent.value =
        gameData.currentRoute.startContinent;

    startPort.value =
        gameData.currentRoute.startPort;

    destinationContinent.value =
        gameData.currentRoute.destinationContinent;

    destinationPort.value =
        gameData.currentRoute.destinationPort;

    commodity.value =
        gameData.currentRoute.commodity;

    cargoWorth.value =
        gameData.currentRoute.cargoWorth;

    stolenCargo.value =
        gameData.currentRoute.stolenCargo;

    routeNotes.value =
        gameData.currentRoute.notes;

}



// ---------- History ----------

function refreshHistory(){

    historyContainer.innerHTML = "";

    if(gameData.history.length === 0){

        historyContainer.innerHTML =
            "<p class='placeholder'>No voyages recorded yet.</p>";

        return;

    }

    gameData.history.forEach(entry => {

        const div = document.createElement("div");

        div.className = "history-entry";

        if(entry.type === "sunk")
            div.classList.add("sunk");

        if(entry.type === "route"){

            div.innerHTML = `
                <h3>Route #${entry.route}</h3>

                <strong>From:</strong>
                ${entry.startContinent}-${entry.startPort}

                <br>

                <strong>To:</strong>
                ${entry.destinationContinent}-${entry.destinationPort}

                <br>

                <strong>Commodity:</strong>
                ${entry.commodity}

                <br>

                <strong>Worth:</strong>
                ${formatMoney(entry.worth)}

                <br>

                <strong>Stolen:</strong>
                ${entry.stolen || "None"}

                <br>

                <strong>Notes:</strong>
                ${entry.notes || "-"}

            `;

        }

        else{

            div.innerHTML = `

                <h3>☠ Ship Sunk</h3>

                Buyback:
                ${formatMoney(entry.buyback)}

            `;

        }

        historyContainer.appendChild(div);

    });

}



// ---------- Clear Route ----------

function clearCurrentRoute(){

    startContinent.value = "";
    startPort.value = "";

    destinationContinent.value = "";
    destinationPort.value = "";

    commodity.value = "";

    cargoWorth.value = 0;

    stolenCargo.value = "";
    routeNotes.value = "";

    saveCurrentRoute();
    saveGame();

}



// ---------- Finish Route ----------

function finishRoute(){

    if (
    !startContinent.value ||
    !startPort.value ||
    !destinationContinent.value ||
    !destinationPort.value ||
    !commodity.value
) {
    alert("Please complete the current trade route first.");
    return;
}

    saveCurrentRoute();

    const worth = getTradeValue(
        commodity.value,
        Number(startContinent.value),
        Number(destinationContinent.value)
);

    gameData.cash += worth;

    cash.value = gameData.cash;

    gameData.stats.completedRoutes++;

    gameData.stats.totalEarnings += worth;

    if(worth > gameData.stats.largestCargo){

        gameData.stats.largestCargo = worth;

    }

    gameData.history.push({

        type: "route",

        route: gameData.routeNumber,

        startContinent: startContinent.value,
        startPort: startPort.value,

        destinationContinent: destinationContinent.value,
        destinationPort: destinationPort.value,

        commodity: commodity.value,

        worth: worth,

        stolen: stolenCargo.value,

        notes: routeNotes.value

    });

    gameData.routeNumber++;

    completedRoutes.textContent =
        gameData.stats.completedRoutes;

    totalEarnings.textContent =
        formatMoney(gameData.stats.totalEarnings);

    largestCargo.textContent =
        formatMoney(gameData.stats.largestCargo);

    routeNumber.textContent =
        gameData.routeNumber;

    updateBuyback();

    refreshHistory();

    clearCurrentRoute();

    saveGame();

}



// ---------- Ship Sunk ----------

function shipSunk(){

    const buyback =
        Math.floor(gameData.cash * 0.10);

    gameData.cash -= buyback;

    if(gameData.cash < 0)
        gameData.cash = 0;

    cash.value = gameData.cash;

    gameData.stats.shipsLost++;

    shipsLost.textContent =
        gameData.stats.shipsLost;

    gameData.history.push({

        type: "sunk",

        buyback: buyback

    });

    updateBuyback();

    refreshHistory();

    clearCurrentRoute();

    saveGame();

}
/*
=========================================
 Swashbuckled Companion
 Part 3
=========================================
*/


// ---------- Export Save ----------

function exportSave(){

    saveCurrentRoute();
    saveGame();

    const saveFile = {

        version: 1,
        exported: new Date().toISOString(),
        gameData: gameData

    };

    const blob = new Blob(
        [JSON.stringify(saveFile, null, 4)],
        {type:"application/json"}
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "swashbuckled-save.json";

    a.click();

    URL.revokeObjectURL(url);

}



// ---------- Import Save ----------

function importSave(file){

    const reader = new FileReader();

    reader.onload = function(event){

        try{

            const save = JSON.parse(event.target.result);

            if(save.gameData){

                gameData = save.gameData;

            }
            else{

                gameData = save;

            }

            localStorage.setItem(
                SAVE_KEY,
                JSON.stringify(gameData)
            );

            loadGame();
            loadCurrentRoute();
            refreshHistory();
            updateCargoWorth();

            alert("Save imported successfully.");

        }
        catch{

            alert("That file isn't a valid save.");

        }

    };

    reader.readAsText(file);

}



// ---------- Reset ----------

function resetGame(){

    if(!confirm(
        "Reset everything?\n\nThis cannot be undone."
    ))
        return;

    localStorage.removeItem(SAVE_KEY);

    gameData = {

        cash: 0,

        routeNumber: 1,

        history: [],

        treasureHints: "",

        currentRoute: {},

        stats: {

            completedRoutes: 0,
            shipsLost: 0,
            totalEarnings: 0,
            largestCargo: 0

        }

    };

    cash.value = 0;

    treasureHints.value = "";

    completedRoutes.textContent = 0;

    shipsLost.textContent = 0;
    totalEarnings.textContent =
        formatMoney(0);

    largestCargo.textContent =
        formatMoney(0);

    routeNumber.textContent = 1;

    clearCurrentRoute();

    refreshHistory();

    updateBuyback();

}



// ---------- Button Events ----------

document
.getElementById("finishRouteButton")
.addEventListener(
    "click",
    finishRoute
);

document
.getElementById("shipSunkButton")
.addEventListener(
    "click",
    shipSunk
);

document
.getElementById("clearRouteButton")
.addEventListener(
    "click",
    clearCurrentRoute
);

document
.getElementById("resetButton")
.addEventListener(
    "click",
    resetGame
);

document
.getElementById("exportButton")
.addEventListener(
    "click",
    exportSave
);

document
.getElementById("importButton")
.addEventListener(
    "click",
    () => {

        document
            .getElementById("importFile")
            .click();

    }
);

document
.getElementById("importFile")
.addEventListener(
    "change",
    event => {

        if(event.target.files.length){

            importSave(
                event.target.files[0]
            );
        }

    }
);

cash.addEventListener("input", () => {
    gameData.cash = Number(cash.value);
    updateBuyback();
    saveGame();
});



// ---------- Auto Save Current Route ----------

[
startContinent,
startPort,
destinationContinent,
destinationPort,
commodity,
cargoWorth,
stolenCargo,
routeNotes

].forEach(element => {

    element.addEventListener("input", () => {

        saveCurrentRoute();

        saveGame();

    });

});



// ---------- Startup ----------

populateCommodityDropdown();
loadGame();

loadCurrentRoute();

refreshHistory();

updateCargoWorth();

updateBuyback();

saveCurrentRoute();

saveGame();

console.log(
    "🏴‍☠️ Swashbuckled Companion Loaded"
);