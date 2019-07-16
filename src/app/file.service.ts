import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  public progressInfo$ = new Subject<string>();

  constructor(private electronService: ElectronService) {}

  public searchFiles(path: string): Promise<string[]> {
    const $fs = this.electronService.remote.require('fs');
    return new Promise((resolve, reject) => {
      $fs.readdir(path, (err: Error, files: string[]) => {
        if (err) {
          resolve([]);
        } else {
          resolve(files);
        }
      });
    });
  }

  public start(files: string[], path: string, PVSTime: string) {
    this.electronService.ipcRenderer.on('request', (event, info: string) => {
      this.progressInfo$.next(info);
    });
    this.electronService.ipcRenderer.sendTo(2, 'request', files, path, PVSTime);
  }
}
