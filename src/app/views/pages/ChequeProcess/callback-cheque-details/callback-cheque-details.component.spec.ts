import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallbackChequeDetailsComponent } from './callback-cheque-details.component';

describe('CallbackChequeDetailsComponent', () => {
  let component: CallbackChequeDetailsComponent;
  let fixture: ComponentFixture<CallbackChequeDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallbackChequeDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallbackChequeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
