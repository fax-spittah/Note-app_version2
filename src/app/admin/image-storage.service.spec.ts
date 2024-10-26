import { TestBed } from '@angular/core/testing';

import { ImageStorageService } from '../admin/image-storage.service';

describe('ImageStorageService', () => {
  let service: ImageStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
