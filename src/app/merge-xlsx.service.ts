import { Injectable } from '@angular/core';
import { QPNIHeader, MQPLHeader } from './headerConfig';
import { FileService } from './file.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MergeXLSXService {

  QPNI = undefined;
  TIPS = undefined;
  MQPL = undefined;

  MQPLHeader = MQPLHeader;
  QPNIHeader = QPNIHeader;

  MQPLMap;
  QPNIMap;

  merged = [];
  debugLog = [];

  num: number;

  constructor(
    private fileService: FileService
  ) { }

  public dirtyJob(pvsTime, path) {
    const MQPLArchive = this.writeArchive(this.MQPLMap, this.MQPL);
    const QPNIArchive = this.writeArchive(this.QPNIMap, this.QPNI);

    // filter useful information of QPNIArchive
    const QPNIFilterArchive = [];
    for (const record of QPNIArchive) {
      const filterRecord = {};
      this.QPNIHeader.forEach(data => {
        filterRecord[data.title] = record[data.col];
      });
      QPNIFilterArchive.push(filterRecord);
    }

    return this.fileService.buildNewXLSX(
      {
        merged: this.merged,
        MQPLArchive,
        QPNIArchive: QPNIFilterArchive,
        pvsTime,
        MQPLHeader: this.MQPLHeader,
        debugLog: this.debugLog,
        num: this.num,
        path
      }
    );
  }

  public analyze(parsedXLSXs) {
    this.assignXLSXObj(parsedXLSXs);
    this.num = 1;
    let row = 0;

    return new Promise((resolve, reject) => {
      for (const record of this.TIPS) {
        let teileSource = this.checkTeileSource(record);
        if (!this.QPNI && teileSource === 'QPNI') {
          // projects with no QPNI all ZP5 part maintained in MQPL
          teileSource = 'MQPL';
        }
        const teileClass = this.checkTeileClass(record);
        const result: {
          isNewTeile?: boolean;
          teileSource?: string; // 'MQPL'|'QPNI'|'LC2';
          teileClass?: string; // 'CKD'|'HT'|'ZSB'|'others';
          MQPLOldRow?: number;
          QPNIOldRow?: number;
          isOnlyInQPNI?: boolean;
        } = {};
        const extendedTeileNum = this.extendsTeileNum(record, 'B', 'P');

        result.teileSource = teileSource;
        result.teileClass = teileClass;

        if (teileSource === 'LC2') {
          row++;
          continue;
        } else if (teileSource === 'MQPL') {
          if (this.MQPL && this.MQPLMap.has(extendedTeileNum)) {	// find this teile
            const MQPLRecords = this.MQPLMap.get(extendedTeileNum);
            const index = this.compareLieferanten(MQPLRecords, record, result);
            if (!result.isNewTeile) {
              this.MQPLMap.get(extendedTeileNum).splice(index, 1);
              if (this.MQPLMap.get(extendedTeileNum).length === 0) {
                this.MQPLMap.delete(extendedTeileNum);
              }
            }
          } else {
            result.isNewTeile = true;
          }
        } else if (this.QPNI) {
          if (!this.QPNIMap.has(extendedTeileNum)) {
            result.isNewTeile = true;
          } else {
            const QPNIRecords = this.QPNIMap.get(extendedTeileNum);
            if (!this.MQPL || !this.MQPLMap.has(extendedTeileNum)) {
              result.isNewTeile = false;
              result.QPNIOldRow = QPNIRecords[0];
              result.isOnlyInQPNI = true;
              this.QPNIMap.get(extendedTeileNum).splice(0, 1);
              if (this.QPNIMap.get(extendedTeileNum).length === 0) {
                this.QPNIMap.delete(extendedTeileNum);
              }
            } else {
              if (QPNIRecords.length >= 2) {
                result.isNewTeile = true;
              } else {
                result.QPNIOldRow = QPNIRecords[0];
                const MQPLRecords = this.MQPLMap.get(extendedTeileNum);
                const index = this.compareLieferanten(MQPLRecords, record, result);
                if (!result.isNewTeile) {
                  this.MQPLMap.get(extendedTeileNum).splice(index, 1);
                  if (this.MQPLMap.get(extendedTeileNum).length === 0) {
                    this.MQPLMap.delete(extendedTeileNum);
                  }
                }
                if (index === -1) {
                  result.isNewTeile = false;
                  result.isOnlyInQPNI = true;
                }
                this.QPNIMap.get(extendedTeileNum).splice(0, 1);
                if (this.QPNIMap.get(extendedTeileNum).length === 0) {
                  this.QPNIMap.delete(extendedTeileNum);
                }
              }
            }
          }
        }
        this.debugLog.push({num: this.num, teileNum: extendedTeileNum, result});
        this.merged.push(this.writeRecord(result, row, this.num));
        this.num++;
        row++;
        console.log(this.merged);
      }
      resolve(this.num);
    });
  }

  private writeRecord(result, row, num) {
    const record = {};

    for (const data of this.MQPLHeader) {
      if (data.source === 'MQPL') {
        if (result.isNewTeile) {
          record[data.title] = '';
        } else if (result.isOnlyInQPNI) {
          record[data.title] = '';
        } else {
          record[data.title] = this.MQPL[result.MQPLOldRow][data.title];
        }
      } else if (data.source === 'TIPS') {
        record[data.title] = this.TIPS[row][data.col];
      } else if (data.source === 'MQPL_QPNI') {
        if (result.isNewTeile) {
          record[data.title] = '';
        } else if (result.teileSource === 'MQPL') {
          record[data.title] = this.MQPL[result.MQPLOldRow][data.title];
        } else {
          record[data.title] = this.QPNI[result.QPNIOldRow][data.col];
        }
      } else if (data.source === 'MQPL_TIPS') {
        if (result.teileClass === 'others') {
          record[data.title] = this.TIPS[row][data.col];
        } else if (result.isNewTeile) {
          record[data.title] = '';
        } else {
          record[data.title] = this.MQPL[result.MQPLOldRow][data.title];
        }
      } else if (data.source === 'CALC') {
        record[data.title] = num;	// global variable
      }
    }

    return record;
  }

  private writeArchive(map, source) {
    const archive = [];
    if (source) {
      for (const records of map.values()) {
        records.forEach(record => {
          archive.push(source[record]);
        });
      }
    }
    return archive;
  }

  private assignXLSXObj(parsedXLSXs: Array<{parsedObj, fileName}>) {
    parsedXLSXs.forEach(({parsedObj, fileName}) => {
      if (fileName.toLowerCase().includes('tips')) {
        this.TIPS = parsedObj;
      } else if (fileName.toLowerCase().includes('mqpl')) {
        this.MQPL = parsedObj;
      } else {
        this.QPNI = parsedObj;
      }
    });
    // fix some quirky
    this.TIPS = this.TIPS.slice(1);
    if (this.QPNI) {
      this.QPNI = this.QPNI.slice(3);
    }
    this.MQPLMap = this.buildMap(this.MQPL);
    this.QPNIMap = this.buildMap(this.QPNI);
  }

  private buildMap(source) {
    if (!source) {
      return undefined;
    }

    const map = new Map();
    let numProp = '';
    let FKZProp = '';

    if (source[0].hasOwnProperty('Teile-Nr')) {	// source == MQPL
      numProp = 'Teile-Nr';
      FKZProp = 'FKZ';
    } else {
      numProp = 'F';
    }

    for (const [row, record] of source.entries()) {
      const extendedTeileNum = this.extendsTeileNum(record, numProp, FKZProp);
      if (!map.has(extendedTeileNum)) {
        map.set(extendedTeileNum, [row]);
      } else {
        map.get(extendedTeileNum).push(row);
      }
    }

    return map;
  }

  private compareLieferanten(MQPLRecords, TIPSRecord, result) {
    for (let i = 0; i < MQPLRecords.length; i++) {
      const MQPLRecord = this.MQPL[MQPLRecords[i]];
      if (MQPLRecord['Lieferanten-Code(3)'] === TIPSRecord['AD'] &&
        MQPLRecord['CS供应商名称'] === TIPSRecord['AG']) {
        result.isNewTeile = false;
        result.MQPLOldRow = MQPLRecords[i];
        return i;
      }
    }
    result.isNewTeile = true;
    return -1;
  }

  private extendsTeileNum(record, numProp, FKZProp) {
    const numPart = String(record[numProp]);
    let FKZPart = (FKZProp ? String(record[FKZProp]) : '0');
    FKZPart = FKZPart || '0';
    return numPart + '-' + FKZPart;
  }

  private checkTeileSource(teile) {
    if (String(teile['V']) === 'LC2') {
      return 'LC2';
    } else if (String(teile['A']) === 'ZP5' &&
      (String(teile['V']) === 'LC' || String(teile['V']) === 'LC1')) {
      return 'QPNI';
    } else {
      return 'MQPL';
    }
  }

  private checkTeileClass(teile) {
    switch (String(teile['V'])) {
      case 'CKD':
        return 'CKD';
      case 'HT':
        return 'HT';
      case 'ZSB':
        return 'ZSB';
      default:
        return 'others';
    }
  }
}
