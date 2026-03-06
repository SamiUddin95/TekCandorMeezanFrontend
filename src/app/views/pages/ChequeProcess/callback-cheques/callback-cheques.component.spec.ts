import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackChequesComponent } from './callback-cheques.component';

describe('CallbackChequesComponent', () => {
  let component: CallbackChequesComponent;
  let fixture: ComponentFixture<CallbackChequesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallbackChequesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackChequesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
