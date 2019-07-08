import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Observable, fromEvent } from 'rxjs';
import { map, startWith, debounceTime, throttleTime, merge } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { LocalStorageService } from '../local-storage.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-info-field',
  templateUrl: './info-field.component.html',
  styleUrls: ['./info-field.component.scss']
})
export class InfoFieldComponent implements OnInit {

  @Output() infoChange = new EventEmitter();

  projectName = new FormControl('', [
    Validators.required
  ]);
  projects: string[];
  filteredProjects: Observable<string[]>;

  dateFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/^\d{4}-KW\d{2}$/)
  ]);
  matcher = new MyErrorStateMatcher();

  // icons
  faTimes = faTimes;

  constructor(
    private localStorage: LocalStorageService,
    private message: MatSnackBar) { }

  ngOnInit() {
    // autocomplete handlers
    this.updateProjects();
    this.filteredProjects = this.projectName.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filter(value))
      );
    // save button handlers
    const button = document.querySelector('button');
    const clicks = fromEvent(button, 'click').pipe(
      throttleTime(500)
    );
    clicks.subscribe(_ => {
      this.localStorage.set(this.projectName.value, this.dateFormControl.value);
      this.updateProjects();
      this.message.open(`项目：${this.projectName.value}`, '保存成功', {
        duration: 2000
      });
    });
    // valid information event emitter
    const projectInfoStream = this.projectName.valueChanges.pipe(
      startWith(''),
      merge(this.dateFormControl.valueChanges),
      throttleTime(10)
    );
    projectInfoStream.subscribe( _ => {
      setTimeout(() => this.infoChange.emit({
        validity: this.projectName.valid && this.dateFormControl.valid,
        projectName: this.projectName.value,
        pvsTime: this.dateFormControl.value
      }), 0);
    });
  }

  private sync(project) {
    this.dateFormControl.setValue(this.localStorage.get(project).pvsTime);
  }

  private delete(e, project) {
    e.stopPropagation();
    this.localStorage.delete(project);
    this.updateProjects();
    this.projectName.setValue('');
  }

  private filter(value: string): string[] {
    return this.projects.filter(
      project => project.toLowerCase().includes(value.toLowerCase()));
  }

  private updateProjects() {
    this.projects = this.localStorage.lastRecords();
  }

}
