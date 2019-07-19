import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { Subscription, Observable, fromEvent, merge } from 'rxjs';
import { throttleTime, startWith, map } from 'rxjs/operators';

import { MyErrorStateMatcher } from './../bm-merge/bm-merge.component';

import { FileService } from '../file.service';
import { LocalStorageService } from '../local-storage.service';

@Component({
  selector: 'app-bm-drawer',
  templateUrl: './bm-drawer.component.html',
  styleUrls: ['./bm-drawer.component.scss']
})
export class BmDrawerComponent implements OnInit, OnChanges {
  @Input() isSelected: boolean;
  private clickSubscription: Subscription;
  public isDualPVS = false;
  public projectFormControl = new FormControl('', [Validators.required]);
  public weekStartFormControl = new FormControl('', [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)]);
  public weekEndFormControl = new FormControl('', [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)]);
  public terminplanZP5 = this.fb.group({
    ZP5VFFTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5VFF: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5PVSTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5PVS: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5OSTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5OS: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5SOPTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP5SOP: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }]
  });
  public terminplanZP7 = this.fb.group({
    ZP7VFFTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7VFF: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7PVSTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7PVS: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7OSTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7OS: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7SOPTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    ZP7SOP: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }]
  });
  public matcher = new MyErrorStateMatcher();

  public filteredProjects: Observable<string[]>;

  // fontawesome icons
  public faTimes = faTimes;

  private projects: string[];

  // draw indicator
  public isDrawing = false;

  // elementrefs
  @ViewChild('projectInput', { static: true }) projectInputElement: ElementRef;

  // file picker
  public fileName = '';
  public filePath = '';

  // KW selector
  public currentKW: string = '';
  public totalKWs: string[] = [];

  constructor(
    private ref: ChangeDetectorRef,
    private fb: FormBuilder,
    private fileService: FileService,
    private localStorage: LocalStorageService,
    private message: MatSnackBar
  ) {}

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

    this.fileService.drawingInfo$.subscribe(info => {
      if (info === 'closed') {
        this.isDrawing = false;
      }
      this.ref.detectChanges();
    });

    // update terminplan weeks range
    merge(this.weekStartFormControl.valueChanges, this.weekEndFormControl.valueChanges).subscribe(_ => {
      if (this.weekEndFormControl.value && this.weekStartFormControl.value) {
        this.totalKWs = this.getFullWeeksArray(this.weekStartFormControl.value, this.weekEndFormControl.value);
      }
    });
  }

  ngOnChanges() {
    if (this.isSelected) {
      const button = document.querySelector('#save-button2');
      this.clickSubscription = fromEvent(button, 'click')
        .pipe(throttleTime(500))
        .subscribe(_ => {
          this.localStorage.setFullProjectInfo(
            this.projectFormControl.value,
            this.weekStartFormControl.value,
            this.weekEndFormControl.value,
            this.terminplanZP5.value,
            this.terminplanZP7.value
          );
          this.updateProjects();
          this.message.open(`项目：${this.projectFormControl.value}`, '保存成功', {
            duration: 2000
          });
        });
    } else if (this.clickSubscription) {
      this.clickSubscription.unsubscribe();
    }
  }

  public sync(project: string) {
    const projectInfo = this.localStorage.getFullProjectInfo(project);
    this.weekStartFormControl.setValue(projectInfo.startWeek || '');
    this.weekEndFormControl.setValue(projectInfo.endWeek || '');
    this.terminplanZP5.patchValue(projectInfo.terminplan.ZP5);
    this.terminplanZP7.patchValue(projectInfo.terminplan.ZP7);
  }

  public reset() {
    this.projectFormControl.reset();
    this.weekEndFormControl.reset();
    this.weekStartFormControl.reset();
    this.terminplanZP5.reset();
    this.terminplanZP7.reset();
  }

  public draw() {
    this.isDrawing = true;
    // drawing detation
    const dateInfo = {
      startWeek: this.weekStartFormControl.value,
      endWeek: this.weekEndFormControl.value,
      isDualPVS: this.isDualPVS,
      currentKW: this.currentKW,
      terminplan: {
        ZP5: this.terminplanZP5.value,
        ZP7: this.terminplanZP7.value
      }
    };
    this.fileService.draw(this.filePath, dateInfo);
  }

  public delete(e, project: string) {
    e.stopPropagation();
    this.localStorage.delete(project);
    this.updateProjects();
    // clear all inputs
    this.reset();
  }

  public test(e) {
    this.filePath = e.files[0].path;
    this.fileName = e.files[0].name;

    if (!/mqpl/i.test(this.fileName)) {
      this.message.open(`${this.fileName}`, '不是MQPL母表', {
        duration: 2000
      });
      this.filePath = this.fileName = '';
    }
  }

  private filter(value: string): string[] {
    return this.projects.filter(project => project.toLowerCase().includes(value.toLowerCase()));
  }

  private updateProjects() {
    this.projects = this.localStorage.lastRecords();
  }

  private getFullWeeksArray(startWeek: string, endWeek: string): string[] {
    const result = [];

    let currentWeek = startWeek;
    while (currentWeek <= endWeek) {
      result.push(currentWeek);
      let week: number | string = Number(currentWeek.slice(7));
      let year = Number(currentWeek.slice(0, 4));

      if (week + 1 > 52) {
        year = year + 1;
      }
      week = (week % 52) + 1;
      week = week < 10 ? '0' + week : week;
      currentWeek = year + '-KW' + week;
    }

    return result;
  }

  /**
   * helper functions for access form names
   */
  // ZP5
  public get ZP5VFFTBT() {
    return this.terminplanZP5.get('ZP5VFFTBT');
  }
  public get ZP5VFF() {
    return this.terminplanZP5.get('ZP5VFF');
  }
  public get ZP5PVSTBT() {
    return this.terminplanZP5.get('ZP5PVSTBT');
  }
  public get ZP5PVS() {
    return this.terminplanZP5.get('ZP5PVS');
  }
  public get ZP5OSTBT() {
    return this.terminplanZP5.get('ZP5OSTBT');
  }
  public get ZP5OS() {
    return this.terminplanZP5.get('ZP5OS');
  }
  public get ZP5SOPTBT() {
    return this.terminplanZP5.get('ZP5SOPTBT');
  }
  public get ZP5SOP() {
    return this.terminplanZP5.get('ZP5SOP');
  }
  // ZP7
  public get ZP7VFFTBT() {
    return this.terminplanZP7.get('ZP7VFFTBT');
  }
  public get ZP7VFF() {
    return this.terminplanZP7.get('ZP7VFF');
  }
  public get ZP7PVSTBT() {
    return this.terminplanZP7.get('ZP7PVSTBT');
  }
  public get ZP7PVS() {
    return this.terminplanZP7.get('ZP7PVS');
  }
  public get ZP7OSTBT() {
    return this.terminplanZP7.get('ZP7OSTBT');
  }
  public get ZP7OS() {
    return this.terminplanZP7.get('ZP7OS');
  }
  public get ZP7SOPTBT() {
    return this.terminplanZP7.get('ZP7SOPTBT');
  }
  public get ZP7SOP() {
    return this.terminplanZP7.get('ZP7SOP');
  }
}
