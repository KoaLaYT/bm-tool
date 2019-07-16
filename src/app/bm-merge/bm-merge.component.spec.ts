import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BmMergeComponent } from './bm-merge.component';

describe('BmMergeComponent', () => {
  let component: BmMergeComponent;
  let fixture: ComponentFixture<BmMergeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BmMergeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BmMergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
