import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareGridComponent } from './share-grid.component';

describe('ShareGridComponent', () => {
  let component: ShareGridComponent;
  let fixture: ComponentFixture<ShareGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
