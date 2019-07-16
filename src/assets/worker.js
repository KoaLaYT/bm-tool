(function () {
  'use strict';

  const ipcRenderer = require('electron').ipcRenderer;
  const fs = require('fs');
  const XLSX = require('xlsx');

  const { QPNIHeader, MQPLHeader } = require('./header-info.js');

  const functions = require('./function.js');

  ipcRenderer.on(
    'request',
    (event, files, path, PVSTime) => {
    let QPNI, TIPS, MQPL;
    files.forEach(fileName => {
      const type = fileType(fileName);
      ipcRenderer.sendTo(1, 'request', `正在读取: ${type} ...`);
      const workbook = XLSX.readFile(fileName);
      const sheet_list = workbook.SheetNames;
      const sheet = workbook.Sheets[sheet_list[0]];
      switch (type) {
        case 'TIPS':
          TIPS = XLSX.utils.sheet_to_json(sheet, { "header": "A", "defval": "" });
          break;
        case 'MQPL':
          MQPL = XLSX.utils.sheet_to_json(sheet, { "defval": "" });
          break;
        case 'QPNI':
          QPNI = XLSX.utils.sheet_to_json(sheet, { "header": "A", "defval": "" });
          break;
      }
    });
    /**
     * main analyze function
     */
    // delete header lines
    TIPS = TIPS.slice(1);
    if (QPNI) QPNI = QPNI.slice(3);
    // define map for search
    let MQPLMap = buildMap(MQPL);
    let QPNIMap = buildMap(QPNI);
    // the merged XLSX JSON object
    let merged = [];
    // the debug log
    let debugLog = [];
    /**
     * main loop
     */
    let num = 1;
    ipcRenderer.sendTo(1, 'request', `开始对表 ...`);
    for (const [row, record] of TIPS.entries()) {
      let teileSource = checkTeileSource(record);
      if (!QPNI && teileSource == "QPNI") {
        // projects with no QPNI all ZP5 part maintained in MQPL
        teileSource = "MQPL";
      }
      let teileClass = checkTeileClass(record);
      let result = {};
      let extendedTeileNum = extendsTeileNum(record, "B", "P");

      result.teileSource = teileSource;
      result.teileClass = teileClass;

      if (teileSource == "LC2") {
        continue;
      } else if (teileSource == "MQPL") {
        if (MQPL && MQPLMap.has(extendedTeileNum)) {	// find this teile
          let MQPLRecords = MQPLMap.get(extendedTeileNum);
          let index = compareLieferanten(MQPLRecords, record, result);
          if (!result.isNewTeile) {
            MQPLMap.get(extendedTeileNum).splice(index, 1);
            if (MQPLMap.get(extendedTeileNum).length == 0) {
              MQPLMap.delete(extendedTeileNum);
            }
          }
        } else {
          result.isNewTeile = true
        }
      } else if (QPNI) {
        if (!QPNIMap.has(extendedTeileNum)) {
          result.isNewTeile = true
        } else {
          let QPNIRecords = QPNIMap.get(extendedTeileNum);
          if (!MQPL || !MQPLMap.has(extendedTeileNum)) {
            result.isNewTeile = false;
            result.QPNIOldRow = QPNIRecords[0];
            result.isOnlyInQPNI = true;
            QPNIMap.get(extendedTeileNum).splice(0, 1);
            if (QPNIMap.get(extendedTeileNum).length == 0) {
              QPNIMap.delete(extendedTeileNum);
            }
          } else {
            if (QPNIRecords.length >= 2) {
              result.isNewTeile = true;
            } else {
              result.QPNIOldRow = QPNIRecords[0];
              let MQPLRecords = MQPLMap.get(extendedTeileNum);
              let index = compareLieferanten(MQPLRecords, record, result);
              if (!result.isNewTeile) {
                MQPLMap.get(extendedTeileNum).splice(index, 1);
                if (MQPLMap.get(extendedTeileNum).length == 0) {
                  MQPLMap.delete(extendedTeileNum);
                }
              }
              if (index == -1) {
                result.isNewTeile = false;
                result.isOnlyInQPNI = true;
              }
              QPNIMap.get(extendedTeileNum).splice(0, 1);
              if (QPNIMap.get(extendedTeileNum).length == 0) {
                QPNIMap.delete(extendedTeileNum);
              }
            }
          }
        }
      }
      debugLog.push({num: num, teileNum: extendedTeileNum, result: result});
      merged.push(writeRecord(result, row, num));
      num++;
    }
    // analyze end, write remaining records to archives
    let MQPLArchive = writeArchive(MQPLMap, MQPL);
    let QPNIArchive = writeArchive(QPNIMap, QPNI);
    // filter useful information of QPNIArchive
    let QPNIFilterArchive = [];
    for (const record of QPNIArchive) {
      let filterRecord = {};
      QPNIHeader.forEach(data => {
        filterRecord[data.title] = record[data.col]
      });
      QPNIFilterArchive.push(filterRecord);
    }
    // write to a new file
    let mergedWB = XLSX.utils.book_new();
    mergedWB.SheetNames.push("MQPL");
    mergedWB.SheetNames.push("MQPL存档");
    mergedWB.SheetNames.push("QPNI存档");
    mergedWB.Sheets["MQPL"] = XLSX.utils.json_to_sheet(merged);
    // write auto functions to the new file
    const PVSYear = Number(PVSTime.slice(0, 4));
    const PVSKW = Number(PVSTime.slice(-2));
    for (let row = 2; row < num; row++) {
      if (merged[row-2]["ZP"] === "ZP7") {
        mergedWB.Sheets["MQPL"][`AZ${row}`].f
          = functions.Q3Soll2(row);
        mergedWB.Sheets["MQPL"][`BA${row}`].f
          = functions.Q3Soll3(row);
        mergedWB.Sheets["MQPL"][`BE${row}`].f
          = functions.Q1Soll2(row, PVSTime, PVSYear, PVSKW);
        mergedWB.Sheets["MQPL"][`BF${row}`].f
          = functions.Q1Soll3(row, PVSTime, PVSYear, PVSKW);
        mergedWB.Sheets["MQPL"][`CD${row}`].f
          = functions.FE54ia(row);
        mergedWB.Sheets["MQPL"][`CJ${row}`].f
          = functions.N3(row);
        mergedWB.Sheets["MQPL"][`CK${row}`].f
          = functions.N1(row);
      } else {
        mergedWB.Sheets["MQPL"][`AY${row}`].f
          = functions.Q3Dauer(row);
        mergedWB.Sheets["MQPL"][`BD${row}`].f
          = functions.Q1Dauer(row);
      }
    }
    // write archives
    mergedWB.Sheets["MQPL存档"] = XLSX.utils.json_to_sheet(MQPLArchive, { header: MQPLHeader.map(data => data.title) });
    mergedWB.Sheets["QPNI存档"] = XLSX.utils.json_to_sheet(QPNIFilterArchive);
    // write to the new fileName
    let postfix = new Date();
    postfix = postfix.toString().split(" ").slice(1, 5).join("-").replace(/:/g, "-");
    let newFileName = "MQPL母表_" + postfix + ".xlsx";
    ipcRenderer.sendTo(1, 'request', `生成新表 ...`);
    XLSX.writeFile(mergedWB, path + newFileName);
    // debug log
    fs.writeFile(`${path}log-${postfix}.txt`, JSON.stringify(debugLog, null, 2), (err) => {
      console.log(err)
    });
    ipcRenderer.sendTo(1, 'request', `DONE`);
    /**
     * result = {
       isNewTeile: <Boolean>,
       teileSource: <String>("MQPL"|"QPNI"|"LC2"),
       teileClass: <String>("CKD"|"HT"|"ZSB"|"others"),
       MQPLOldRow: <number>,
       QPNIOldRow: <number>,
       isOnlyInQPNI: <Boolean> 		// special for teileSource == "QPNI"
     }
     */
    function writeRecord(result, row, num) {
      let record = {};

      for (const data of MQPLHeader) {
        if (data.source == "MQPL") {
          if (result.isNewTeile) {
            record[data.title] = "";
          } else if (result.isOnlyInQPNI) {
            record[data.title] = "";
          } else {
            record[data.title] = MQPL[result.MQPLOldRow][data.title];
          }
        } else if (data.source == "TIPS") {
          record[data.title] = TIPS[row][data.col];
        } else if (data.source == "MQPL_QPNI") {
          if (result.isNewTeile) {
            record[data.title] = "";
          } else if (result.teileSource == "MQPL") {
            record[data.title] = MQPL[result.MQPLOldRow][data.title];
          } else {
            record[data.title] = QPNI[result.QPNIOldRow][data.col];
          }
        } else if (data.source == "MQPL_TIPS") {
          if (result.teileClass == "others") {
            record[data.title] = TIPS[row][data.col];
          } else if (result.isNewTeile) {
            record[data.title] = "";
          } else {
            record[data.title] = MQPL[result.MQPLOldRow][data.title];
          }
        } else if (data.source == "CALC") {
          record[data.title] = num;	// global variable
        }
      }

      return record;
    }

    /**
     * helper functions
     */
    function compareLieferanten(MQPLRecords, TIPSRecord, result) {
      for (let i = 0; i < MQPLRecords.length; i++) {
        let MQPLRecord = MQPL[MQPLRecords[i]];
        if (MQPLRecord["Lieferanten-Code(3)"] == TIPSRecord["AD"] &&
          MQPLRecord["CS供应商名称"] == TIPSRecord["AG"]) {
          result.isNewTeile = false;
          result.MQPLOldRow = MQPLRecords[i];
          return i;
        }
      }
      result.isNewTeile = true;
      return -1;
    }

    function extendsTeileNum(record, numProp, FKZProp) {
      let numPart = String(record[numProp]);
      let FKZPart = (FKZProp ? String(record[FKZProp]) : "0");
      FKZPart = FKZPart || "0";
      return numPart + "-" + FKZPart;
    }

    function buildMap(source) {
      if (!source) return undefined;

      let map = new Map();
      let numProp, FKZProp;

      if (source[0].hasOwnProperty("Teile-Nr")) {	// source == MQPL
        numProp = "Teile-Nr";
        FKZProp = "FKZ";
      } else {
        numProp = "F";
      }

      for (const [row, record] of source.entries()) {
        let extendedTeileNum = extendsTeileNum(record, numProp, FKZProp);
        if (!map.has(extendedTeileNum)) {
          map.set(extendedTeileNum, [row]);
        } else {
          map.get(extendedTeileNum).push(row);
        }
      }

      return map;
    }

    function checkTeileSource(teile) {
      if (String(teile["V"]) == "LC2") {
        return "LC2";
      } else if (String(teile["A"]) == "ZP5" &&
        (String(teile["V"]) == "LC" || String(teile["V"]) == "LC1")) {
        return "QPNI";
      } else {
        return "MQPL";
      }
    }

    function checkTeileClass(teile) {
      switch (String(teile["V"])) {
        case "CKD":
          return "CKD";
        case "HT":
          return "HT";
        case "ZSB":
          return "ZSB";
        default:
          return "others";
      }
    }
   // write remaining MQPL record
   function writeArchive(map, source) {
     let archive = [];
     if (source) {
       for (const records of map.values()) {
         records.forEach(record => {
           archive.push(source[record]);
         });
       }
     }
     return archive;
   }

   function fileType(fileName) {
     if (fileName.toLowerCase().includes("tips")) {
       return 'TIPS';
     } else if (fileName.toLowerCase().includes("mqpl")) {
       return 'MQPL';
     } else {
       return 'QPNI';
     }
   }
  });
})();
