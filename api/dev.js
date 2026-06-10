// test function - includes lastUpdated timestamp in the google drive output data
function myFunction() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var folderID = scriptProperties.getProperty('folderID');
  var fileRegExPattern = scriptProperties.getProperty('fileRegExPattern')
  var viewLinkTemplate = scriptProperties.getProperty('viewLinkTemplate')
  // Logger.log("folder ID %s", folderID);
  
  
  var files = DriveApp.getFolderById(folderID).getFiles();
  var results = [];
  var badFileCount = 0;
  
  while ( files.hasNext() ){
    var file = files.next();
    var fileName = file.getName();
    var fileDateCreated = file.getDateCreated();
    var fileDateUpdated = file.getLastUpdated();
    
    // Logger.log("%s - %s - %s", fileName, fileDateCreated, fileDateUpdated);
    

    var match1 = fileName.match(fileRegExPattern);

    if (match1 && match1.length >= 4) {
      var fileID = file.getId();
      var fileURL = viewLinkTemplate.replace('$ID$', fileID);
      results.push( {"title":match1[1].trim(), "artist":match1[2].trim(), "attributeName":match1[3].trim(), "attributeType":"URL", "attributeValue":fileURL, "LastUpdated":file.getLastUpdated()} );
    } else {
      badFileCount++;
    }
  }
  
  if ( badFileCount > 0 ) {
    Logger.log("%s files could not be identified", badFileCount);
  }
  
  // Logger.log("%s files found", results.length);
  Logger.log(JSON.stringify(results));
  

}

function getAccesstoken() {Logger.log(ScriptApp.getOAuthToken())} // DriveApp.getFiles()

function headTest(){
  Logger.log('head test');
   var resp = UrlFetchApp.fetch("https://scorpexuke.com/pdffiles/Walk_Of_Life.pdf");
  Logger.log("Remote File Size: " + resp.getAllHeaders()["Last-Modified"]);
}