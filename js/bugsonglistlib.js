function getAlert(messageText, classNames){
    var alertDiv = document.createElement("div");
    alertDiv.className = "alert " + classNames;
    alertDiv.appendChild(document.createTextNode(messageText));
    return alertDiv;
}

function showAlert(messageText, classNames){
    var element = document.getElementById("alertDiv");
    element.innerHTML = "";
    element.appendChild(getAlert(messageText, classNames));
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
    var element = document.getElementById("alertDiv");
    element.innerHTML = '';
    element.appendChild(alertDiv);
}

function showError(errorMessage){
    showAlert(errorMessage + " Please try again later, but if the behaviour persists, please notify BUG admins.", "alert-danger");
}

function getSearchParams(k){
    var p={};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(s,k,v){p[k]=v})
    return k?p[k]:p;
}

function ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }