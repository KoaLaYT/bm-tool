import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BmDrawerComponent } from './bm-drawer.component';

describe('BmDrawerComponent', () => {
  let component: BmDrawerComponent;
  let fixture: ComponentFixture<BmDrawerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BmDrawerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BmDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
