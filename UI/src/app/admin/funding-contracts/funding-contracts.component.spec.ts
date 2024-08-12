import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingContractsComponent } from './funding-contracts.component';

describe('FundingContractsComponent', () => {
  let component: FundingContractsComponent;
  let fixture: ComponentFixture<FundingContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FundingContractsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FundingContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
