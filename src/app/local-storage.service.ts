import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private record: string[] = [];

  constructor() {
    // If has last records, restore it into record
    const lastRecords = window.localStorage.getItem('__record__');
    if (lastRecords) {
      this.record = JSON.parse(lastRecords);
    }
  }

  lastRecords() {
    return this.record;
  }

  get(project: string) {
    return JSON.parse(window.localStorage.getItem(project)).terminplan;
  }

  getFullProjectInfo(project: string) {
    return JSON.parse(window.localStorage.getItem(project));
  }

  set(project: string, pvsTime: string): void {
    if (this.hasRecorded(project)) {
      const previousRecord = JSON.parse(window.localStorage.getItem(project));
      previousRecord.terminplan.ZP7.ZP7PVS = pvsTime;
      window.localStorage.setItem(project, JSON.stringify(previousRecord));
    } else {
      window.localStorage.setItem(project, JSON.stringify({ terminplan: { ZP7: { ZP7PVS: pvsTime } } }));
      this.record.push(project);
      window.localStorage.setItem('__record__', JSON.stringify(this.record));
    }
  }

  setFullProjectInfo(project: string, startWeek: string, endWeek: string, terminplanZP5, terminplanZP7) {
    window.localStorage.setItem(
      project,
      JSON.stringify({
        startWeek,
        endWeek,
        terminplan: {
          ZP5: terminplanZP5,
          ZP7: terminplanZP7
        }
      })
    );
    if (!this.hasRecorded(project)) {
      this.record.push(project);
      window.localStorage.setItem('__record__', JSON.stringify(this.record));
    }
  }

  delete(project: string): void {
    window.localStorage.removeItem(project);
    this.record = this.record.filter(r => r !== project);
    window.localStorage.setItem('__record__', JSON.stringify(this.record));
  }

  private hasRecorded(project: string): boolean {
    return this.record.includes(project);
  }
}
