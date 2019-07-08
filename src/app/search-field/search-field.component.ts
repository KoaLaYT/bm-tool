import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { debounceTime } from 'rxjs/operators';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'app-search-field',
  templateUrl: './search-field.component.html',
  styleUrls: ['./search-field.component.scss']
})
export class SearchFieldComponent implements OnInit {

  @Output() validInput = new EventEmitter();
  @Output() invalidInput = new EventEmitter();

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.pattern(/(\/|\\)$/)
  ]);

  matcher = new MyErrorStateMatcher();

  constructor() { }

  ngOnInit() {
    this.emailFormControl.valueChanges.pipe(
      debounceTime(10)
    ).subscribe(
      v => {
        if (this.emailFormControl.valid) {
          this.validInput.emit(v);
        } else {
          this.invalidInput.emit(null);
        }
      }
    );
  }

}
