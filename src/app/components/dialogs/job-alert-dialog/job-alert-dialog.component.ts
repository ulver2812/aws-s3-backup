import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Job} from '../../../models/job.model';
import {JobsService} from '../../../providers/jobs.service';

@Component({
  selector: 'app-job-alert-dialog',
  templateUrl: './job-alert-dialog.component.html',
  styleUrls: ['./job-alert-dialog.component.scss']
})
export class JobAlertDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<JobAlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: Job },
    private jobService: JobsService
  ) {
    dialogRef.disableClose = true;
  }

  clearAlert(): void {
    this.data.job.setAlert(false);
    this.jobService.save(this.data.job);
    this.dialogRef.close();
  }
}
