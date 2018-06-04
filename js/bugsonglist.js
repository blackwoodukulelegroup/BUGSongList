function makeCardLink(className, href, text){
    if ( href != '' ) {
        var link = document.createElement("button");
        link.className = className + ' ml-1 mt-1';
        link.href = href;
        link.target = "_blank";
        link.type = "button"
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

function makeNewCard(element){

    var card = document.createElement("div");
    card.className = "card text-center";
    // card.style = "width:18rem;";

    var cardBody = document.createElement("div");
    cardBody.className = "card-body";
    card.appendChild(cardBody);

    var cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.appendChild(document.createTextNode(element.gsx$title.$t));
    cardBody.appendChild(cardTitle);

    var cardSubTitle = document.createElement("h6");
    cardSubTitle.className = "card-subtitle mb-2 text-muted";
    cardSubTitle.appendChild(document.createTextNode(element.gsx$artist.$t))
    cardBody.appendChild(cardSubTitle);

    var cardBodyText = document.createElement("p");
    cardBodyText.className = "card-text";
    cardBodyText.appendChild(document.createTextNode(""));
    cardBody.appendChild(cardBodyText);

    assignAttributToCard(card, element.gsx$attributename.$t, element.gsx$attributetype.$t, element.gsx$attributevalue.$t);

    return card;
}

function makeid(idLength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < idLength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
    }

function loadData(songData){
    var container = document.getElementById('songcontainer');
    var songMap = {};
    var cardsPerDeck = 3;

    var cardDeck = document.createElement("div");
    cardDeck.className = "card-deck";
    var deckCardCount = 0;

    var feedArray = songData.feed.entry;

    feedArray.sort(function(a,b) {return (a.gsx$title.$t > b.gsx$title.$t) ? 1 : ((b.gsx$title.$t > a.gsx$title.$t) ? -1 : 0);} );

    feedArray.forEach(element => {

        console.info("Title:", element.gsx$title.$t, "Artist:", element.gsx$artist.$t, "Attribute:", element.gsx$attributename.$t, "Type:", element.gsx$attributetype.$t, "Value:", element.gsx$attributevalue.$t);

        var songKey = element.gsx$title.$t + "-" + element.gsx$title.$t;
        var cardId = songMap[songKey];

        
        if ( cardId == null ) {
            // create a new card
            cardId = makeid(16);
            console.info("Created Card ID", cardId)
            songMap[songKey] = cardId;
            card = makeNewCard(element);
            card.id = cardId; 
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

        } else {
            // find the existing card, either in the DOM, or current card deck
            console.info("Looking up card ID", cardId);
            card = document.getElementById(cardId) || cardDeck.children.namedItem(cardId);
            if ( card != null ) {
                assignAttributToCard(card, element.gsx$attributename.$t, element.gsx$attributetype.$t, element.gsx$attributevalue.$t);
            } else {
                console.log("ERROR: Could not located existing card for " + element.gsx$title.$t);
            }
        }
        
    });
    
    // flush any remaining cards to the DOM
    if ( deckCardCount != 0 ) { container.appendChild(cardDeck); }
}