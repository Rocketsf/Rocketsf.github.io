let table = document.getElementById("tabledata");
let sheetValues = [];
let currentValues, currentSheet;
let tileName;

let editWindow = document.getElementById("editwindow");
let editRowWindow = document.getElementById("editrow");
let addRowWindow = document.getElementById("addrowwindow");

let date = document.getElementById("dateinput");
let newDate = document.getElementById("newdateinput");

let particular = document.getElementById("particularinput");
let newParticular = document.getElementById("newparticularinput");

let credit = document.getElementById("creditinput");
let newCredit = document.getElementById("newcreditinput");

let debit = document.getElementById("debitinput");
let newDebit = document.getElementById("newdebitinput");

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

function applyEdit() {
    currentRow.children[0].innerHTML = date.value;
    currentRow.children[1].innerHTML = particular.value;
    currentRow.children[2].innerHTML = credit.value;
    currentRow.children[3].innerHTML = debit.value;
    currentRow.children[4].innerHTML = (parseFloat(credit.value) - parseFloat(debit.value));

    updateSheet(
                tileName, 
                [[currentRow.children[0].innerHTML],
                [currentRow.children[1].innerHTML],
                [currentRow.children[2].innerHTML],
                [currentRow.children[3].innerHTML],
                [currentRow.children[4].innerHTML]], 
                "A"+(rowId+1)+":E"+(rowId+1)
    );

    closeEditRow();
    closeEdit();
}

function editRow() {
    editRowWindow.setAttribute("style", "display: block");

    date.setAttribute("value", currentRow.children[0].innerHTML);
    particular.setAttribute("value", currentRow.children[1].innerHTML);
    credit.setAttribute("value", currentRow.children[2].innerHTML);
    debit.setAttribute("value", currentRow.children[3].innerHTML);
    
    console.log(currentRow);
}

function addRow() {
    addRowWindow.setAttribute("style", "display:block");
}

function deleteRow() {
    let input = confirm("Are you sure you want to delete this row?");
    
    if (input == true) {

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

function applyNewRow() {
    if ((newDate.value != "" && newCredit.value != "") || (newDate.value != "" && newDebit.value != "")) {
        console.log("made new row");
        let newRow = table.insertRow(table.children.length-1);
        
        let cell0 = newRow.insertCell(0);
        let cell1 = newRow.insertCell(1);
        let cell2 = newRow.insertCell(2);
        let cell3 = newRow.insertCell(3);
        let cell4 = newRow.insertCell(4);

        if (newCredit.value == "") newCredit.value = 0;
        if (newDebit.value == "") newDebit.value = 0;

        cell0.innerHTML = newDate.value;
        cell1.innerHTML = newParticular.value;
        cell2.innerHTML = newCredit.value;
        cell3.innerHTML = newDebit.value;
        cell4.innerHTML = (parseFloat(newCredit.value) - parseFloat(newDebit.value));

        table.appendChild(newRow);

        updateSheet(
            tileName, 
            [[cell0.innerHTML],
            [cell1.innerHTML],
            [cell2.innerHTML],
            [cell3.innerHTML],
            [cell4.innerHTML]], 
            "A"+(table.children.length)+":E"+(table.children.length)
        );

        closeNewRow();
    }
    else if (newDate.value == "" || (newDate.value != "" && newCredit.value == "" ) || (newDate.value != "" && newDebit == "")) {
        alert("Please input a new date and credit or debit value.");
    }
}

function closeEdit() {
    editWindow.setAttribute("style", "display: none");
}

function closeEditRow() {
    editRowWindow.setAttribute("style", "display: none");
}

function closeNewRow() {
    addRowWindow.setAttribute("style", "display:none");
}