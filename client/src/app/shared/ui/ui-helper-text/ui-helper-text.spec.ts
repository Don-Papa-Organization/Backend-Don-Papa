import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiHelperText } from './ui-helper-text';

describe('UiHelperText', () => {
  let component: UiHelperText;
  let fixture: ComponentFixture<UiHelperText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UiHelperText]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiHelperText);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
