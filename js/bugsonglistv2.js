
function makeCardLink(className, href, text){
    if ( href != '' ) {
        var link = document.createElement("a");
        link.className = className + ' ml-1 mt-1';
        link.href = href;
        link.target = "_blank";
        link.setAttribute("role", "button");
        link.appendChild(document.createTextNode(text));
        return link;
    }  else { return null }
}

function songClick(songLink){
    var card = songLink.parentNode;
    var songTitle = card.getElementsByClassName("card-title")[0].innerText;
    var artistName = card.getElementsByClassName("card-subtitle")[0].innerText;
    var chartName = songLink.innerText;
    gtag('event', songTitle + " (" + artistName + ")", { 'event_category': 'Songs', 'event_label': chartName, 'value': 0 });
}

function assignAttributToCard(card, attributeName, attributeType, attributeValue){
    var cardBody = card.getElementsByClassName('card-body')[0];
    if ( attributeValue != '' && attributeType != '' && attributeName != '' ) {
        switch(attributeType){
            case 'URL':
            {
                var newLink = makeCardLink("btn btn-primary", attributeValue, attributeName);
                if ( newLink ) { 
                    newLink.setAttribute('onclick', "songClick(this);");
                    cardBody.appendChild( newLink ); 
                }
                break;
            }
            case 'Text':
            {
                card.getElementsByClassName('card-text')[0].appendChild(document.createTextNode(attributeValue));
                break;
            }
        }
    }
    return null;
}

function makeNewCard(songInfo){

    var card = document.createElement("div");
    card.className = "card text-center";

    var cardBody = document.createElement("div");
    cardBody.className = "card-body";
    card.appendChild(cardBody);

    var cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.appendChild(document.createTextNode(songInfo.title));
    cardBody.appendChild(cardTitle);

    var cardSubTitle = document.createElement("h6");
    cardSubTitle.className = "card-subtitle mb-2 text-muted";
    cardSubTitle.appendChild(document.createTextNode(songInfo.artist))
    cardBody.appendChild(cardSubTitle);

    var cardBodyText = document.createElement("p");
    cardBodyText.className = "card-text";
    cardBodyText.appendChild(document.createTextNode(""));
    cardBody.appendChild(cardBodyText);

    for (var key in songInfo){
        if ( ["url", "text"].indexOf(key.toLowerCase()) >= 0  ) {
            for (var item in songInfo[key]){
                assignAttributToCard(card, item, key, songInfo[key][item]);
            }
        }
    }
    return card;
}

function filterSongList(songList, searchTerm){

    var resultList = {};
    var regEx = new RegExp(searchTerm, "i");

    var keyList = Object.keys(songList)

    for (var i=0; i<keyList.length; i++) {
        var songKey = keyList[i];
        var songInfo = songList[songKey];

        if ( regEx.test(songInfo.title) || regEx.test(songInfo.artist) ) { 
            resultList[songKey] = songInfo;
        }
    }

    return resultList;
}

function RenderSongList(songList){

    var container = document.createElement('div');
    var cardsPerDeck = 3;
    var cardDeck = document.createElement("div");
    cardDeck.className = "card-deck";
    var deckCardCount = 0;

    var orderedKeys = Object.keys(songList).sort();
    for (var i=0; i<orderedKeys.length; i++) {
        var songKey = orderedKeys[i];
        var songInfo = songList[songKey];
        var card = makeNewCard(songInfo);
        var col = document.createElement("div");
        col.className = "col-sm-4";
        col.appendChild(card);
        cardDeck.appendChild(card);
        deckCardCount++;
        if ( deckCardCount == cardsPerDeck ) {
            container.appendChild(cardDeck);
            cardDeck = document.createElement("div");
            cardDeck.className = "card-deck mt-4"; // adding 'mt-4' sets top margin to seperate the rows of cards
            deckCardCount = 0;
        }
    }

    // flush any remaining cards to the container
    if ( deckCardCount != 0 ) { 
        container.appendChild(cardDeck); 
    }

    // update the DOM
    var element = document.getElementById("songcontainer");
    element.innerHTML = '';
    element.appendChild(container);

}

function getSongListFromAPI(webApiUrl){

    document.getElementById('loader').style.display = '';

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('loader').style.display = 'none';
            songListData = JSON.parse(this.responseText);
            if ( songListData ) {
                var songCount = Object.keys(songListData).length;
                if ( songCount > 0 ){
                    RenderSongList(songListData);
                    showAlert(songCount + " song(s) loaded", "alert-success");
                    document.getElementById('searchbar').style.display = '';
                } else {
                    showError("API responded, but no songs were loaded");
                    gtag('event', 'Load', { 'event_category': 'API', 'event_label': 'Warning: Empty Song List', 'value': 0 });
                }
            } else {
                showError("Failed to load the song list from API");
                gtag('event', 'Load', { 'event_category': 'API', 'event_label': 'Error: API Parse Failed', 'value': 0 });
            }
        } else {
            if (this.readyState == 4) {
                showError("Failed to load the song list from API");
                gtag('event', 'Load', { 'event_category': 'API', 'event_label': 'Error: API Request Failed', 'value': this.status });
            }
        }
    };
    xmlhttp.ontimeout = function() {
        document.getElementById('loader').style.display = 'none';
        showError("Timeout waiting for API to respond");
        gtag('event', 'Load', { 'event_category': 'API', 'event_label': 'Error: API Request Timeout', 'value': 0 });
    }
    xmlhttp.open("GET", webApiUrl, true);
    xmlhttp.timeout = 30000;
    xmlhttp.send();
}

function searchSongs(){
    var searchTerm = document.getElementById("searchInput").value
    
    if ( searchTerm ) {
        var filteredSongs = filterSongList(songListData, searchTerm);
        var filteredSongCount = Object.keys(filteredSongs).length;

        if ( filteredSongCount > 0 ) {
            RenderSongList(filteredSongs);
            showAlert("Showing " + filteredSongCount + " song(s) that match '" + searchTerm + "'", "alert-success");
            gtag('event', 'Search Hit', { 'event_category': 'Search', 'event_label': searchTerm, 'value': filteredSongCount });
        } else {
            showAlert("No songs matching '" + searchTerm + "'", "alert-warning");
            gtag('event', 'Search Miss', { 'event_category': 'Search', 'event_label': searchTerm, 'value': 0 });
        }
    } else {
        RenderSongList(songListData);
        showAlert("Showing all " + Object.keys(songListData).length + " songs.", "alert-success");
    }

}

// Global variable to hold the song list data
var songListData = {};

ready(function(){
    var apiParams = [];
    var paramList = ["nocache"];
    paramList.forEach(function(paramName) {
        var paramValue = getSearchParams(paramName);
        if ( paramValue ) { apiParams.push(paramName + "=" + paramValue) }
    });
    var fullApiUrl = apiURL;
    if ( apiParams.length > 0 ) {
        fullApiUrl += ( "?" + apiParams.join("&") )
    }
    getSongListFromAPI( fullApiUrl );
});

