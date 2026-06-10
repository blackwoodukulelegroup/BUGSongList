function doGet(e) {

  var tStart = new Date();
  var scriptProperties = PropertiesService.getScriptProperties();
  //var scriptPropertyData = scriptProperties.getProperties();
  //for (var key in scriptPropertyData) {
  //  Logger.log('Key: %s, Value: %s', key, scriptPropertyData[key]);
  //}

  var logSpreadsheetID = scriptProperties.getProperty('logSpreadsheetID');
  Logger = useSpreadsheet(logSpreadsheetID);

  // var logSheetName = scriptProperties.getProperty('logSheetName');
  // var logFolderID = scriptProperties.getProperty('logFolderID');

  var paramFlushCache = false;

  var paramCommand = "";
  var noCache = false;
  if (e && e.parameter) {
    paramCommand = e.parameter["command"];
    noCache = (Number(e.parameter["nocache"]) > 0);
  }

  if (paramCommand == "flushcache") {

    Logger.log("Flush Cache");

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

  if (paramCommand == "getbadfiles") {
    var badFiles = getFilesWithUnparseableNames(config.folderID, config.fileRegExPattern, config.viewLinkTemplate);
    var badFileCount = badFiles ? Object.keys(badFiles).length : 0;
    
    Logger.log("Get Bad Files returning " + badFileCount + " rows");

    var jsonOutput = JSON.stringify(badFiles);
    return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);
  }

  var combinedLinkSet = getCombinedLinkSet(scriptProperties, config, noCache);

  var jsonOutput = JSON.stringify(combinedLinkSet);

  var tEnd = new Date();
  var tResponse = (tEnd - tStart);
  
  Logger.log("SongList returning " + Object.keys(combinedLinkSet).length + " rows in " + tResponse + " milliseconds");

  return ContentService.createTextOutput(jsonOutput).setMimeType(ContentService.MimeType.JSON);
}
