import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingsdetailsComponent } from './pendingsdetails.component';

describe('PendingsdetailsComponent', () => {
  let component: PendingsdetailsComponent;
  let fixture: ComponentFixture<PendingsdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingsdetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingsdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
