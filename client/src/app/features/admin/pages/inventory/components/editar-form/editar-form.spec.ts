import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarForm } from './editar-form';

describe('EditarForm', () => {
  let component: EditarForm;
  let fixture: ComponentFixture<EditarForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditarForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
