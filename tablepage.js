let table = document.getElementById("tabledata");
let sheetValues = [];
let currentValues, currentSheet;
let tileName;

let tableBalance = document.getElementById("tablebalance");

let editWindow = document.getElementById("editwindow");
let editRowWindow = document.getElementById("editrow");
let addRowWindow = document.getElementById("addrowwindow");

let date = document.getElementById("dateinput");
let newDate = document.getElementById("newdateinput");

let particular = document.getElementById("particularinput");
let newParticular = document.getElementById("newparticularinput");

let credit = document.getElementById("creditinput");
let newCredit = document.getElementById("addcreditinput");
let creditRadio = document.getElementById("radiocredit");

let debit = document.getElementById("debitinput");
let newDebit = document.getElementById("adddebitinput");
let debitRadio = document.getElementById("radiodebit");

let currentRow, rowId = 0;

window.onload = function() {

    let savedRows = getFromLocal();
    console.log(savedRows);
    if (savedRows.length > 0) {
        
        for (i = 0; i < savedRows.length; i++) {
            sheetValues.push(JSON.parse(savedRows[i]));
        }
    }
    else {
        for (i = 0; i < localStorage.length - 1; i++) {
            sheetValues.push(JSON.parse(localStorage.getItem("account"+i)));
        }
    }

    console.log(sheetValues);
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
    setRowColors();
    gapi.load('client:auth2', init);

}

function saveToLocal() {
    for (i = 1; i < table.children.length; i++) {
        console.log(table.children[i]);
        localStorage.setItem("row"+i, JSON.stringify(table.children[i]));
    }
    console.log("saved rows to local")
   
}

function getFromLocal() {
    let r = [];
    for (i = 1; i < table.children.length; i++) {
        r.push(localStorage.getItem("row"+i));
    }
    console.log("got rows from local");
    return r;
}

function init() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        getSheets();
        sortRows();
    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}

function sortRows() {
    let sortedRows = Array.from(table.children);
    sortedRows.reverse()
    sortedRows.pop();
    sortedRows.reverse();
    sortedRows.sort(function(a, b) {
        return a.children[0].children[0].textContent < b.children[0].children[0].textContent ? -1 : 1
    });

    for (i = 1; i < sortedRows.length; i++) {
        table.children[0].remove;
        table.appendChild(sortedRows[i]);
    }
    
    updateBalance();

    // setTimeout(function() {
        for (i = 1; i < table.children.length; i++) {
            updateSheet(
                tileName, 
                [   
                    [table.children[i].children[0].children[0].innerHTML],
                    [table.children[i].children[0].children[1].innerHTML],
                    [table.children[i].children[0].children[2].innerHTML],
                    [table.children[i].children[0].children[3].innerHTML],
                    [table.children[i].children[0].children[4].innerHTML],
                ],
                "A"+(i+1)+":E"+(i+1)
            );
        }
    //}, 300);

}

function putTableData() {
    console.log(sheetValues);
    console.log(tileName);
    for (i = 0; i < sheetValues.length; i++) {
        let exIndex = sheetValues[i].result.range.indexOf("!");
        let sheetName = sheetValues[i].result.range.substring(0, exIndex);

        if (sheetName.includes("'")) {
            sheetName = sheetName.substring(1, sheetName.length - 1);
        }
        if (sheetName == tileName) {
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

    table.children[0].children[0].children[1].innerHTML = "Notes";
    table.children[0].children[0].children[1].setAttribute("style", "text-align: center");
    updateBalance();
}

function openEdit(row, id) {
    rowId = parseInt(id);
    if (rowId != 0) {
        editWindow.setAttribute("style", "display: block");
        currentRow = row;
        anime({
            targets: ".editwindowanim",
            scale: [0, 1],
            duration: 100,
            easing: "linear"
        })
    }
}

function applyEdit() {
    currentRow.children[0].innerHTML = date.value;
    currentRow.children[1].innerHTML = particular.value;

    if (credit.value == "" || debitRadio.checked) credit.value = 0;
    if (debit.value == "" || creditRadio.checked) debit.value = 0;

    if (credit.value == 0 && debit.value == 0) {
        alert("Credit and Debit can not both be 0");
        return;
    }

    currentRow.children[2].innerHTML = credit.value;
    currentRow.children[3].innerHTML = debit.value;
    
    console.log("credit: "+credit.value+", debit: "+debit.value);
    if (document.getElementById(rowId - 1).children[4].innerHTML != "Balance") {
        currentRow.children[4].innerHTML = (parseFloat(credit.value) - parseFloat(debit.value) + parseFloat(document.getElementById(rowId - 1).children[4].innerHTML));
    }
    else currentRow.children[4].innerHTML = (parseFloat(credit.value) - parseFloat(debit.value));

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
    setTimeout(sortRows, 750);
    updateBalance();
    setRowColors();
}

function editRow() {
    date.value = currentRow.children[0].innerHTML;
    particular.value = currentRow.children[1].innerHTML;
    if (currentRow.children[2].innerHTML != 0) credit.value = currentRow.children[2].innerHTML;
    else credit.value = "";
    if (currentRow.children[3].innerHTML != 0) debit.value = currentRow.children[3].innerHTML;
    else debit.value = "";
    
    editRowWindow.setAttribute("style", "display: block");
    console.log(currentRow);

    anime({
        targets: ".editrowanim",
        scale: [0, 1],
        duration: 100,
        easing: "linear"
    })
}

function addRow() {
    addRowWindow.setAttribute("style", "display:block");
    anime({
        targets: ".addrowanim",
        scale: [0, 1],
        duration: 100,
        easing: "linear"
    })
    newCredit.value = "";
    newDebit.value = "";
    newDate.value = "";
    newParticular.value = "";
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
            getSheets();
            sortRows();
            updateBalance();
            //updateAccounts();
        }, function(reason) {
            console.error(reason.result.error.message);
        });

        // for (i = 0; i < sheets.length; i++) {
        //     updateSheet(sheets[i].properties.sheetId, [[i + 1]], "F1:F1");
        //     console.log(response);
        // }

    }
}

function applyNewRow() {
    if ((newDate.value != "" && newCredit.value != "") || (newDate.value != "" && newDebit.value != "")) {
        console.log("made new row");
        let newRow = table.children[table.children.length-1].cloneNode(true);
        let prevBalance = document.getElementById(table.children.length-1).children[4].innerHTML;
        console.log(prevBalance);
        if (prevBalance == "Balance") prevBalance = 0;
        if (newCredit.value == "") newCredit.value = 0;
        if (newDebit.value == "") newDebit.value = 0;

        newRow.firstChild.childNodes.item(1).innerHTML = newDate.value;
        newRow.firstChild.childNodes.item(3).innerHTML = newParticular.value;
        newRow.firstChild.childNodes.item(5).innerHTML = newCredit.value;
        newRow.firstChild.childNodes.item(7).innerHTML = newDebit.value;
        newRow.firstChild.childNodes.item(9).innerHTML = (parseFloat(newCredit.value) - parseFloat(newDebit.value) + parseFloat(prevBalance));

        newRow.firstChild.id = table.children.length;
        table.appendChild(newRow);

        updateSheet(
            tileName, 
            [[newRow.firstChild.childNodes.item(1).innerHTML],
            [newRow.firstChild.childNodes.item(3).innerHTML],
            [newRow.firstChild.childNodes.item(5).innerHTML],
            [newRow.firstChild.childNodes.item(7).innerHTML],
            [newRow.firstChild.childNodes.item(9).innerHTML]], 
            "A"+(table.children.length)+":E"+(table.children.length)
        );
        
        newDate.value = "";
        newParticular.value = "";
        newCredit.value = "";
        newDebit.value = "";

        closeNewRow();
        sortRows();
        updateBalance();
        //updateAccounts();
        setRowColors();
    }
    else if (newDate.value == "" || (newDate.value != "" && newCredit.value == "" ) || (newDate.value != "" && newDebit == "")) {
        alert("Please input a new date and credit or debit value.");
    }
}

function closeEdit() {
    anime({
        targets: ".editwindowanim",
        scale: [1, 0],
        duration: 100,
        easing: "linear"
    })
}

function closeEditRow() {
    anime({
        targets: ".editrowanim",
        scale: [1, 0],
        duration: 100,
        easing: "linear"
    })
}

function closeNewRow() {
    anime({
        targets: ".addrowanim",
        scale: [1, 0],
        duration: 100,
        easing: "linear"
    })
}

function editRadioChange(r) {
    let clabel = document.getElementById("creditlabel");
    let dlabel = document.getElementById("debitlabel");
    let cinput = document.getElementById("creditinput");
    let dinput = document.getElementById("debitinput");

    if (r.value == "chosecredit") {
        clabel.setAttribute("style", "display: inline-block");
        cinput.setAttribute("style", "display: inline-block");
        dlabel.setAttribute("style", "display: none");
        dinput.setAttribute("style", "display: none");
    }
    else if (r.value == "chosedebit") {
        clabel.setAttribute("style", "display: none");
        dlabel.setAttribute("style", "display: inline-block");
        cinput.setAttribute("style", "display: none");
        dinput.setAttribute("style", "display: inline-block");
    }
}

function addRadioChange(r) {
    let clabel = document.getElementById("addcreditlabel");
    let dlabel = document.getElementById("adddebitlabel");
    let cinput = document.getElementById("addcreditinput");
    let dinput = document.getElementById("adddebitinput");

    if (r.value == "chosecredit") {
        clabel.setAttribute("style", "display: inline-block");
        cinput.setAttribute("style", "display: inline-block");
        dlabel.setAttribute("style", "display: none");
        dinput.setAttribute("style", "display: none");
    }
    else if (r.value == "chosedebit") {
        clabel.setAttribute("style", "display: none");
        dlabel.setAttribute("style", "display: inline-block");
        cinput.setAttribute("style", "display: none");
        dinput.setAttribute("style", "display: inline-block");
    }
}

function updateBalance() {
    if (table.children.length > 1) {
        for (i = 1; i < table.children.length; i++) {
            let prevBalance = 0;
            if (table.children[i-1].children[0].children[4].innerHTML != "Balance") {
                prevBalance = parseFloat(table.children[i-1].children[0].children[4].innerHTML);
            }
            let c = parseFloat(table.children[i].children[0].children[2].innerHTML);
            let d = parseFloat(table.children[i].children[0].children[3].innerHTML);
            table.children[i].children[0].children[4].innerHTML = (c - d + prevBalance);
        }
        tableBalance.innerHTML = "TOTAL BALANCE: " + table.lastChild.children[0].children[4].innerHTML;
    }
}

function setRowColors() {
    for (i = 0; i < table.children.length; i++) {
        if (i == 0) {
            table.children[i].setAttribute("style", "background-color: rgb(150,150,150)");
        }
        else {
            if (parseFloat(table.children[i].children[0].children[2].innerHTML) == 0) {
                table.children[i].setAttribute("style", "background-color: rgb(190,125,125)");
            }
            else table.children[i].setAttribute("style", "background-color: rgb(120,200,145)");
        }
    }
    saveToLocal();
}