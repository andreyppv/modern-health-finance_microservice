import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingContractsDetailsComponent } from './funding-contracts-details.component';

describe('FundingContractsDetailsComponent', () => {
  let component: FundingContractsDetailsComponent;
  let fixture: ComponentFixture<FundingContractsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundingContractsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingContractsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
