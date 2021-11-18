let sheets;
let tile = document.getElementById("tile");
let pageInner = document.getElementById("pageinner");
let addButton = document.getElementById("addaccount");
let searchBar = document.getElementById("search");
let submitBtn = document.getElementById("submitbtn");
let editTileBtn = document.getElementById("edittile");
let editTileWindow = document.getElementById("edittilewindow");
let accounts = [];
let currentTable = "none";
let currentTile;
let totalBalance = document.getElementById("total_balance");

addButton.onclick = showAddAccount;
searchBar.addEventListener('input', search);

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
        valueInputOption: "USER_ENTERED",
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
    anime({
        targets: ".pgld",
        duration: 2000,
        loop: true,
        easing: "easeInOutQuart",
        translateX: ['-80%', 0, '80%', 0]
    })
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
        accounts.sort((a, b) => {
            return parseInt(a.result.values[0][5] - parseInt(b.result.values[0][5]));
        });
        for (i = 0; i < accounts.length; i++) {
            pageInner.children[i].setAttribute("style", "display: block");
            pageInner.children[i].addEventListener('click', function(e) {
                if (e.target.innerHTML != "settings") {
                    showTable(e.currentTarget);
                }
                else showEditTileWindow(e.currentTarget);
            })
        } 
        
        setTileValues();
    }, 500);
    
}

function showAddAccount() {
    var input = prompt("Enter a new account name");
    if (input != null) createSheet(input);
}

function setTileValues() {

    let total = 0;

    for (i = 0; i < sheets.length; i++) {
        
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

        pageInner.children[i].children[0].textContent = sheets[i].properties.title;
        pageInner.children[i].children[1].textContent = "Credit: " + credit;
        pageInner.children[i].children[2].textContent = "Debit: " + debit;
        pageInner.children[i].children[3].textContent = "Balance: " + balance;
        
        total += balance;
    }
    totalBalance.innerHTML = "TOTAL BALANCE: " + total;
    sortTiles();

    anime({
        targets: document.getElementsByClassName("tileanim"),
        duration: 50,
        opacity: 1,
        translateX: [-50, 0],
        easing: 'easeOutSine',
        delay: anime.stagger(100, {start: 100})
    });
    
}

function showTable(btn) {
    currentTable = btn.children[0].innerHTML;
    localStorage.clear();
    localStorage.setItem("clickedTile", currentTable);
    for (i = 0; i < accounts.length; i++) {
        localStorage.setItem("account"+i, JSON.stringify(accounts[i]));
    }
    window.location = "/tablepage.html";
}

function search(e) {
    console.log(e.target.value);
    for (i = 0; i < pageInner.children.length; i++) {
        if (pageInner.children[i].children[0].innerHTML.toLowerCase().includes(e.target.value.toLowerCase())){
            if (pageInner.children[i].children[0].innerHTML != "SHEET_NAME") {
                pageInner.children[i].setAttribute("style", "display: block");
                anime({
                    targets: pageInner.children[i],
                    duration: 100,
                    opacity: 1,
                    translateX: [0],
                    easing: 'easeInSine',
                    delay: 50
                });
            }
        }
        else pageInner.children[i].setAttribute("style", "display: none");
    }
}

function sortTiles() {
    let sortedTiles = Array.from(pageInner.children);
    sortedTiles.sort(function(a, b) {
        return a.children[0].textContent.toLowerCase() < b.children[0].textContent.toLowerCase() ? -1 : 1
    });

    for (i = 0; i < sortedTiles.length; i++) {
        pageInner.children[0].remove;
        pageInner.appendChild(sortedTiles[i]);
    }
}

function showEditTileWindow(tile) {
    editTileWindow.setAttribute("style", "display: block");
    currentTile = tile;
    anime({
        targets: ".editwindowanim",
        scale: [0, 1],
        duration: 100,
        easing: "linear"
    })
}

function renameTile() {
    let input = prompt("Enter a new name");
    if (input != null) {

        let id = -1;

        for (i = 0; i < sheets.length; i++) {
            if (sheets[i].properties.title == currentTile.children[0].innerHTML) {
                id = sheets[i].properties.sheetId;
                break;
            }
        }

        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requests: {
                updateSheetProperties: {
                    properties: {
                        sheetId: id,
                        title: input
                    },
                    fields: "Title"
                }
            }
        })
        .then((response) => {
            console.log(response);
            window.location.reload();
        });

    }
}

function deleteTile() {
    let input = confirm("Are you sure you want to delete this?");

    if (input == true) {

        let id = -1;

        for (i = 0; i < sheets.length; i++) {
            if (sheets[i].properties.title == currentTile.children[0].innerHTML) {
                id = sheets[i].properties.sheetId;
                break;
            }
        }

        gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requests: {
                deleteSheet: {
                    sheetId: id,
                }
            }
        })
        .then((response) => {
            console.log(response);
            window.location.reload();
        });

    }
}

function cancel() {
    anime({
        targets: ".editwindowanim",
        scale: [1, 0],
        duration: 100,
        easing: "linear"
    })
}