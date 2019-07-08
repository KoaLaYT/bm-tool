import { Component, OnInit } from '@angular/core';
import { FileService } from '../file.service';
import { MergeXLSXService } from '../merge-xlsx.service';
import { InfoFieldComponent } from '../info-field/info-field.component';
import { MatSnackBar } from '@angular/material';
import { fromEvent } from 'rxjs';
import { map, concatAll } from 'rxjs/operators';

@Component({
  selector: 'app-bm-merge',
  templateUrl: './bm-merge.component.html',
  styleUrls: ['./bm-merge.component.scss']
})
export class BmMergeComponent implements OnInit {

  filePath: string;
  relatedFiles: string[];
  selectedFiles: string[] = [];
  isInfoValid: boolean;
  isFileValid: boolean;
  isRunning = false;

  parsedObj = [];
  progress = 0;
  raf;

  pvsTime;

  constructor(
    private fileService: FileService,
    private mergeXLSX: MergeXLSXService,
    private matMessage: MatSnackBar
  ) { }

  ngOnInit() {
  }

  searchFiles(filePath) {
    this.fileService.searchAllFiles(filePath).then(_ => {
      this.relatedFiles = this.fileService.getRelatedFiles(
        /^[^~]*?(tips|mqpl|qpni).*?\.(xlsx?|xlsm)$/i);
      if (this.relatedFiles.length > 0) {
        this.filePath = filePath;
      }
    });
  }

  pickFile(checked, fileName) {
    if (checked) {
      this.selectedFiles.push(fileName);
    } else {
      this.selectedFiles = this.selectedFiles.filter(file => file !== fileName);
    }
    this.isFileValid = this.checkFileValidity();
  }

  start() {
    this.isRunning = true;
    this.progress = 0;
    this.parsedObj = [];
    setTimeout(this.getParsedXLSX.bind(this), 500);
  }

  private getParsedXLSX() {
    const completeFilePath = this.selectedFiles.map(fileName => this.filePath + fileName);
    this.fileService.parseAllXLSXs$(completeFilePath).subscribe(
      (v: {parsedObj, fileName}) => {
        console.log(v.parsedObj, v.fileName);
        this.parsedObj.push(v);
        this.progress += 10;
      },
      e => console.error(e),
      () => {
        this.beginMerge();
      }
    );
  }

  private beginMerge() {
    this.mergeXLSX.analyze(this.parsedObj).then(v => {
        this.progress = 90;
        this.mergeXLSX.dirtyJob(this.pvsTime, this.filePath)
        .then(newFileName => {
          this.progress = 100;
          setTimeout(() => { this.isRunning = false; }, 1000);
          this.matMessage.open(`生成${newFileName}`, '对表完成', {
            duration: 2000
          });
          this.searchFiles(this.filePath);
        });
      }
    );
  }

  private checkFileValidity(): boolean {
    // no duplicate files
    const relatedFileNames = [/tips/i, /mqpl/i, /qpni/i];
    relatedFileNames.forEach(reg => {
      if (this.hasDuplicateFiles(reg)) {
        this.showErrorMessage('同一类型的表格只能选择一张');
        return false;
      }
    });
    // tips must be presented
    if (this.selectedFiles.filter(file => /tips/i.test(file)).length === 0) {
      if (this.isFileValid) {
        this.showErrorMessage('必须选择TIPS');
      }
      return false;
    }
    return true;
  }

  private hasDuplicateFiles(relatedFileName) {
    return this.selectedFiles
      .filter(file => relatedFileName.test(file))
      .length > 1;
  }

  private showErrorMessage(error: string) {
    this.matMessage.open(error, '错误', {
      duration: 1000
    });
  }

}
