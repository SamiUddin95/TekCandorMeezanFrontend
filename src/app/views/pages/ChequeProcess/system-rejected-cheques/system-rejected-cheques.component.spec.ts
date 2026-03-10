import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemRejectedChequesComponent } from './system-rejected-cheques.component';

describe('SystemRejectedChequesComponent', () => {
  let component: SystemRejectedChequesComponent;
  let fixture: ComponentFixture<SystemRejectedChequesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemRejectedChequesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemRejectedChequesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
