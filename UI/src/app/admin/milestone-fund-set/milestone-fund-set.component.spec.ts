import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MilestoneFundSetComponent } from './milestone-fund-set.component';

describe('MilestoneFundSetComponent', () => {
  let component: MilestoneFundSetComponent;
  let fixture: ComponentFixture<MilestoneFundSetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MilestoneFundSetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MilestoneFundSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
