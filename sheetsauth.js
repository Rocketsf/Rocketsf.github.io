var CLIENT_ID = '827836370294-l7fdsusv33jhcurc91u5m6lgn09rek6a.apps.googleusercontent.com';
var API_KEY = 'AIzaSyAJmkJ5vsYW0BWD3PPnfBGuf8Js7ShnM2M';
var SPREADSHEET_ID = '1drt8WRuLILtufLIbqV4_Secizkv-gPEGZXdu5DbjhvU';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

var authorizeButton = document.getElementById('authorize_button');

function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

window.onload = handleClientLoad;

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
    })



}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        window.location = "/dashboard.html";
    } else {
        authorizeButton.style.display = 'block';
    }
}

function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}
