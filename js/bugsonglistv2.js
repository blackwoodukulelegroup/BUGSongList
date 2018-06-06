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

function assignAttributToCard(card, attributeName, attributeType, attributeValue){
    var cardBody = card.getElementsByClassName('card-body')[0];
    if ( attributeValue != '' && attributeType != '' && attributeName != '' ) {
        switch(attributeType){
            case 'URL':
            {
                var newLink = makeCardLink("btn btn-primary", attributeValue, attributeName);
                if ( newLink ) { cardBody.appendChild( newLink ); }
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

    // iterate through properties, looking for Objects
    for (var key in songInfo){
        if ( songInfo[key].constructor.name == "Object" ) {
            // Iterate through object properties and assign card attributes accordingly
            for (var item in songInfo[key]){
                assignAttributToCard(card, item, key, songInfo[key][item]);
            }
        }
    }
    return card;
}

function RenderSongList(songList, searchTerm){

    var container = document.createElement('div');

    var regEx = new RegExp(searchTerm, "i");

    var cardsPerDeck = 3;
    var cardDeck = document.createElement("div");
    cardDeck.className = "card-deck";
    var deckCardCount = 0;
    var shownCardCount = 0;

    var orderedKeys = Object.keys(songList).sort();
    for (var i=0; i<orderedKeys.length; i++) {
        var songKey = orderedKeys[i];
        var songInfo = songList[songKey];

        searchMatch = regEx.test(songInfo.title) || regEx.test(songInfo.artist);

        if ( searchMatch ) {

            var card = makeNewCard(songInfo);
            var col = document.createElement("div");
            col.className = "col-sm-4";
            col.appendChild(card);
            shownCardCount++;

            cardDeck.appendChild(card);
            deckCardCount++;
        }

        if ( deckCardCount == cardsPerDeck ) {
            container.appendChild(cardDeck);
            cardDeck = document.createElement("div");
            cardDeck.className = "card-deck mt-4"; // adding 'mt-4' sets top margin to seperate the rows of cards
            deckCardCount = 0;
        }

    }

    // flush any remaining cards to the container
    if ( deckCardCount != 0 ) { container.appendChild(cardDeck); }

    if ( shownCardCount == 0 ) {
        container.appendChild(getAlert("No matching songs found", "alert-warning"));
    }

    // update the DOM
    var songcontainer = document.getElementById("songcontainer")
    emptyContainer(songcontainer);
    songcontainer.appendChild(container);

    document.getElementById("searchInput").disabled = false;
}

function emptyContainer(element){
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function getAlert(messageText, classNames){
    var alertDiv = document.createElement("div");
    alertDiv.className = "alert " + classNames;
    alertDiv.appendChild(document.createTextNode(messageText));
    return alertDiv;
}

function showAlert(messageText, classNames){
    var container = document.getElementById("songcontainer");
    emptyContainer(container);
    container.appendChild(getAlert(messageText, classNames));
}

function showError(errorMessage){
    showAlert(errorMessage + " Please try again later, but if the behaviour persists, please notify BUG admins.", "alert-danger");
}

function getSongListFromAPI(webApiUrl){

    showAlert("The song list is loading - please wait a moment.", "alert-primary");
    document.getElementById('searchInput').disabled = true;

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        songListData = JSON.parse(this.responseText);
        if ( songListData ) {
            RenderSongList(songListData, "");
        } else {
            showError("Failed to load the song list from API.");
        }
    } else {
        if (this.readyState == 4) {
            showError("Failed to load the song list from API.");
        }
    }
    };
    xmlhttp.open("GET", webApiUrl, true);
    xmlhttp.send();
}

function searchSongs(){
    RenderSongList(songListData, document.getElementById("searchInput").value);
}

// Global var to hold list of songs
var songListData = {};

// Make the initial call to load data from API
getSongListFromAPI("https://script.google.com/macros/s/AKfycbx-0s1grPv0Wj_wXZUDRggB7Eac_c4TGHkMQ1aNOcNv41eCeg/exec");