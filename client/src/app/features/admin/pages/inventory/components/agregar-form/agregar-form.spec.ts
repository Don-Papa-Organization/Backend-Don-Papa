import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarForm } from './agregar-form';

describe('AgregarForm', () => {
  let component: AgregarForm;
  let fixture: ComponentFixture<AgregarForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
