(function () {
      
  const remote = require('electron').remote; 
  const settings = require('electron-settings')
  const window = remote.getCurrentWindow();

  let interval = settings.get('interval')
  
  if(!interval){
    settings.set('interval', 5)
  }

  function init() {

    document.querySelector("#save").addEventListener("click", function (e) {
      var new_interval = document.querySelector("#time").value
      settings.set('interval', new_interval)
      window.hide();
    }); 

    document.querySelector("#cancel").addEventListener("click", function (e) {
      document.querySelector("#time").value = settings.get('interval')
      window.hide();
    });
  }; 
  
  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      init(); 
    }
  };
})();