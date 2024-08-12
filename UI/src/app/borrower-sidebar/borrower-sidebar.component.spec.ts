import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowerSidebarComponent } from './borrower-sidebar.component';

describe('BorrowerSidebarComponent', () => {
  let component: BorrowerSidebarComponent;
  let fixture: ComponentFixture<BorrowerSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BorrowerSidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowerSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
