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
      results.push({
        "title":match1[1].trim(), 
        "artist":match1[2].trim(), 
        "attributeName":match1[3].trim(), 
        "attributeType":"URL", 
        "attributeValue":fileURL, 
        "lastUpdated":file.getLastUpdated(), 
        "localChart": { "id": file.getId(), "fileName": fileName }
      });
    } else {
      badFileCount++;
    }
  }
  
  if ( badFileCount > 0 ) {
    Logger.log("%s files could not be identified", badFileCount);
  }
  
  return results;
}

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
        outItem[inItem.attributeType][inItem.attributeName] = { "URL": inItem.attributeValue, "LastUpdated": inItem.lastUpdated, "LocalChart": inItem.localChart }
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

function getFilesWithUnparseableNames(folderID, fileRegExPattern, viewLinkTemplate){
  
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



  

