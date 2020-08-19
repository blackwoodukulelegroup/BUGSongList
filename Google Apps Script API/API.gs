
function getLinksFromSpreadsheet(docID, sheetName){
  
  var doc = SpreadsheetApp.openById(docID);
  var sheet = doc.getSheetByName(sheetName);
  var sheetRange = sheet.getDataRange();
  var rangeRows = sheetRange.getHeight();
  var sheetValues = sheetRange.getValues();
  
  var results = [];
  for (i=1; i<rangeRows; i++) {
    results.push( { "title":sheetValues[i][0], "artist":sheetValues[i][1], "attributeName":sheetValues[i][2], "attributeType":sheetValues[i][3], "attributeValue":sheetValues[i][4] } );
  }
  
  return results;
}

function getLinksFromDrive(folderID, fileRegExPattern, viewLinkTemplate){
  
  var files = DriveApp.getFolderById(folderID).getFiles();
  var results = [];
  var badFileCount = 0;
  
  while ( files.hasNext() ){
    var file = files.next();
    var fileName = file.getName();

    var match1 = fileName.match(fileRegExPattern);

    if (match1 && match1.length >= 4) {
      var fileID = file.getId();
      var fileURL = viewLinkTemplate.replace('$ID$', fileID);
      // results.push( {"title":match1[1].trim(), "artist":match1[2].trim(), "attributeName":match1[3].trim(), "attributeType":"URL", "attributeValue":fileURL } );
      results.push( {"title":match1[1].trim(), "artist":match1[2].trim(), "attributeName":match1[3].trim(), "attributeType":"URL", "attributeValue":fileURL, "lastUpdated":file.getLastUpdated()} );
    } else {
      badFileCount++;
    }
  }
  
  if ( badFileCount > 0 ) {
    Logger.log("%s files could not be identified", badFileCount);
  }
  
  return results;
}


// old output format
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

// new output format
// { (song name in lower case): { 
//                  "title" : (Song Name)
//                  , "artist":(Artist Name)
//                  , URL: { (Description):{ "URL": (URL), "LastUpdated": (date) }
//                  [. URL: { (Description):{ "URL": (URL), "LastUpdated": (date) } ]
//                  , Text: { "Notes":(Text note) } 
//                },
//   ...
// }


function transformResults(inputList){
  
  var results = { };
  
  for (var i=0; i<inputList.length; i++){
    var inItem = inputList[i];
    
    // 19/08/20 - modified keyName such that all non-alpha is stripped out
    var keyName = inItem.title.toLowerCase().replace(/\W/g,'') + '_' + inItem.artist.toLowerCase().replace(/\W/g,'');
    
    // 19/08/20 - keyName change broke sort order in song list page - this line adds the '!' back to so that songs can be prioritised
    if (inItem.title.trim().match("^!")) keyName = "!" + keyName;
    
    // 19/08/20 - following fix checks for '{' and re-adds at beginning of key
    if (inItem.title.trim().match("^{.*}$")) keyName = "{" + keyName + "}";
    
    var outItem = results[keyName];
    // Logger.log(inItem.title);
    if ( ! outItem ) {
      results[keyName] = { title:inItem.title, artist:inItem.artist }
      var outItem = results[keyName];
    }
    if ( ! outItem[inItem.attributeType] ) {
      outItem[inItem.attributeType] = {};
    }
    switch(inItem.attributeType.toLowerCase()){
      case "url":
        outItem[inItem.attributeType][inItem.attributeName] = { "URL": inItem.attributeValue, "LastUpdated": inItem.lastUpdated }
        break;
      default:
        outItem[inItem.attributeType][inItem.attributeName] = inItem.attributeValue
        break;
    }
  }
  return results;
}

// build new compound object
function buildCombinedLinkSet(config){

  // Get list of links in spreadsheet
  var spreadsheetLinks = getLinksFromSpreadsheet(config.spreadsheetID, config.songListSheetName)
  Logger.log("Retrieved " + spreadsheetLinks.length + " entries from spreadsheet");
  
  // Get list of links to files in drive folder
  var driveLinks = getLinksFromDrive(config.folderID, config.fileRegExPattern, config.viewLinkTemplate);
  Logger.log("Retrieved " + driveLinks.length + " entries from drive folder");
  
  // Combine the results  
  var allLinks = spreadsheetLinks.concat(driveLinks)
    
  Logger.log("Total result count " + allLinks.length);
  
  // Transform the results so that links are grouped by Song Title
  var linkObject = transformResults(allLinks);
  
  Logger.log("Transformed data contains " + Object.keys(linkObject).length + " rows");
  
  return linkObject;
}

function getCombinedLinkSet(props, config, noCache){
  
  var cache = CacheService.getScriptCache();
  
  var combinedLinkSet = null;
  
  if ( ! noCache ) {
    var combinedLinkSet = getFromCache(cache, "links");
  }
  
  if ( combinedLinkSet ) {
    Logger.log("Loaded %s rows from cache", Object.keys(combinedLinkSet).length);
  } else {
    combinedLinkSet = buildCombinedLinkSet(config);
    saveToCache(cache, "links", combinedLinkSet);
    props.setProperty("lastCacheTime", (new Date()));
  }
  
  return combinedLinkSet;
}

function GetFilesWithUnparseableNames(folderID, fileRegExPattern, viewLinkTemplate){
  
  var files = DriveApp.getFolderById(folderID).getFiles();
  var results = {};
  
  while ( files.hasNext() ){
    var file = files.next();
    var fileName = file.getName();

    var match1 = fileName.match(fileRegExPattern);

    if (match1 && match1.length >= 4) {
      // file is good - no action required
    } else {
      var fileURL = viewLinkTemplate.replace('$ID$', file.getId());
      results[fileName] = fileURL;
    }
  }
  
  return results;
}

function doGet(e) {
  
  var tStart = new Date();
  var scriptProperties = PropertiesService.getScriptProperties();
  //var scriptPropertyData = scriptProperties.getProperties();
  //for (var key in scriptPropertyData) {
  //  Logger.log('Key: %s, Value: %s', key, scriptPropertyData[key]);
  //}
  
  // var logSpreadsheetID = scriptProperties.getProperty('logSpreadsheetID');
  // var logSheetName = scriptProperties.getProperty('logSheetName');
  // var log = null;
  // var log = openLog(logSpreadsheetID, logSheetName);
  
  var logFolderID = scriptProperties.getProperty('logFolderID');
  var log = new LogToGoogleDoc(logFolderID,'API Log.' + new Date().getFullYear());

  var paramFlushCache = false;
  
  var paramCommand = "";
  var noCache = false;
  if (e && e.parameter) {
    paramCommand = e.parameter["command"];
    noCache = ( Number(e.parameter["nocache"]) > 0 );
  }
  
  if ( paramCommand == "flushcache" ) { 
    
    // logIt(log, "API Command", "Flush Cache");
    log.append("API Command: Flush Cache");
    
    var cache = CacheService.getScriptCache();
    flushCache(cache, "links");
    
    return ContentService.createTextOutput("The API cache has been flushed.").setMimeType(ContentService.MimeType.TEXT);
  }
  
  var config = {
    spreadsheetID: scriptProperties.getProperty('spreadsheetID'), // ID for Google Sheet holding chord chart links
    songListSheetName: scriptProperties.getProperty('songListSheetName'),   // Name of worksheet in the Google Sheet
    folderID: scriptProperties.getProperty('folderID'), // ID for Google Drive folder holding chord charts
    viewLinkTemplate: scriptProperties.getProperty('viewLinkTemplate'), // Template, used to create URL links to file in the Google Drive folder
    fileRegExPattern: scriptProperties.getProperty('fileRegExPattern')   // Regular Expression pattern used to parse filenames in Google Drive folder
  }

  if ( paramCommand == "getbadfiles" ){
    var badFiles = GetFilesWithUnparseableNames(config.folderID, config.fileRegExPattern, config.viewLinkTemplate);
    if ( badFiles ) { var badFileCount = Object.keys(badFiles).length } else { var badFileCount = 0 }
    // logIt(log, "API Request", "Bad Files: Returning " + badFileCount + " rows");
    log.append("API Request: Bad Files: Returning " + badFileCount + " rows");
    var jsonOutput = JSON.stringify(badFiles);
    return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);
  }
  
  var combinedLinkSet = getCombinedLinkSet(scriptProperties, config, noCache);
  
  var jsonOutput = JSON.stringify(combinedLinkSet);
  
  var tEnd = new Date();
  var tResponse = (tEnd - tStart)
  // logIt(log, "API Request", "Song List: Returning " + Object.keys(combinedLinkSet).length + " rows in " + tResponse + " milliseconds");
  log.append("API Request: Song List: Returning " + Object.keys(combinedLinkSet).length + " rows in " + tResponse + " milliseconds");
  
  log.close();
  
  return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);

}

  

