import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobBackupManuallyComponent } from './job-backup-manually.component';

describe('JobBackupManuallyComponent', () => {
  let component: JobBackupManuallyComponent;
  let fixture: ComponentFixture<JobBackupManuallyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobBackupManuallyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobBackupManuallyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
