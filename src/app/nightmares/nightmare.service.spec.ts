import { TestBed } from '@angular/core/testing';

import { NightmareService } from './nightmare.service';

describe('NightmareService', () => {
  let service: NightmareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NightmareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
