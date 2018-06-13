function showBadFiles(badFiles){
    var list = document.getElementById("badfilelist");
    Object.keys(badFiles).forEach(function(element){
        var link = document.createElement("A");
        link.appendChild(document.createTextNode(element))
        link.setAttribute("href", badFiles[element]);
        var listItem = document.createElement("LI");
        listItem.appendChild(link);
        list.appendChild(listItem);
    });
    $("#badfiles").show();
}

function getBadFileCount(webApiUrl){
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var badFiles = JSON.parse(this.responseText);
            if ( badFiles ) {
                var badFileCount = Object.keys(badFiles).length;
                if ( badFileCount == 0 ){
                    showAlert("Files in the BUG folder are all correctly named.", "alert-success");
                } else {
                    showLinkAlert(  {   preLinkText:'WARNING! There are ' + badFileCount + ' file(s) in the BUG folder with name(s) in the wrong format. Click ',
                                        postLinkText:' to review them.'}, 
                                    {   href: '#badfiles',
                                        title: 'Bad Files',
                                        text: 'here',
                                        target: '_self' },
                                      "alert-warning");
                    showBadFiles(badFiles);
                }
            } else {
                showError("Unable to determine if all the files in the BUG folder are correctly named.", "alert-danger");
            }
        } else {
            if (this.readyState == 4) {
                showError("Unable to determine if all the files in the BUG folder are correctly named.", "alert-danger");
            }
        }
    };
    xmlhttp.ontimeout = function() {
        showError("Timeout waiting for API to respond.");
    }
    xmlhttp.open("GET", webApiUrl, true);
    xmlhttp.timeout = 30000;
    xmlhttp.send();
}