import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
import { Observable, from, zip, of } from 'rxjs';
import { concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  private ipc: IpcRenderer;
  private cachedFiles: string[];

  constructor() {
    /**
     * Copied from website, haven't fully understood
     */
    if ((window as any).require) {
      try {
        this.ipc = (window as any).require('electron').ipcRenderer;
      } catch (error) {
        throw error;
      }
    } else {
      console.warn('Counld not load electron ipc');
    }
  }
  /**
   * commuicated by IPC
   * wrapped as promise
   */
  buildNewXLSX(
    mergedObj: {merged, MQPLArchive, QPNIArchive, pvsTime, MQPLHeader, debugLog, num, path}) {
    return new Promise((resolve, reject) => {
      this.ipc.on('buildXLSXResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('buildXLSX', mergedObj);
    });
  }

  searchAllFiles(path) {
    return new Promise((resolve, reject) => {
      this.ipc.on('searchFilesResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('searchFiles', path);
    }).then((files: string[]) => {
      this.cachedFiles = files;
      return this.cachedFiles;
    });
  }

  getRelatedFiles(regexp) {
    if (this.cachedFiles) {
      return this.cachedFiles.filter(file => regexp.test(file));
    } else {
      return null;
    }
  }

  private parseXLSX(fileName) {
    return new Promise((resolve, reject) => {
      this.ipc.on('parseXLSXResponse', (event, arg) => {
        resolve(arg);
      });
      this.ipc.send('parseXLSX', fileName);
    });
  }

  /* parse XLSX in squencential */
  /*
  parseAllXLSXs$(fileNames) {
    return new Observable(observer => {
      (async () => {
        for (const fileName of fileNames) {
          const parsedObj = await this.parseXLSX(fileName);
          observer.next({parsedObj, fileName});
        }
        observer.complete();
      })();
    });
  }
  */

  parseAllXLSXs$(fileNames) {
    const parsedXLSXStream = from(fileNames).pipe(
      concatMap(fileName => from(this.parseXLSX(fileName)))
    );

    return zip(parsedXLSXStream, from(fileNames), (parsedObj, fileName) => {
      return {
        parsedObj,
        fileName
      };
    });
  }

}
