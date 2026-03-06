import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovedTransactionsComponent } from './approved-transactions.component';

describe('ApprovedTransactionsComponent', () => {
  let component: ApprovedTransactionsComponent;
  let fixture: ComponentFixture<ApprovedTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprovedTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovedTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
