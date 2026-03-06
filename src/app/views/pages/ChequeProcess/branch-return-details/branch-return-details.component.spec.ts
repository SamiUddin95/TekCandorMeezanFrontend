import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchReturnDetailsComponent } from './branch-return-details.component';

describe('BranchReturnDetailsComponent', () => {
  let component: BranchReturnDetailsComponent;
  let fixture: ComponentFixture<BranchReturnDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchReturnDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BranchReturnDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
