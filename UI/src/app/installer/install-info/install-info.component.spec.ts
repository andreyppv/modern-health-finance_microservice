import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallInfoComponent } from './install-info.component';

describe('InstallInfoComponent', () => {
  let component: InstallInfoComponent;
  let fixture: ComponentFixture<InstallInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
