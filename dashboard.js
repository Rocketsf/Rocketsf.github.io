var sheets, sheetData;
var tile = document.getElementById("tile");
var pageInner = document.getElementById("pageinner");
var addButton = document.getElementById("addaccount");

addButton.onclick = showAddAccount;

function loadData(sheetName) {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName+"!A:E"
    }).then(function (response) {
        sheetData = response;
        console.log(sheetData);
    }, function (response) {
        console.log(response.result.error.message);
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
    setTimeout(function() { updateSheet(titleName, [["Date"],["Particular"],["Credit"],["Debit"],["Balance"]], "A1:E1"); }, 1000);
    window.location.reload();
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
    }).then((response) => {
        sheets = response.result.sheets;
    });    
}

function openSheet() {
    setTimeout(
        function() { 
            console.log(sheets); 
            console.log("SHEET COUNT = " + sheets.length);
            pageInner.removeChild(pageInner.childNodes[1]);
            for (i = 0; i < sheets.length; i++) {
                console.log("sheet" + i + " sheetId = " + sheets[i].properties.sheetId);
                console.log("sheet" + i + " title = " + sheets[i].properties.title);
                
                var clone = tile.cloneNode(true);
                clone.childNodes.item(1).textContent = sheets[i].properties.title;
    
                loadData(sheets[i].properties.title);
                
                //clone.childNodes.item(2).textContent = sheetData.
                pageInner.appendChild(clone);
                
            }
        }, 
    500);
}

function showAddAccount() {
    var input = prompt("Enter a new account name");
    if (input != null) createSheet(input);
}