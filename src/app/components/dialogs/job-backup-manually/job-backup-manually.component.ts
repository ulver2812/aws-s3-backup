import {Component, Inject, OnInit} from '@angular/core';
import {AwsService} from '../../../providers/aws.service';
import {Job} from '../../../models/job.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-job-backup-manually',
  templateUrl: './job-backup-manually.component.html',
  styleUrls: ['./job-backup-manually.component.scss']
})
export class JobBackupManuallyComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<JobBackupManuallyComponent>,
              @Inject(MAT_DIALOG_DATA) public data: { job: Job },
              private aws: AwsService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  startBackup() {
    this.aws.s3Sync(this.data.job);
    this.dialogRef.close();
  }

}
