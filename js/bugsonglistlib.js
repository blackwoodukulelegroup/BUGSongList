function showDiv(divID, showStatus){
    var x = document.getElementById(divID);
    if ( x ) {
        if ( showStatus ) {
            x.style.display = "block";
        } else {
            x.style.display = "none";
        }
    }
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
    var container = document.getElementById("alertDiv");
    emptyContainer(container);
    container.appendChild(getAlert(messageText, classNames));
}

// message: {preLinkText, postLinkText}
// link: {href, title, text, target}
function showLinkAlert(message, link, classNames){
    var container = document.getElementById("alertDiv");
    emptyContainer(container);
    var a = document.createElement("a");
    a.href = link.href;
    a.title = link.title;
    a.target = link.target;
    a.class = "alert-link";
    a.appendChild(document.createTextNode(link.text));
    var alertDiv = document.createElement("div");
    alertDiv.className = "alert " + classNames;
    alertDiv.appendChild(document.createTextNode(message.preLinkText));
    alertDiv.appendChild(a);
    alertDiv.appendChild(document.createTextNode(message.postLinkText));
    container.appendChild(alertDiv);
}

function hideAlert(){
    emptyContainer(document.getElementById("alertDiv"));
}

function showError(errorMessage){
    _LTracker.push({'event':'error', 'data':errorMessage});
    showAlert(errorMessage + " Please try again later, but if the behaviour persists, please notify BUG admins.", "alert-danger");
}