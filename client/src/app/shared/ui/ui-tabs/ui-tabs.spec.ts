import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiTabs } from './ui-tabs';

describe('UiTabs', () => {
  let component: UiTabs;
  let fixture: ComponentFixture<UiTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UiTabs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiTabs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
