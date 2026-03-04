import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UiAdminFilterPanel } from './ui-admin-filter-panel';

describe('UiAdminFilterPanel', () => {
  let component: UiAdminFilterPanel;
  let fixture: ComponentFixture<UiAdminFilterPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UiAdminFilterPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UiAdminFilterPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
