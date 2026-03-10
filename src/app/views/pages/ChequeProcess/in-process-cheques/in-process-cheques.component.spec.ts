import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InProcessChequesComponent } from './in-process-cheques.component';

describe('InProcessChequesComponent', () => {
  let component: InProcessChequesComponent;
  let fixture: ComponentFixture<InProcessChequesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InProcessChequesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InProcessChequesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
