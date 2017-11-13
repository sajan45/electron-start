(function () {
      
  const remote = require('electron').remote; 
  
  function init() {     
    document.querySelector("body").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow();
      window.close();
    }); 
  }; 
  
  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      init(); 
    }
  };
})();