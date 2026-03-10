import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemRejectedChequesDetailsComponent } from './system-rejected-cheques-details.component';

describe('SystemRejectedChequesDetailsComponent', () => {
  let component: SystemRejectedChequesDetailsComponent;
  let fixture: ComponentFixture<SystemRejectedChequesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemRejectedChequesDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemRejectedChequesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
