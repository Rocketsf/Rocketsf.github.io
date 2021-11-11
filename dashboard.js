let sheets;
let tile = document.getElementById("tile");
let pageInner = document.getElementById("pageinner");
let addButton = document.getElementById("addaccount");
let accounts = [];
let currentTable = "none";

addButton.onclick = showAddAccount;

function loadData(sheetName) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName+"!A:F"
    }).then(function (response) {
        console.log(response);
        accounts.push(response);
    });
}

function createSheet(titleName) {
    gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requests: {
            addSheet: {
                properties: {
                    title: titleName
                }
            }
        }
    })
    .then((response) => {
        console.log(response); 
    });
    setTimeout(function() { 
        updateSheet(titleName, [["Date"],["Particular"],["Credit"],["Debit"],["Balance"],[sheets.length + 1]], "A1:F1");
        window.location.reload(); 
    }, 1000);
    
}

function updateSheet(sheetName, data, cellRange) {
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName+"!"+cellRange,
        valueInputOption: "RAW",
        resource: {
            majorDimension: "COLUMNS",
            values: data
        }
    })
    .then((response) => {
        console.log(response);
    });
}


//Gets all the sheets
function getSheets() {
    gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    }).then(function(response) {
        sheets = JSON.parse(JSON.stringify(response.result.sheets));
        console.log("got sheets");
    });    
}

function openSheet() {
    console.log(sheets); 
    console.log("SHEET COUNT = " + sheets.length);
    pageInner.removeChild(pageInner.childNodes[1]);

    for (i = 0; i < sheets.length; i++) {
        var clone = tile.cloneNode(true);
        pageInner.appendChild(clone);
    }
    setTimeout(function() {
        setTileValues();
    }, 300);
    
}

function showAddAccount() {
    var input = prompt("Enter a new account name");
    if (input != null) createSheet(input);
}

function setTileValues() {
    accounts.sort((a, b) => {
        return parseInt(a.result.values[0][5] - parseInt(b.result.values[0][5]));
    }); 

    for (i = 0; i < sheets.length; i++) {
        pageInner.children[i].setAttribute("style", "display: block");
        let credit = 0, debit = 0, balance = 0;
        
        for (j = 1; j < accounts[i].result.values.length; j++) {
            credit += parseFloat(accounts[i].result.values[j][2]);
        }
        for (j = 1; j < accounts[i].result.values.length; j++) {
            debit += parseFloat(accounts[i].result.values[j][3]);
        }
        for (j = 1; j < accounts[i].result.values.length; j++) {
            balance += parseFloat(accounts[i].result.values[j][4]);
        }
        for (j = 0; j < pageInner.childNodes.length; j++) {
            pageInner.children[i].children[0].textContent = sheets[i].properties.title;
            pageInner.children[i].children[1].textContent = "Credit: " + credit;
            pageInner.children[i].children[2].textContent = "Debit: " + debit;
            pageInner.children[i].children[3].textContent = "Balance: " + balance;
        }
    } 
}

function showTable(btn) {
    currentTable = btn.children[0].innerHTML;
    localStorage.setItem("clickedTile", currentTable);
    for (i = 0; i < accounts.length; i++) {
        localStorage.setItem("account"+i, JSON.stringify(accounts[i]));
    }
    window.location.replace("/tablepage.html");
}