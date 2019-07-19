const { app, BrowserWindow, ipcMain } = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win1, win2, win3;

const webPreferences = {
  nodeIntegration: true
};

function createWindow() {
  // Create the browser window.
  win1 = new BrowserWindow({
    width: 500,
    height: 500,
    webPreferences
  });
  win2 = new BrowserWindow({
    width: 500,
    height: 500,
    show: false,
    webPreferences
  });

  // and load the index.html of the app.
  win1.loadFile('dist/electron-test/index.html');
  win2.loadFile('dist/electron-test/assets/worker.html');

  // Open the DevTools.
  // win1.webContents.openDevTools();

  // Emitted when the window is closed.
  win1.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win1 = null;
    win2.close();
    win2 = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win1 === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('draw', (event, metaInfo) => {
  win3 = new BrowserWindow({ width: 1000, height: 800, webPreferences });
  win3.loadFile('dist/electron-test/assets/draw.html');

  win3.webContents.on('did-finish-load', () => {
    win3.webContents.send('drawCurve', metaInfo);
  });

  win3.on('closed', () => {
    event.reply('draw', 'closed');
    win3 = null;
  });
});
