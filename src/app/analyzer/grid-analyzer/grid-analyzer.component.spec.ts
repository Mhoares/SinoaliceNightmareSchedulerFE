import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridAnalyzerComponent } from './grid-analyzer.component';

describe('GridAnalyzerComponent', () => {
  let component: GridAnalyzerComponent;
  let fixture: ComponentFixture<GridAnalyzerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridAnalyzerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridAnalyzerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
