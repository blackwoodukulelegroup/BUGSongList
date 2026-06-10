function setScriptProperties() {

  var scriptProps = PropertiesService.getScriptProperties();

  var props = scriptProps.getProperties()

  // display existing props

  for (var prop in props) {
    Logger.log('scriptProps.setProperty("%s", "%s")', prop, props[prop]);
  }

  // scriptProps.setProperty("logSpreadsheetID", "18IRbJfnJe9dyi2URwOYasJDqdWuEI1L5xPWkJsj7k-g");
  
}
