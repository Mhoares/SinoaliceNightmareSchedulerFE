import { TestBed } from '@angular/core/testing';

import { ShareGridService } from './share-grid.service';

describe('ShareGridService', () => {
  let service: ShareGridService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareGridService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
