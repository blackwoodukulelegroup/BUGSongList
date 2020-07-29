function LogToGoogleDoc(folderID, logName) {
  
  var folder = DriveApp.getFolderById(folderID);
  if ( ! folder ) { return null; }
  
  var files = folder.getFilesByName(logName);
  if ( ! files ) { return null; }
  
  if ( files.hasNext() ) {
    while ( files.hasNext() ) {
      var logFile = files.next();
    }  
  } else {
    var tempName = logName + '_temporary_file_' + new Date();
    Logger.log(tempName);
    var doc = DocumentApp.create(tempName);
    if ( doc ) {
      var logFile = DriveApp.getFileById(doc.getId());
      var oldFolder = logFile.getParents().next();
      folder.addFile(logFile);
      oldFolder.removeFile(logFile);
      doc.setName(logName);
      var docBody = doc.getBody();
      var style = {};
      style[DocumentApp.Attribute.FONT_FAMILY] = 'Courier New';
      style[DocumentApp.Attribute.FONT_SIZE] = 10;
      docBody.setAttributes(style);
      docBody.setMarginBottom(5);
      docBody.setMarginLeft(5);
      docBody.setMarginRight(5);
      docBody.setMarginTop(5);
      docBody.setText('Created on ' + new Date());
      doc.saveAndClose();
    } else {
      return null;
    }
  }
  
  if ( ! logFile ) { return null; }

  this.logFileID = logFile.getId();
  this.logDoc = null;
  
  this.append = function(message){
    if ( ! this.logDoc ) {
      this.logDoc = DocumentApp.openById(this.logFileID);
    }
    this.logDoc.getBody().appendParagraph(new Date().toLocaleString() + ' ' + message);
  }
  
  this.close = function(){
    if ( this.logDoc ) {
      this.logDoc.saveAndClose();
      this.logDoc = null;
    }
  }
}
