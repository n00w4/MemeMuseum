import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guidelines } from './guidelines';

describe('Guidelines', () => {
  let component: Guidelines;
  let fixture: ComponentFixture<Guidelines>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guidelines]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guidelines);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
