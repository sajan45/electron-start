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
      if(settings.get('alert_type') === 'errors_only'){
        if(result[0].length > 0){
          html = result[0]
        } else {
          // shows warnings if only errors alert is selected but there is no
          // error alert, to avoid confusion due to blank notification window
          html = result[1]
        }
        message = result[2].errors.join('\n')
      } else {
        html = result[0] + result[1]
        message = result[2].errors.join('\n') + '\n'
        message += result[2].warnings.join('\n')
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