import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

// electron module
import { NgxElectronModule } from 'ngx-electron';

// material components
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// fontawesome icons
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// self defined component
import { AppComponent } from './app.component';
import { BmMergeComponent } from './bm-merge/bm-merge.component';
import { BmDrawerComponent } from './bm-drawer/bm-drawer.component';

@NgModule({
  declarations: [
    AppComponent,
    BmMergeComponent,
    BmDrawerComponent
  ],
  imports: [
    BrowserModule,
    NgxElectronModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTabsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
