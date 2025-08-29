import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeOfTheDay } from './meme-of-the-day';

describe('MemeOfTheDay', () => {
  let component: MemeOfTheDay;
  let fixture: ComponentFixture<MemeOfTheDay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemeOfTheDay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeOfTheDay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
