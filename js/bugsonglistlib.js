function getAlert(messageText, classNames){
    var alertDiv = document.createElement("div");
    alertDiv.className = "alert " + classNames;
    alertDiv.appendChild(document.createTextNode(messageText));
    return alertDiv;
}

function showAlert(messageText, classNames){
    $("#alertDiv").empty().append(getAlert(messageText, classNames));
}

// message: {preLinkText, postLinkText}
// link: {href, title, text, target}
function showLinkAlert(message, link, classNames){
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
    $("#alertDiv").empty().append(alertDiv);
}

function showError(errorMessage){
    _LTracker.push({'event':'error', 'data':errorMessage});
    showAlert(errorMessage + " Please try again later, but if the behaviour persists, please notify BUG admins.", "alert-danger");
}