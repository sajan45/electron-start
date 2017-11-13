const electron = require('electron')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog
const Menu = electron.Menu

const path = require('path')
const url = require('url')
const clipBoard = electron.clipboard
const settings = require('electron-settings');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let notification_window
let contents
let message = ""

let $ = require('jquery');

const template = [
  {
    label: 'Settings',
    submenu: [
      {
        label: 'Auto Copy',
        submenu: [
          {
            label: "Deactivate",
            accelerator: 'CmdOrCtrl+D',
            enabled: (settings.get('auto_copy') !== false),
            click: function (item, focusedWindow) {
              settings.set('auto_copy', false)
              menu.items[1].submenu.items[0].submenu.items[0].enabled = false
              menu.items[1].submenu.items[0].submenu.items[1].enabled = true
              dialog.showMessageBox({
                type: 'info',
                message: 'Success!',
                detail: 'Auto Copy disabled.',
                buttons: ['OK']
              })
            }
          },
          {
            label: "Activate",
            accelerator: 'CmdOrCtrl+E',
            enabled: (settings.get('auto_copy') === false),
            click: function () {
              settings.set('auto_copy', true)
              menu.items[1].submenu.items[0].submenu.items[1].enabled = false
              menu.items[1].submenu.items[0].submenu.items[0].enabled = true
              dialog.showMessageBox({
                type: 'info',
                message: 'Success!',
                detail: 'Auto Copy Enabled.',
                buttons: ['OK']
              })
            }
          }
        ]
      }
    ]
  }]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  })
}
const menu = Menu.buildFromTemplate(template)

function analyze() {
  notification_window = new BrowserWindow(
  {
    width: 508,
    height: 300,
    frame: false,
    x: 10,
    y: 50,
    alwaysOnTop: true,
    backgroundColor: "#34495E" // not working probably
  })
  notification_window.on('close', function () { notification_window = null })
  
  notification_window.loadURL(url.format({
    pathname: path.join(__dirname, 'notification.html'),
    protocol: 'file:',
    slashes: true
  }))

  contents.executeJavaScript('scrap()').then((result) => {
    message = result[1].join('\n')
    html = result[0]
    // notification_window.webContents.openDevTools()
    if(html || message){
      notification_window.webContents.executeJavaScript("$('#html tbody').append('"+html+"');")
      if(settings.get('auto_copy') !== false){
        clipBoard.writeText(message)
      }
    }
  })

  notification_window.on('closed', function () {
    notification_window = null
  })

  setTimeout(function(){
    if(notification_window){
      notification_window.close()
    }
  }, 15000);
}

function createWindow () {
  Menu.setApplicationMenu(menu)

  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'manipulate.js')
      },
      show: false
    }
  )
  mainWindow.loadURL("http://app.maropost.com/admin/servers")
  mainWindow.showInactive()

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.webContents.on('crashed', function () {
    const options = {
      type: 'info',
      title: 'Renderer Process Crashed',
      message: 'This process has crashed.',
      buttons: ['Reload', 'Close']
    }
    dialog.showMessageBox(options, function (index) {
      if (index === 0) mainWindow.reload()
      else mainWindow.close()
    })
  })

  mainWindow.on('unresponsive', function () {
    const options = {
      type: 'info',
      title: 'Renderer Process Hanging',
      message: 'This process is hanging.',
      buttons: ['Reload', 'Close']
    }
    dialog.showMessageBox(options, function (index) {
      if (index === 0) mainWindow.reload()
      else mainWindow.close()
    })
  })

  contents = mainWindow.webContents
  contents.on('did-finish-load', analyze)

  setInterval(function(){ mainWindow.webContents.reload() }, 300000);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
