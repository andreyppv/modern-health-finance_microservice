import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecisionEngineComponent } from './decision-engine.component';

describe('DecisionEngineComponent', () => {
  let component: DecisionEngineComponent;
  let fixture: ComponentFixture<DecisionEngineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecisionEngineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecisionEngineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
