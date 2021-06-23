import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NightmareComponent } from './nightmare.component';

describe('NightmareComponent', () => {
  let component: NightmareComponent;
  let fixture: ComponentFixture<NightmareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NightmareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NightmareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
