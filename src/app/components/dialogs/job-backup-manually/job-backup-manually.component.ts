import {Component, Inject, OnInit} from '@angular/core';
import {AwsService} from '../../../providers/aws.service';
import {Job} from '../../../models/job.model';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {LogType} from '../../../enum/log.type.enum';
import {LogService} from '../../../providers/log.service';

@Component({
  selector: 'app-job-backup-manually',
  templateUrl: './job-backup-manually.component.html',
  styleUrls: ['./job-backup-manually.component.scss']
})
export class JobBackupManuallyComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<JobBackupManuallyComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { job: Job },
    private aws: AwsService,
    private logService: LogService
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

  startBackup() {
    this.logService.printLog(LogType.INFO, 'The job ' + this.data.job.name + ' was started manually.');
    this.aws.s3Sync(this.data.job);
    this.dialogRef.close();
  }

}
