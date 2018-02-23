(function () {
  
  const remote = require('electron').remote
  const window = remote.getCurrentWindow();
  const {BrowserWindow} = remote
  const settings = require('electron-settings')
  const clipBoard = require('electron').clipboard
  let mainWindow
  let contents
  BrowserWindow.getAllWindows().forEach(find_main_window)

  function init() {
    document.querySelector("body").addEventListener("click", function (e) {
      window.close();
    });

    setTimeout(function(){
      window.close()
    }, 15000);

    contents.executeJavaScript('scrap()').then((result) => {
      message = result[2].join('\n')
      if(settings.get('alert_type') === 'errors_only'){
        html = result[0]
      } else {
        html = result[0] + result[1]
      }
      if(html || message){
        document.querySelector("#html tbody").innerHTML = html;
        if(settings.get('auto_copy') !== false){
          clipBoard.writeText(message)
        }
      }
    })
  }; 
  
  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      init(); 
    }
  };

  function find_main_window(cur_window, _i){
    if(cur_window.getTitle() == "Scout"){
      mainWindow = cur_window
      contents = mainWindow.webContents
    }
  }

})();