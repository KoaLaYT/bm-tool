import { TestBed } from '@angular/core/testing';

import { MergeXLSXService } from './merge-xlsx.service';

describe('MergeXLSXService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MergeXLSXService = TestBed.get(MergeXLSXService);
    expect(service).toBeTruthy();
  });
});
