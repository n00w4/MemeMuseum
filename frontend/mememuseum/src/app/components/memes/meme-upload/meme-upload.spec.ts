import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemeUpload } from './meme-upload';

describe('MemeUpload', () => {
  let component: MemeUpload;
  let fixture: ComponentFixture<MemeUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemeUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemeUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
