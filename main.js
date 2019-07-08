const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
const XLSX = require('xlsx');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 500, height: 500 })

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '/dist/bm-tool/index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('searchFiles', (event, arg) => {
  fs.readdir(arg, (err, files) => {
    event.sender.send('searchFilesResponse', files);
  });
});

ipcMain.on('parseXLSX', (event, arg) => {
  const workbook = XLSX.readFile(arg);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const fileName = arg.split('/')[arg.split('/').length - 1];
  let sheetObj;
  if (/mqpl/i.test(fileName)) {
    sheetObj = XLSX.utils.sheet_to_json(sheet, { "defval": '' });
  } else {
    sheetObj = XLSX.utils.sheet_to_json(sheet, { "header": 'A', "defval": '' });
  }
  event.sender.send('parseXLSXResponse', sheetObj);
});

ipcMain.on(
  'buildXLSX',
  (event, {merged, MQPLArchive, QPNIArchive, pvsTime, MQPLHeader, debugLog, num, path}) => {
    let mergedWB = XLSX.utils.book_new();
    mergedWB.SheetNames.push("MQPL");
    mergedWB.SheetNames.push("MQPL存档");
    mergedWB.SheetNames.push("QPNI存档");
    mergedWB.Sheets["MQPL"] = XLSX.utils.json_to_sheet(merged, { header: MQPLHeader.map(data => data.title) });

    const PVSYear = Number(pvsTime.slice(0, 4));
    const PVSKW = Number(pvsTime.slice(-2));
    for (let row = 2; row < num; row++) {
      // only for ZP7
      if (merged[row-2]["ZP"] === "ZP7") {
        // Q3 soll2
        mergedWB.Sheets["MQPL"][`AZ${row}`].f =
        `if(
          X${row}="",
          "",
          if(
          AY${row}="",
          "",
          if(
            (right(X${row}, 2)+AY${row})>52,
            (left(X${row}, 4)+1)&"-KW"&if(
                                          (right(X${row}, 2)+AY${row}-52)<10,
                                          "0"&(right(X${row}, 2)+AY${row}-52),
                                          (right(X${row}, 2)+AY${row}-52)
                                        ),
            left(X${row}, 4)&"-KW"&if(
                                      (right(X${row}, 2)+AY${row})<10,
                                      "0"&(right(X${row}, 2)+AY${row}),
                                      (right(X${row}, 2)+AY${row})
                                    )
          )
          )
        )`;
        // Q3 soll3
        mergedWB.Sheets["MQPL"][`BA${row}`].f =
        `if(
          X${row}="",
          "",
          if(
          AY${row}="",
          "",
          if(
            (right(Y${row}, 2)+AY${row})>52,
            (left(Y${row}, 4)+1)&"-KW"&if(
                                          (right(Y${row}, 2)+AY${row}-52)<10,
                                          "0"&(right(Y${row}, 2)+AY${row}-52),
                                          (right(Y${row}, 2)+AY${row}-52)
                                        ),
            left(Y${row}, 4)&"-KW"&if(
                                      (right(Y${row}, 2)+AY${row})<10,
                                      "0"&(right(Y${row}, 2)+AY${row}),
                                      (right(Y${row}, 2)+AY${row})
                                    )
          )
          )
        )`;
        // Q1 soll2
        mergedWB.Sheets["MQPL"][`BE${row}`].f =
        `if(
          X${row}="",
          "",
          if(
          BD${row}="",
          "",
          if(
            (right(X${row}, 2)+BD${row})>52,
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(X${row}, 4)+1)&"-KW"&if(
                                            (right(X${row}, 2)+BD${row}-52)<10,
                                            "0"&(right(X${row}, 2)+BD${row}-52),
                                            (right(X${row}, 2)+BD${row}-52)
                                          )
            ),
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(X${row}, 4))&"-KW"&if(
                                            (right(X${row}, 2)+BD${row})<10,
                                            "0"&(right(X${row}, 2)+BD${row}),
                                            (right(X${row}, 2)+BD${row})
                                          )
            )
          )
          )
        )`;
        // Q1 soll3
        mergedWB.Sheets["MQPL"][`BF${row}`].f =
        `if(
          X${row}="",
          "",
          if(
          BD${row}="",
          "",
          if(
            (right(Y${row}, 2)+BD${row})>52,
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(Y${row}, 4)+1)&"-KW"&if(
                                            (right(Y${row}, 2)+BD${row}-52)<10,
                                            "0"&(right(Y${row}, 2)+BD${row}-52),
                                            (right(Y${row}, 2)+BD${row}-52)
                                          )
            ),
            if(
              OR(
                (left(X${row}, 4)+1)<${PVSYear},
                AND(
                  (left(X${row}, 4)+1)=${PVSYear},
                  (right(X${row}, 2)+BD${row}-52) <= ${PVSKW}
                )
              ),
              "${pvsTime}",
              (left(Y${row}, 4))&"-KW"&if(
                                            (right(Y${row}, 2)+BD${row})<10,
                                            "0"&(right(Y${row}, 2)+BD${row}),
                                            (right(Y${row}, 2)+BD${row})
                                          )
            )
          )
          )
        )`;
      } else {
        // Q3 dauer
        mergedWB.Sheets["MQPL"][`AY${row}`].f =
        `
        if(
          X${row}="",
          "",
          if(
            BA${row}="",
            if(
              AZ${row}="",
              "",
              if(
                right(AZ${row},2)-right(X${row},2)<0,
                right(AZ${row},2)-right(X${row},2)+52,
                right(AZ${row},2)-right(X${row},2)
              )
            ),
            if(
              right(BA${row},2)-right(Y${row},2)<0,
              right(BA${row},2)-right(Y${row},2)+52,
              right(BA${row},2)-right(Y${row},2)
            )
          )
        )
        `;
        // Q1 dauer
        mergedWB.Sheets["MQPL"][`BD${row}`].f =
        `
        if(
          X${row}="",
          "",
          if(
            BN${row}="",
            if(
              BM${row}="",
              "",
              if(
                right(BM${row},2)-right(X${row},2)<0,
                right(BM${row},2)-right(X${row},2)+52,
                right(BM${row},2)-right(X${row},2)
              )
            ),
            if(
              right(BN${row},2)-right(Y${row},2)<0,
              right(BN${row},2)-right(Y${row},2)+52,
              right(BN${row},2)-right(Y${row},2)
            )
          )
        )
        `;
      }
    }
    // write archives
    mergedWB.Sheets["MQPL存档"] = XLSX.utils.json_to_sheet(MQPLArchive, { header: MQPLHeader.map(data => data.title) });
    mergedWB.Sheets["QPNI存档"] = XLSX.utils.json_to_sheet(QPNIArchive);
    let postfix = new Date();
    postfix = postfix.toString().split(" ").slice(1, 5).join("-").replace(/:/g, "-");
    let newFileName = "MQPL母表_" + postfix + ".xlsx";
    XLSX.writeFile(mergedWB, path + newFileName);
    // debug log
    fs.writeFile(`${path}log-${postfix}.txt`, JSON.stringify(debugLog, null, 2), (err) => { console.log(err) });

    event.sender.send('buildXLSXResponse', newFileName);
  });
