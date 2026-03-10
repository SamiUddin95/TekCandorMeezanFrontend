import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InProcessChequesDetailsComponent } from './in-process-cheques-details.component';

describe('InProcessChequesDetailsComponent', () => {
  let component: InProcessChequesDetailsComponent;
  let fixture: ComponentFixture<InProcessChequesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InProcessChequesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InProcessChequesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
