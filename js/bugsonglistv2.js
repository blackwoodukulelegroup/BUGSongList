function makeCardLink(className, href, text){
    if ( href != '' ) {
        var link = document.createElement("a");
        link.className = className + ' ml-1 mt-1';
        link.href = href;
        link.target = "_blank";
        // link.type = "button"
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
                card.getElementsByClassName('card-text')[0].innerText = attributeValue;
                break;
            }
        }
    }
    return null;
}

function makeNewCard(songName, songInfo){

    var card = document.createElement("div");
    card.className = "card text-center";
    // card.style = "width:18rem;";

    var cardBody = document.createElement("div");
    cardBody.className = "card-body";
    card.appendChild(cardBody);

    var cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.appendChild(document.createTextNode(songName));
    cardBody.appendChild(cardTitle);

    var cardSubTitle = document.createElement("h6");
    cardSubTitle.className = "card-subtitle mb-2 text-muted";
    cardSubTitle.appendChild(document.createTextNode(songInfo.artist))
    cardBody.appendChild(cardSubTitle);

    var cardBodyText = document.createElement("p");
    cardBodyText.className = "card-text";
    cardBodyText.appendChild(document.createTextNode(""));
    cardBody.appendChild(cardBodyText);

    if ( songInfo["URL"] ) {
        for ( item in songInfo["URL"] ){
            console.log(item + ': ' + songInfo["URL"][item]);
            assignAttributToCard(card, item, "URL", songInfo["URL"][item]);
        }
    }

    if ( songInfo["Text"] ) {
        for ( item in songInfo["Text"] ){
            console.log(item + ': ' + songInfo["Text"][item]);
            assignAttributToCard(card, item, "Text", songInfo["Text"][item]);
        }
    }
    
    return card;
}

function RenderSongList(songList){

    var container = document.createElement("div")

    var cardsPerDeck = 3;
    var cardDeck = document.createElement("div");
    cardDeck.className = "card-deck";
    var deckCardCount = 0;

    var orderedKeys = Object.keys(songList).sort();
    for (var i=0; i<orderedKeys.length; i++) {
        var songName = orderedKeys[i];
        var songInfo = songList[songName];
        console.log(songName + ' -> ' + songInfo.artist);

        var card = makeNewCard(songName, songInfo);
        var col = document.createElement("div");
        col.className = "col-sm-4";
        col.appendChild(card);

        // add the card to the deck
        cardDeck.appendChild(card);
        deckCardCount++;
        if ( deckCardCount == cardsPerDeck ) {
            container.appendChild(cardDeck);
            cardDeck = document.createElement("div");
            cardDeck.className = "card-deck mt-4"; // adding 'mt-4' sets top margin to seperate the rows of cards
            deckCardCount = 0;
        }
        
    }

    // flush any remaining cards to the DOM
    if ( deckCardCount != 0 ) { container.appendChild(cardDeck); }

    document.getElementById("songcontainer").innerHTML = container.innerHTML;

}

var webapi = "https://script.google.com/macros/s/AKfycbx-0s1grPv0Wj_wXZUDRggB7Eac_c4TGHkMQ1aNOcNv41eCeg/exec";
var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myObj = JSON.parse(this.responseText);
        RenderSongList(myObj);
    }
};
xmlhttp.open("GET", webapi, true);
xmlhttp.send();