import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialNoteComponent } from './initial-note.component';

describe('InitialNoteComponent', () => {
  let component: InitialNoteComponent;
  let fixture: ComponentFixture<InitialNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InitialNoteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InitialNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
