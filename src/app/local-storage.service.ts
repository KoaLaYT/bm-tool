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

  get(project: string): { pvsTime: string } {
    return JSON.parse(window.localStorage.getItem(project));
  }

  set(project: string, pvsTime: string): void {
    if (!this.hasRecorded(project)) {
      window.localStorage.setItem(project, JSON.stringify({pvsTime}));
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
    if (this.record.filter((saved: string) => saved === project).length === 0) {
      return false;
    } else {
      return true;
    }
  }

}
