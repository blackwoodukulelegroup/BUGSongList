function ClearOldScriptProperties() {
  
  var props = PropertiesService.getScriptProperties();
  
  var keys=props.getKeys();
  
  var regEx = new RegExp("^cacheitem");
  
  keys.forEach(function(element){
    // Logger.log(element);
    if (regEx.test(element)){
      Logger.log("DELETE %s", element);
      // props.deleteProperty(element);
    }
  });
  
}



function test_GetBadFiles(){
  
  var folderID = PropertiesService.getScriptProperties().getProperty("folderID");
  var regExPattern = PropertiesService.getScriptProperties().getProperty("fileRegExPattern");
  var viewLinkTemplate = PropertiesService.getScriptProperties().getProperty("viewLinkTemplate");
  
  var badFiles = GetFilesWithUnparseableNames(folderID, regExPattern, viewLinkTemplate);
  if ( badFiles ) {
    Object.keys(badFiles).forEach(function(element){
      Logger.log("Filename: %s  URL: %s",element, badFiles[element]);                      
    });
  }
  if ( badFiles ) { 
    var badFileCount = Object.keys(badFiles).length;
  } else { 
    var badFileCount = 0 
  }
  Logger.log("Get Bad Files - found " + badFileCount + " bad files");
  
  var jsonOutput = JSON.stringify(badFiles);
  Logger.log(jsonOutput);
  
}

// https://script.google.com/macros/s/AKfycbwU0YwFnwGdrGJlNKnwUsP8qCE8r7zGujtbDa66HA/dev?command=getbadfiles
