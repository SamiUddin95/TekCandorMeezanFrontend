import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchReturnConfirmationsComponent } from './branch-return-confirmations.component';

describe('BranchReturnConfirmationsComponent', () => {
  let component: BranchReturnConfirmationsComponent;
  let fixture: ComponentFixture<BranchReturnConfirmationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchReturnConfirmationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchReturnConfirmationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
