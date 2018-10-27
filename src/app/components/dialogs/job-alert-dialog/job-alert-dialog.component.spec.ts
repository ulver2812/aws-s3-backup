import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobAlertDialogComponent } from './job-alert-dialog.component';

describe('JobAlertDialogComponent', () => {
  let component: JobAlertDialogComponent;
  let fixture: ComponentFixture<JobAlertDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobAlertDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobAlertDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
