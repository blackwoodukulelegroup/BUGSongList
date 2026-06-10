
function saveToCache(cache, id, objectToCache){
 
  if ( cache && objectToCache ) {
    
    // Make a copy of incoming object
    var copyOfObject = JSON.parse(JSON.stringify(objectToCache));
    
    // JSON encode all property values
    Object.keys(copyOfObject).forEach(function(key){
      copyOfObject[key] = JSON.stringify(copyOfObject[key]);
    })
  
    cache.put("__keyList__" + id, JSON.stringify(Object.keys(copyOfObject)));
    cache.putAll(copyOfObject);
    
  }
}

function getFromCache(cache, id){
  
  if ( cache && id ) {
    var keyList = JSON.parse(cache.get("__keyList__" + id));
    if ( keyList ) {
      var resultObject = cache.getAll(keyList);
      Object.keys(resultObject).forEach(function(key){
        resultObject[key] = JSON.parse(resultObject[key]);
      })
      return resultObject;
    }
  }
  return null;
}

function flushCache(cache, id){
  if (cache && id) {
    var keyName = "__keyList__" + id
    var keyList = JSON.parse(cache.get(keyName));
    if ( keyList ) {
      cache.removeAll(keyList);
      cache.remove(keyName);
    } 
  }
}

function test_fillCache(){

  var scriptProperties = PropertiesService.getScriptProperties();
  
  var config = {
    spreadsheetID: scriptProperties.getProperty('spreadsheetID'), // ID for Google Sheet holding chord chart links
    songListSheetName: scriptProperties.getProperty('songListSheetName'),   // Name of worksheet in the Google Sheet
    folderID: scriptProperties.getProperty('folderID'), // ID for Google Drive folder holding chord charts
    viewLinkTemplate: scriptProperties.getProperty('viewLinkTemplate'), // Template, used to create URL links to file in the Google Drive folder
    fileRegExPattern: scriptProperties.getProperty('fileRegExPattern')   // Regular Expression pattern used to parse filenames in Google Drive folder
  }
  
  var combinedLinkSet = buildCombinedLinkSet(config);
  
  var cache = CacheService.getScriptCache();

  var tStart = new Date;
  
  saveToCache(cache, "links", combinedLinkSet);
 
  var tEnd = new Date;
  
  var tElapsed = tEnd - tStart
  Logger.log(Object.keys(combinedLinkSet).length + " rows in " + tElapsed + " milliseconds");
  
}

function test_readCache(){
  
  tStart = new Date;
  var cache = CacheService.getScriptCache();

  object = getFromCache(cache, "links")
  
  tEnd = new Date;
  
  tElapsed = tEnd - tStart
  Logger.log(Object.keys(object).length + " rows in " + tElapsed + " milliseconds");
}

function test_flushCache(){
  tStart = new Date;
  var cache = CacheService.getScriptCache();

  flushCache(cache, "links");
  
  object = getFromCache(cache, "links");
  
  if ( object ) {
    Logger.log("ERROR: cache NOT emptied");
  } else {
    Logger.log("OK: cache appears empty");
  }
  
  tEnd = new Date;
  
  tElapsed = tEnd - tStart

}


