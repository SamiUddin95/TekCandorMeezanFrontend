import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnauthorizeTransactionsDetailsComponent } from './unauthorize-transactions-details.component';

describe('UnauthorizeTransactionsDetailsComponent', () => {
  let component: UnauthorizeTransactionsDetailsComponent;
  let fixture: ComponentFixture<UnauthorizeTransactionsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizeTransactionsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnauthorizeTransactionsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
