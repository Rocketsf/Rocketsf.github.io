let table = document.getElementById("tabledata");
let sheetValues = [];
let tileName;
let editWindow = document.getElementById("editwindow");
let currentRow;

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
}

function putTableData() {
    console.log(sheetValues);
    let sheet;
    for (i = 0; i < sheetValues.length; i++) {
        if (sheetValues[i].result.range.includes(tileName)) {
            sheet = sheetValues[i];
            break;
        }
    }

    //create table rows with sheet values
    for (i = 1; i < sheet.result.values.length; i++) {
        let rowClone = table.children[0].cloneNode(true);
        table.appendChild(rowClone);
    }
     
    //create table data with sheet values of values
    for (i = 0; i < sheet.result.values.length; i++) {
        for (j = 0; j < 5; j++) {
            table.children[i].children[0].children[j].innerHTML = sheet.result.values[i][j];
        }
    }
}

function openEdit(row) {
    editWindow.setAttribute("style", "display: block");
    currentRow = row;
}

function editRow() {

}

function deleteRow() {
    let input = prompt("Are you sure you want to delete this row?\nType 'delete' to confirm deletion.");
    if (input == "delete") {
        console.log("row deleted");
    }
}

function closeEdit() {
    editWindow.setAttribute("style", "display: none");
}