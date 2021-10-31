function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}

function loadData() {
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'A1:E2',
    }).then(function (response) {
        var range = response.result;
        var row = range.values;

        if (range.values.length > 0) {
            appendPre('DATA RETRIEVED:');
            for (i = 0; i < row.length; i++) {
                appendPre(row[i]);
            }
        } else {
            appendPre('No data found.');
        }
    }, function (response) {
        appendPre('Error: ' + response.result.error.message);
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

function getSheets() {
    gapi.client.sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID
    }).then((response) => {
          return response.result.sheets;
    });
}