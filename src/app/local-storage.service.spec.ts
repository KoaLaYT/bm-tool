import { TestBed } from '@angular/core/testing';

import { LocalStorarageService } from './local-storarage.service';

describe('LocalStorarageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalStorarageService = TestBed.get(LocalStorarageService);
    expect(service).toBeTruthy();
  });
});
