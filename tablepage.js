let table = document.getElementById("tabledata");
let sheetValues = [];
let tileName;

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
        window.location.replace("/dashboard.html")
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