const electron = require('electron')
const { autoUpdater } = require("electron-updater")
const log = require('electron-log');
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const dialog = electron.dialog
const Menu = electron.Menu

const path = require('path')
const url = require('url')
const clipBoard = electron.clipboard
const settings = require('electron-settings')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let notification_window
let interval_setting
let contents
let message = ""
let timeout
let willQuitApp = false;
let $ = require('jquery');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

function analyze() {
  // setting timeout for next reload
  let interval = parseInt(settings.get('interval') || 5)
  let miliseconds = interval*60*1000

  clearTimeout(timeout);
  timeout = setTimeout(function(){
    if(mainWindow){
      mainWindow.webContents.reload()
    } else {
      createWindow()
    }
  }, miliseconds);

  notification_window = new BrowserWindow(
  {
    width: 508,
    height: 300,
    frame: false,
    x: 10,
    y: 50,
    alwaysOnTop: true,
    backgroundColor: "#34495E", // not working probably
    show: false
  })
  
  notification_window.loadURL(url.format({
    pathname: path.join(__dirname, 'notification.html'),
    protocol: 'file:',
    slashes: true
  }))
  notification_window.on('closed', function () {
    notification_window = null
  })

  notification_window.showInactive()
  // contents.executeJavaScript('scrap()').then((result) => {
  // notification_window.webContents.openDevTools()
  // })
}

function wait_before_analyze(){
  setTimeout(analyze, 2000)
}

function createWindow() {
  autoUpdater.checkForUpdatesAndNotify()
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
      },
      {
        label: 'Alert Type',
        submenu: [
          {
            label: "All",
            enabled: (settings.get('alert_type') === 'errors_only'),
            click: function (item, focusedWindow) {
              settings.set('alert_type', 'all')
              menu.items[1].submenu.items[1].submenu.items[0].enabled = false
              menu.items[1].submenu.items[1].submenu.items[1].enabled = true
              dialog.showMessageBox({
                type: 'info',
                message: 'Success!',
                detail: 'You will get both warnings and red alerts.',
                buttons: ['OK']
              })
            }
          },
          {
            label: "Red Alerts Only",
            enabled: (settings.get('alert_type') !== 'errors_only'),
            click: function (item, focusedWindow) {
              settings.set('alert_type', 'errors_only')
              menu.items[1].submenu.items[1].submenu.items[1].enabled = false
              menu.items[1].submenu.items[1].submenu.items[0].enabled = true
              dialog.showMessageBox({
                type: 'info',
                message: 'Success!',
                detail: 'You will get only red alerts which needs immidiate attention.',
                buttons: ['OK']
              })
            }
          }
        ]
      },
      {
        type: 'separator'
      },
      {
        label: "Time Interval",
        click: function(){
          interval_setting.show()
        }
      }
    ]
  },{
      label: 'Window',
      submenu: [
      {
        label: 'Reload',
        role: 'reload',
        accelerator: 'CmdOrCtrl+R'
      }]
  },{
    label: 'Help',
    submenu: [
      {
        label: 'Documentation',
        click: function(){
          let docWindow = new BrowserWindow({show: false, width: 690, height: 400})
          docWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'doc.html'),
            protocol: 'file:',
            slashes: true
          }))
          docWindow.once('ready-to-show', () => {
            docWindow.show()
          })
        }
      }
    ]
  }]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {type: 'separator'},
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
  Menu.setApplicationMenu(menu)

  // Create the browser window.
  mainWindow = new BrowserWindow(
    {
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'manipulate.js'),
        nodeIntegration: false
      },
      show: false
    }
  )
  mainWindow.loadURL("http://processlist.io/")
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
  contents.on('dom-ready', wait_before_analyze)

  interval_setting = new BrowserWindow({parent: mainWindow, modal: true, show: false, width: 404, height: 229})
  interval_setting.loadURL(url.format({
    pathname: path.join(__dirname, 'interval.html'),
    protocol: 'file:',
    slashes: true
  }))

  interval_setting.on('close', function () {
    if (willQuitApp) {
      /* the user tried to quit the app */
      window = null;
    } else {
      /* the user only tried to close the window */
      e.preventDefault();
      interval_setting.hide();
    }
  })
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
app.on('before-quit', () => willQuitApp = true);

// autoUpdater.on('checking-for-update', () => {
//   log.info('Checking for update...');
// })
// autoUpdater.on('update-available', (info) => {
//   log.info('Update available.');
// })
// autoUpdater.on('update-not-available', (info) => {
//   log.info('Update not available.');
// })
// autoUpdater.on('error', (err) => {
//   log.info('Error in auto-updater. ' + err);
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   log.info(log_message);
// })
// autoUpdater.on('update-downloaded', (info) => {
//   log.info('Update downloaded');
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
