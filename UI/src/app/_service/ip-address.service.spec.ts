import { TestBed } from '@angular/core/testing';

import { IpAddressService } from './ip-address.service';

describe('IpAddressService', () => {
  let service: IpAddressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpAddressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
