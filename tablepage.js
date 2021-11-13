let table = document.getElementById("tabledata");
let sheetValues = [];
let currentValues, currentSheet;
let tileName;
let editWindow = document.getElementById("editwindow");
let currentRow, rowId = 0;

window.onload = function() {
    for (i = 0; i < localStorage.length - 1; i++) {
        sheetValues.push(JSON.parse(localStorage.getItem("account"+i)));
    }
    sheetValues.sort((a, b) => {
        if (a != null && b != null) {
            return parseInt(a.result.values[0][5] - parseInt(b.result.values[0][5]));
        }
    });
    tileName = localStorage.getItem("clickedTile");
    document.getElementById("dashboard").innerHTML = tileName;
    document.getElementById("back").onclick = function() {
        window.location = "/dashboard.html";
    }
    putTableData();
    gapi.load('client:auth2', init);
}

function init() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        getSheets();
    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}



function putTableData() {
    console.log(sheetValues);
    
    for (i = 0; i < sheetValues.length; i++) {
        if (sheetValues[i].result.range.includes(tileName)) {
            currentValues = sheetValues[i];
            break;
        }
    }

    //create table rows with sheet values
    for (i = 1; i < currentValues.result.values.length; i++) {
        let rowClone = table.children[0].cloneNode(true);
        rowClone.children[0].id = i;
        table.appendChild(rowClone);
    }
     
    //create table data with sheet values of values
    for (i = 0; i < currentValues.result.values.length; i++) {
        for (j = 0; j < 5; j++) {
            table.children[i].children[0].children[j].innerHTML = currentValues.result.values[i][j];
        }
    }

    
}

function openEdit(row, id) {
    editWindow.setAttribute("style", "display: block");
    currentRow = row;
    rowId = parseInt(id);
}

function editRow() {

}

function deleteRow() {
    let input = prompt("Are you sure you want to delete this row?\nType 'delete' to confirm deletion.");
    
    if (input == "delete") {

        let sheetId = -1;

        for (i = 0; i < sheets.length; i++) {
            if (sheets[i].properties.title == tileName) {
                sheetId = sheets[i].properties.sheetId;
            }
        }

        let params = {
            spreadsheetId: SPREADSHEET_ID
        }
        
        let body = {
            requests: [{
                deleteDimension: {
                    range: {
                        sheetId: sheetId,
                        dimension: "ROWS",
                        startIndex: rowId,
                        endIndex: rowId + 1 
                    }
                }
            }],
        }
        
        let request = gapi.client.sheets.spreadsheets.batchUpdate(params, body);
        request.then(function (response) {
            console.log(response);
            console.log("deleting id " + rowId);
            closeEdit();
            table.deleteRow(rowId);
            for (i = 0; i < table.children.length; i++) {
                if (table.children[i].children.length == 0) {
                    table.children[i].remove();
                }
            }
            for (i = 0; i < table.children.length; i++) {
                table.children[i].children[0].id = i;
            }
        }, function(reason) {
            console.error(reason.result.error.message);
        });
    }
}

function closeEdit() {
    editWindow.setAttribute("style", "display: none");
}