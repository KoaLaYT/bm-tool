import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef } from '@angular/core';
import { FormControl, Validators, FormBuilder } from '@angular/forms';

import { MatSnackBar } from '@angular/material';
import { ErrorStateMatcher } from '@angular/material/core';

import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { Subscription, Observable, fromEvent, merge } from 'rxjs';
import { throttleTime, startWith, map } from 'rxjs/operators';

import { MyErrorStateMatcher } from './../bm-merge/bm-merge.component';

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
  public terminplan = this.fb.group({
    VFFTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    VFF: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    PVSTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    PVS: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    OSTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    OS: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    SOPTBT: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }],
    SOP: ['', { validators: [Validators.required, Validators.pattern(/^\d{4}-KW\d{2}$/)] }]
  });
  public matcher = new MyErrorStateMatcher();

  public filteredProjects: Observable<string[]>;

  // fontawesome icons
  public faTimes = faTimes;

  private projects: string[];

  // elementrefs
  @ViewChild('projectInput', { static: true }) projectInputElement: ElementRef;

  constructor(private fb: FormBuilder, private localStorage: LocalStorageService, private message: MatSnackBar) {}

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
            this.terminplan.value
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
    this.terminplan.patchValue(projectInfo.terminplan);
  }

  public delete(e, project: string) {
    e.stopPropagation();
    this.localStorage.delete(project);
    this.updateProjects();
    // clear all inputs
    this.projectFormControl.reset();
    this.weekEndFormControl.reset();
    this.weekStartFormControl.reset();
    this.terminplan.reset();
  }

  private filter(value: string): string[] {
    return this.projects.filter(project => project.toLowerCase().includes(value.toLowerCase()));
  }

  private updateProjects() {
    this.projects = this.localStorage.lastRecords();
  }

  /**
   * helper functions for access form names
   */
  public get VFFTBT() {
    return this.terminplan.get('VFFTBT');
  }
  public get VFF() {
    return this.terminplan.get('VFF');
  }
  public get PVSTBT() {
    return this.terminplan.get('PVSTBT');
  }
  public get PVS() {
    return this.terminplan.get('PVS');
  }
  public get OSTBT() {
    return this.terminplan.get('OSTBT');
  }
  public get OS() {
    return this.terminplan.get('OS');
  }
  public get SOPTBT() {
    return this.terminplan.get('SOPTBT');
  }
  public get SOP() {
    return this.terminplan.get('SOP');
  }
}
