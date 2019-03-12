import {Component, OnInit} from '@angular/core';
import {Job} from '../../models/job.model';
import {JobsService} from '../../providers/jobs.service';
import {JobStatus} from '../../enum/job.status.enum';
import {AppMenuService} from '../../providers/appmenu.service';
import {JobType} from '../../enum/job.type.enum';
import {JobSchedulerService} from '../../providers/job-scheduler.service';
import {MatDialog} from '@angular/material';
import {JobBackupManuallyComponent} from '../dialogs/job-backup-manually/job-backup-manually.component';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {ProcessesHandlerService} from '../../providers/processes-handler.service';
import {LogService} from '../../providers/log.service';
import {LogType} from '../../enum/log.type.enum';

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
  maxExecutionTimeHours: string[];

  constructor(
    private jobService: JobsService,
    private appMenuService: AppMenuService,
    public jobScheduler: JobSchedulerService,
    private dialog: MatDialog,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private processesHandler: ProcessesHandlerService,
    private logService: LogService
  ) {
    this.registerIcons();
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('PAGES.JOB-LIST.TITLE');
    this.jobs = this.jobService.getJobs();
    this.maxExecutionTimeHours = [];
    this.jobs.forEach((element) => {
      this.maxExecutionTimeHours.push(element.getMaxExecutionTimeFormattedHours());
    });
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

  stopBackupNow(job: Job) {
    this.logService.printLog(LogType.INFO, 'The job ' +  job.name + ' was stopped manually.');
    this.processesHandler.killJobProcesses(job.id);
    event.stopPropagation();
  }

  registerIcons() {
    this.matIconRegistry.addSvgIcon(
      'custom_icon_check',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/check.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_play',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/play.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_pause',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/pause.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_delete',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/delete.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_cloud_up',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/cloud_up.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_alert',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/alert.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_working',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/working.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_done',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/done.svg')
    );
  }
}
