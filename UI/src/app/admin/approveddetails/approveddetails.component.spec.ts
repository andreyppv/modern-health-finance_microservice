import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveddetailsComponent } from './approveddetails.component';

describe('ApproveddetailsComponent', () => {
  let component: ApproveddetailsComponent;
  let fixture: ComponentFixture<ApproveddetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveddetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
