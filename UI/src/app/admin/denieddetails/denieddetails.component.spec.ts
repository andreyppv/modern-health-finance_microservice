import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenieddetailsComponent } from './denieddetails.component';

describe('DenieddetailsComponent', () => {
  let component: DenieddetailsComponent;
  let fixture: ComponentFixture<DenieddetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DenieddetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DenieddetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
