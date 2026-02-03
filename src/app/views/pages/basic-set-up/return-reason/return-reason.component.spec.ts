import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnReason } from './return-reason.component';

describe('ReturnReasonComponent', () => {
  let component: ReturnReason;
  let fixture: ComponentFixture<ReturnReason>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnReason]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReturnReason);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
