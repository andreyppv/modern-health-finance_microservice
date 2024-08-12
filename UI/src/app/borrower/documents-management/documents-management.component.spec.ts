import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsManagementComponent } from './documents-management.component';

describe('DocumentsManagementComponent', () => {
  let component: DocumentsManagementComponent;
  let fixture: ComponentFixture<DocumentsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentsManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
