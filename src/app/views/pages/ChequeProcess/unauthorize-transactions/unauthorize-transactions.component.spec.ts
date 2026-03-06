import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizeTransactionsComponent } from './unauthorize-transactions.component';

describe('UnauthorizeTransactionsComponent', () => {
  let component: UnauthorizeTransactionsComponent;
  let fixture: ComponentFixture<UnauthorizeTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizeTransactionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizeTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
