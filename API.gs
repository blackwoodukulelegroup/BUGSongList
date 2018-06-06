function getLinksFromSpreadsheet(docID, sheetName){
  
  var doc = SpreadsheetApp.openById(docID);
  var sheet = doc.getSheetByName(sheetName);
  var sheetRange = sheet.getDataRange();
  var sheetValues = sheetRange.getValues();
  
  var results = [];
  for (i=1; i<sheetRange.getHeight() - 1; i++) {
    results.push( { "title":sheetValues[i][0], "artist":sheetValues[i][1], "attributeName":sheetValues[i][2], "attributeType":sheetValues[i][3], "attributeValue":sheetValues[i][4] } );
  }
  
  return results;
}

function getLinksFromDrive(folderID, fileRegExPattern, viewLinkTemplate){
  
  var files = DriveApp.getFolderById(folderID).getFiles();
  var results = [];
  
  while ( files.hasNext() ){
    var file = files.next();
    var fileName = file.getName();

    var match1 = fileName.match(fileRegExPattern);

    if (match1 && match1.length >= 4) {
      var fileID = file.getId();
      var fileURL = viewLinkTemplate.replace('$ID$', fileID);
      results.push( {"title":match1[1].trim(), "artist":match1[2].trim(), "attributeName":match1[3].trim(), "attributeType":"URL", "attributeValue":fileURL} );
    } else {
      Logger.log('** Filename could not be parsed: ' + fileName);
    }
  }
  
  return results;
}


// output format
// { (song name in lower case): { 
//                  "title" : (Song Name)
//                  "artist":(Artist Name), 
//                  URL: { (Description):(URL),
//                         ... 
//                       },
//                  Text: { "Notes":(Text note) } 
//                },
//   ...
// }

function transformResults(inputList){
  
  var results = {};
  
  for (var i=0; i<inputList.length; i++){
    var inItem = inputList[i];
    var keyName = inItem.title.toLowerCase();
    var outItem = results[keyName];
    if ( ! outItem ) {
      results[keyName] = { title:inItem.title, artist:inItem.artist }
      var outItem = results[keyName];
    }
    if ( ! outItem[inItem.attributeType] ) {
      outItem[inItem.attributeType] = {};
    }
    outItem[inItem.attributeType][inItem.attributeName] = inItem.attributeValue;
  }
  return results;
}

function doGet() {
  
  var scriptProperties = PropertiesService.getScriptProperties();
  var scriptPropertyData = scriptProperties.getProperties();
  for (var key in scriptPropertyData) {
    Logger.log('Key: %s, Value: %s', key, scriptPropertyData[key]);
  }
  
  // ID for Google Sheet holding chord chart links
  var spreadsheetID = scriptProperties.getProperty('spreadsheetID');
  
  // Name of worksheet in the Google Sheet
  var songListSheetName = scriptProperties.getProperty('songListSheetName');
  
  // ID for Google Drive folder holding chord charts
  var folderID = scriptProperties.getProperty('folderID');
  
  // Template, used to create URL links to file in the Google Drive folder
  var viewLinkTemplate = scriptProperties.getProperty('viewLinkTemplate');
  
  // Regular Expression pattern used to parse filenames in Google Drive folder
  var fileRegExPattern = scriptProperties.getProperty('fileRegExPattern');

  // Get list of links in spreadsheet
  var spreadsheetLinks = getLinksFromSpreadsheet(spreadsheetID, songListSheetName)
  Logger.log("Retrieved " + spreadsheetLinks.length + " entries from spreadsheet");
  
  // Get list of links to files in drive folder
  var driveLinks = getLinksFromDrive(folderID, fileRegExPattern, viewLinkTemplate);
  Logger.log("Retrieved " + driveLinks.length + " entries from drive folder");
  
  // Combine the results  
  var allLinks = spreadsheetLinks.concat(driveLinks)
  
  Logger.log("Total result count " + allLinks.length);
  
  // Transform the results so that links are grouped by Song Title
  var linkObject = transformResults(allLinks);
  
  Logger.log("Transformed data:");
  Logger.log(Object.keys(linkObject).length);
    
  var jsonOutpus = JSON.stringify(linkObject);
  
  return ContentService.createTextOutput(jsonOutpus)
    .setMimeType(ContentService.MimeType.JSON);

}

  

