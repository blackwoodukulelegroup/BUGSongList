function generateID(length) {
  
    var text = ""
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

    for(var i = 0; i < length; i++)  {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }

    return text
}

function openLog(spreadsheetID, sheetName){
  
  var logSpreadsheet = SpreadsheetApp.openById(spreadsheetID);
  var logSheet = logSpreadsheet.getSheetByName(sheetName);
  return {log: logSheet, sessionID: generateID(8)};

}

function logIt(logSheet, eventInfo, detail) {
  
  if ( logSheet && eventInfo ) {
    var d = new Date();
    logSheet.log.appendRow([d.toLocaleString(), logSheet.sessionID, eventInfo, detail]);
    Logger.log("%s, %s", eventInfo, detail);
  } else {
    Logger.log(eventInfo + ": " + detail);
  }
}

function testLog(){

  var scriptProperties = PropertiesService.getScriptProperties();
  var logSpreadsheetID = scriptProperties.getProperty('logSpreadsheetID');
  var logSheetName = scriptProperties.getProperty('logSheetName');
  
  var log = openLog(logSpreadsheetID, logSheetName);

  logIt(log, "test event 1", "test detail");
  logIt(log, "test event 2", "test detail");
  

}
