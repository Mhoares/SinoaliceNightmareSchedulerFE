import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NightmaresComponent } from './nightmares.component';

describe('NightmaresComponent', () => {
  let component: NightmaresComponent;
  let fixture: ComponentFixture<NightmaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NightmaresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NightmaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
