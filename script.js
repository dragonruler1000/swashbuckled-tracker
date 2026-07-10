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
const stolenCargoValue = document.getElementById("stolenCargoValue");
const routeNotes = document.getElementById("routeNotes");

const hint1 = document.getElementById("hint1");
const hint2 = document.getElementById("hint2");
const hint3 = document.getElementById("hint3");
const treasureLocations = document.getElementById("treasureLocations");

const completedRoutes = document.getElementById("completedRoutes");
const shipsLost = document.getElementById("shipsLost");
const totalEarnings = document.getElementById("totalEarnings");
const largestCargo = document.getElementById("largestCargo");

const historyContainer = document.getElementById("historyContainer");

let routeStarted = false;

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

    cash: 10000,

    routeNumber: 1,

    history: [],

    treasureHints: {
        values: [0,0,0],
        types: ['unknown','unknown','unknown']
    },

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

    // save treasure hints values and selected types
    const t1 = document.querySelector('input[name="hint1Type"]:checked')?.value || 'unknown';
    const t2 = document.querySelector('input[name="hint2Type"]:checked')?.value || 'unknown';
    const t3 = document.querySelector('input[name="hint3Type"]:checked')?.value || 'unknown';

    gameData.treasureHints = {
        values: [Number(hint1.value) || 0, Number(hint2.value) || 0, Number(hint3.value) || 0],
        types: [t1, t2, t3]
    };

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

    // load treasure hints (values and types)
    if(gameData.treasureHints && Array.isArray(gameData.treasureHints.values)){
        const vals = gameData.treasureHints.values;
        hint1.value = vals[0] ?? 0;
        hint2.value = vals[1] ?? 0;
        hint3.value = vals[2] ?? 0;
        const types = gameData.treasureHints.types || [];
        if(types[0]) document.querySelector(`input[name=\"hint1Type\"][value=\"${types[0]}\"]`).checked = true;
        if(types[1]) document.querySelector(`input[name=\"hint2Type\"][value=\"${types[1]}\"]`).checked = true;
        if(types[2]) document.querySelector(`input[name=\"hint3Type\"][value=\"${types[2]}\"]`).checked = true;
    }
    computeTreasureLocations();

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
hint1,
hint2,
hint3,
startContinent,
startPort,
destinationContinent,
destinationPort,
commodity,
stolenCargo,
stolenCargoValue,
routeNotes

].forEach(element => {

    element.addEventListener("input", () => {

        updateCargoWorth();
        computeTreasureLocations();

        saveGame();

    });

});

// radio change listeners for hint types
document.querySelectorAll('input[name="hint1Type"], input[name="hint2Type"], input[name="hint3Type"]').forEach(r => {
    r.addEventListener('change', () => {
        computeTreasureLocations();
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
        stolenValue: Number(stolenCargoValue ? stolenCargoValue.value : 0),

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

    if(typeof gameData.currentRoute.stolenValue !== 'undefined'){
        stolenCargoValue.value = gameData.currentRoute.stolenValue;
    } else {
        stolenCargoValue.value = 0;
    }

    routeNotes.value =
        gameData.currentRoute.notes;

}


// ---------- Treasure Hint Computation ----------

function computeTreasureLocations(){

    const vals = [Number(hint1.value)||0, Number(hint2.value)||0, Number(hint3.value)||0];
    const types = [
        document.querySelector('input[name="hint1Type"]:checked')?.value || 'unknown',
        document.querySelector('input[name="hint2Type"]:checked')?.value || 'unknown',
        document.querySelector('input[name="hint3Type"]:checked')?.value || 'unknown'
    ];

    const required = { continent: 1, port: 2 };
    const confirmed = { continent: 0, port: 0 };
    const unknownIndexes = [];

    types.forEach((type, index) => {
        if(type === 'continent' || type === 'port'){
            confirmed[type]++;
        } else {
            unknownIndexes.push(index);
        }
    });

    if(confirmed.continent > required.continent || confirmed.port > required.port){
        treasureLocations.textContent = "Invalid clue selections.";
        return;
    }

    const remaining = {
        continent: required.continent - confirmed.continent,
        port: required.port - confirmed.port
    };

    const assignments = [];

    function assignUnknown(index, left){
        if(index === unknownIndexes.length){
            assignments.push([...types]);
            return;
        }

        const pos = unknownIndexes[index];

        if(left.continent > 0){
            types[pos] = 'continent';
            assignUnknown(index + 1, { continent: left.continent - 1, port: left.port });
        }

        if(left.port > 0){
            types[pos] = 'port';
            assignUnknown(index + 1, { continent: left.continent, port: left.port - 1 });
        }
    }

    assignUnknown(0, remaining);

    const results = [];

    assignments.forEach(assign => {
        const continentIndex = assign.findIndex(t => t === 'continent');
        const portVals = [];
        assign.forEach((t, i) => {
            if(t === 'port') portVals.push(vals[i]);
        });

        if(continentIndex === -1 || portVals.length !== 2) return;

        const continentId = vals[continentIndex];
        if(continentId < 1 || continentId > 6) return;

        const portNumber = portVals[0] + portVals[1];
        results.push({ continentId, portNumber });
    });

    if(results.length === 0){
        treasureLocations.textContent = "No valid treasure clues selected.";
        return;
    }

    const uniqueResults = [];
    const seen = new Set();
    results.forEach(result => {
        const key = `${result.continentId}-${result.portNumber}`;
        if(!seen.has(key)){
            seen.add(key);
            uniqueResults.push(result);
        }
    });

    treasureLocations.textContent = uniqueResults.map((result, index) => {
        const continentText = `${result.continentId} - ${continents[result.continentId]}`;
        return `${index + 1}) Continent: ${continentText} | Port: ${result.portNumber}`;
    }).join("\n");

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
                ${entry.stolen || "None"} ${entry.stolenValue ? '(' + formatMoney(entry.stolenValue) + ')' : ''}

                <br>

                <strong>Notes:</strong>
                ${entry.notes || "-"}

            `;

        }

        else if(entry.type === "treasure"){

            div.innerHTML = `

                <h3>🏴‍☠️ Treasure Found</h3>

                Bonus:
                ${formatMoney(entry.amount)}

                <br>

                ${entry.note}

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
    stolenCargoValue.value = 0;
    routeNotes.value = "";

    saveCurrentRoute();
    routeStarted = false;
    if(typeof startFinishButton !== 'undefined') startFinishButton.textContent = "Start Route";
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

    const stolenVal = Number(stolenCargoValue.value) || 0;

    const totalGain = worth + stolenVal;

    gameData.cash += totalGain;

    cash.value = gameData.cash;

    gameData.stats.completedRoutes++;

    gameData.stats.totalEarnings += totalGain;

    if(totalGain > gameData.stats.largestCargo){

        gameData.stats.largestCargo = totalGain;

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
        stolenValue: stolenVal,

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

        treasureHints: {
            values: [0,0,0],
            types: ['unknown','unknown','unknown']
        },

        currentRoute: {},

        stats: {

            completedRoutes: 0,
            shipsLost: 0,
            totalEarnings: 0,
            largestCargo: 0

        }

    };

    cash.value = 0;

    hint1.value = 0;
    hint2.value = 0;
    hint3.value = 0;
    document.querySelectorAll('input[name="hint1Type"]').forEach(i => i.checked = i.value === 'unknown');
    document.querySelectorAll('input[name="hint2Type"]').forEach(i => i.checked = i.value === 'unknown');
    document.querySelectorAll('input[name="hint3Type"]').forEach(i => i.checked = i.value === 'unknown');
    computeTreasureLocations();

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

const startFinishButton = document.getElementById("startFinishButton");
startFinishButton.addEventListener("click", () => {
    if(!routeStarted){
        const cargo = Number(cargoWorth.value) || 0;
        const fee = Math.floor(cargo * 0.10);

        gameData.cash -= fee;
        if(gameData.cash < 0) gameData.cash = 0;

        cash.value = gameData.cash;
        updateBuyback();
        saveGame();

        routeStarted = true;
        startFinishButton.textContent = "Finish Route";
    }
    else{
        // finish route
        finishRoute();
        routeStarted = false;
        startFinishButton.textContent = "Start Route";
    }
});

const findTreasureButton = document.getElementById("findTreasureButton");
findTreasureButton.addEventListener("click", () => {
    const bonus = 50000;
    gameData.cash += bonus;
    cash.value = gameData.cash;

    gameData.stats.totalEarnings += bonus;
    totalEarnings.textContent = formatMoney(gameData.stats.totalEarnings);

    updateBuyback();
    saveGame();

    const entry = {
        type: "treasure",
        amount: bonus,
        note: "Treasure found"
    };

    gameData.history.push(entry);
    refreshHistory();
});

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
    stolenCargoValue,
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