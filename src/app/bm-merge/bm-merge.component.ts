import { Component, OnInit, AfterViewInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { Observable, fromEvent, merge } from 'rxjs';
import { throttleTime, startWith, map } from 'rxjs/operators';

import { FileService } from '../file.service';
import { LocalStorageService } from '../local-storage.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-bm-merge',
  templateUrl: './bm-merge.component.html',
  styleUrls: ['./bm-merge.component.scss']
})
export class BmMergeComponent implements OnInit, AfterViewInit {
  public projectFormControl = new FormControl('', [Validators.required]);
  public dateFormControl = new FormControl('', [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)]);
  public pathFormControl = new FormControl('', [Validators.required, Validators.pattern(/(\/|\\)$/)]);
  public matcher = new MyErrorStateMatcher();

  public filteredProjects: Observable<string[]>;
  public relatedFiles: Array<{ name: string; tag: string }> = [];
  public selectedFiles: string[] = [];
  public isFileValid = false;
  public isFileValidForOutput = false;
  public isRunning = false;
  public info = '';

  // fontawesome icons
  public faTimes = faTimes;

  private projects: string[];

  // elementrefs
  @ViewChild('projectInput', { static: true }) projectInputElement: ElementRef;

  constructor(private fileService: FileService, private localStorage: LocalStorageService, private message: MatSnackBar, private ref: ChangeDetectorRef) {}

  ngOnInit() {
    // autocomplete handlers
    this.updateProjects();
    this.filteredProjects = merge(
      fromEvent(this.projectInputElement.nativeElement, 'click').pipe(
        map((e: Event) => {
          this.updateProjects();
          return (e.target as HTMLInputElement).value;
        })
      ),
      this.projectFormControl.valueChanges
    ).pipe(
      startWith(''),
      map(value => this.filter(value))
    );
    // search related files
    this.pathFormControl.valueChanges.pipe(throttleTime(16)).subscribe(path => {
      if (this.pathFormControl.valid) {
        this.relatedFiles = [];
        this.selectedFiles = [];
        this.fileService.searchFiles(path).then(files => {
          files
            .filter(file => {
              return /^[^~]*?(tips|mqpl|qpni).*?\.(xlsx?|xlsm)$/i.test(file);
            })
            .forEach(file => {
              let tag = '';
              if (/mqpl/i.test(file)) {
                tag = 'MQPL';
              } else if (/qpni/i.test(file)) {
                tag = 'QPNI';
              } else if (/tips/i.test(file)) {
                tag = 'TIPS';
              }
              this.relatedFiles.push({
                name: file,
                tag
              });
            });
        });
      } else {
        this.relatedFiles = [];
        this.selectedFiles = [];
      }
    });
    // file merge info updates
    this.fileService.progressInfo$.subscribe(info => {
      this.info = info;
      if (info === 'DONE') {
        this.isRunning = false;
        this.info = '';
        this.message.open('新MQPL母表/TIPS已生成', '完成', {
          duration: 2000
        });
        setTimeout(() => {
          this.pathFormControl.setValue(this.pathFormControl.value);
        }, 100);
      }
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit() {
    // save button handlers
    const button = document.querySelector('#save-button');
    fromEvent(button, 'click')
      .pipe(throttleTime(500))
      .subscribe(_ => {
        this.localStorage.set(this.projectFormControl.value, this.dateFormControl.value);
        this.updateProjects();
        this.message.open(`项目：${this.projectFormControl.value}`, '保存成功', {
          duration: 2000
        });
      });
  }

  public sync(project: string) {
    this.dateFormControl.setValue(this.localStorage.get(project).ZP7.ZP7PVS);
  }

  public delete(e, project: string) {
    e.stopPropagation();
    this.localStorage.delete(project);
    this.updateProjects();
    this.projectFormControl.reset();
    this.dateFormControl.reset();
  }

  public pickFile(checked: boolean, file: string) {
    if (checked) {
      this.selectedFiles.push(file);
    } else {
      this.selectedFiles = this.selectedFiles.filter(fileName => fileName !== file);
    }
    this.isFileValid = this.checkFileValidity();
    this.isFileValidForOutput = this.checkFileValidityForOutput();
    console.log(this.selectedFiles);
  }

  public start() {
    this.isRunning = true;
    const completePathFiles = this.selectedFiles.map(file => {
      return this.pathFormControl.value + file;
    });
    this.fileService.start(completePathFiles, this.pathFormControl.value, this.dateFormControl.value);
  }

  public output() {
    this.isRunning = true;
    const completePathFiles = this.selectedFiles.map(file => {
      return this.pathFormControl.value + file;
    });
    this.fileService.output(completePathFiles, this.pathFormControl.value);
  }

  private filter(value: string): string[] {
    return this.projects.filter(project => project.toLowerCase().includes(value.toLowerCase()));
  }

  private updateProjects() {
    this.projects = this.localStorage.lastRecords();
  }

  private checkFileValidity(): boolean {
    // no duplicate files
    const relatedFileNames = [/tips/i, /mqpl/i, /qpni/i];
    for (let reg of relatedFileNames) {
      if (this.hasDuplicateFiles(reg)) {
        this.showErrorMessage('同一类型的表格只能选择一张');
        return false;
      }
    }

    // tips must be presented
    if (this.selectedFiles.filter(file => /tips/i.test(file)).length === 0) {
      if (this.isFileValid) {
        this.showErrorMessage('必须选择TIPS');
      }
      return false;
    }
    return true;
  }

  private checkFileValidityForOutput(): boolean {
    // no duplicate files
    const relatedFileNames = [/tips/i, /mqpl/i, /qpni/i];
    for (let reg of relatedFileNames) {
      if (this.hasDuplicateFiles(reg)) {
        return false;
      }
    }

    if (this.selectedFiles.find(file => /tips/i.test(file)) && this.selectedFiles.find(file => /mqpl/i.test(file))) {
      return true;
    } else {
      return false;
    }
  }

  private hasDuplicateFiles(relatedFileName) {
    return this.selectedFiles.filter(file => relatedFileName.test(file)).length > 1;
  }

  private showErrorMessage(error: string) {
    this.message.open(error, '错误', {
      duration: 1000
    });
  }
}
