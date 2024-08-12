import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallersidebarComponent } from './installersidebar.component';

describe('InstallersidebarComponent', () => {
  let component: InstallersidebarComponent;
  let fixture: ComponentFixture<InstallersidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstallersidebarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstallersidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
