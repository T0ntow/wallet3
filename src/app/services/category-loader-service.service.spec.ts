import { TestBed } from '@angular/core/testing';

import { CategoryLoaderServiceService } from './category-loader-service.service';

describe('CategoryLoaderServiceService', () => {
  let service: CategoryLoaderServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryLoaderServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
