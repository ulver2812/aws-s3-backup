import {Component, OnInit} from '@angular/core';
import {Job} from '../../models/job.model';
import {JobsService} from '../../providers/jobs.service';
import {JobStatus} from '../../enum/job.status.enum';
import {AppMenuService} from '../../providers/appmenu.service';
import {JobType} from '../../enum/job.type.enum';
import {JobSchedulerService} from '../../providers/job-scheduler.service';
import {MatDialog} from '@angular/material';
import {JobBackupManuallyComponent} from '../dialogs/job-backup-manually/job-backup-manually.component';

@Component({
  selector: 'app-jobs-list',
  templateUrl: './jobs-list.component.html',
  styleUrls: ['./jobs-list.component.scss']
})
export class JobsListComponent implements OnInit {

  jobStatus = JobStatus;
  jobType = JobType;
  jobs: Job[];
  scheduledJobs: string[];

  constructor(
    private jobService: JobsService,
    private appMenuService: AppMenuService,
    public jobScheduler: JobSchedulerService,
    private dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('PAGES.JOB-LIST.TITLE');
    this.jobs = this.jobService.getJobs();
    this.scheduledJobs = this.jobScheduler.getScheduledJobsFormattedTime();
  }

  togglePause(job: Job) {
    this.jobScheduler.togglePause(job);
    this.jobService.togglePause(job);
    event.stopPropagation();
  }

  deleteJob(jobId) {
    this.jobService.deleteJob(jobId);
    event.stopPropagation();
  }

  startBackupManually(job) {
    this.dialog.open(JobBackupManuallyComponent, {
      width: '350px',
      data: {job: job},
      autoFocus: false
    });
    event.stopPropagation();
  }
}
