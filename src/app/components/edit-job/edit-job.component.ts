import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Job} from '../../models/job.model';
import {JobsService} from '../../providers/jobs.service';
import {AppMenuService} from '../../providers/appmenu.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {ElectronService} from 'ngx-electron';
import * as sugar from 'sugar';
import {JobType} from '../../enum/job.type.enum';
import {CronService} from '../../providers/cron.service';
import {JobSchedulerService} from '../../providers/job-scheduler.service';
import {JobAlertDialogComponent} from '../dialogs/job-alert-dialog/job-alert-dialog.component';
import {JobStatus} from '../../enum/job.status.enum';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.scss'],
})
export class EditJobComponent implements OnInit {

  job: Job;
  jobName: string;
  jobDescription: string;
  jobBucket: string;
  syncDeletedFiles: boolean;
  jobTypeSelected: JobType;

  jobStartDateFormattedRecovery: string;
  jobEndDateFormattedRecovery: string;
  jobTypeSelectedRecovery: JobType;
  filesRecovery: { path: string, type: string }[];

  jobStartDateFormatted: string;
  jobEndDateFormatted: string;
  filesError: boolean;
  scheduleError: boolean;
  files: { path: string, type: string }[];
  jobType = JobType;
  jobMonth = [];
  jobDay = [];
  jobDayOfMonth = [];
  jobTime = '00:00';
  jobMaxExecutionTime = 0;

  months = this.cronService.months;
  days = this.cronService.days;
  daysOfMonth = this.cronService.daysOfMonth;

  maxExecutionHours: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobsService,
    private appMenuService: AppMenuService,
    private snackBar: MatSnackBar,
    private electron: ElectronService,
    private cronService: CronService,
    private jobScheduler: JobSchedulerService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) {
    this.filesError = false;
    this.scheduleError = false;
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.job = this.jobService.getJob(params.id);
      this.jobName = this.job.name;
      this.jobDescription = this.job.description;
      this.jobBucket = this.job.bucket;
      this.syncDeletedFiles = this.job.syncDeletedFiles;
      this.jobTypeSelected = this.job.type;
      this.jobStartDateFormatted = this.job.getStartDateFormatted();
      this.jobEndDateFormatted = this.job.getEndDateFormatted();

      this.jobStartDateFormattedRecovery = this.jobStartDateFormatted;
      this.jobEndDateFormattedRecovery = this.jobEndDateFormatted;
      this.jobTypeSelectedRecovery = this.jobTypeSelected;

      this.translate.get('PAGES.EDIT-JOB.BREADCRUMB').subscribe((translation) => {
        this.appMenuService.changeMenuPage(translation + this.job.name);
      });

      this.files = sugar.Array.clone(this.job.files);
      this.filesRecovery = sugar.Array.clone(this.files);

      this.jobMonth = this.job.period.month;
      this.jobDay = this.job.period.day;
      this.jobDayOfMonth = this.job.period.dayOfMonth;
      this.jobTime = this.job.period.time;
      this.jobMaxExecutionTime = this.job.getMaxExecutionTimeFormatted();
      this.convertMinutesToHours(this.jobMaxExecutionTime);
    });

    Promise.resolve().then(() => {
      if (this.job.alert) {
        this.dialog.open(JobAlertDialogComponent, {
          width: '250px',
          data: {job: this.job},
          autoFocus: false
        });
      }
    });
  }

  editJob() {
    if (!this.validate()) {
      return;
    }
    this.job.period = {month: this.jobMonth, dayOfMonth: this.jobDayOfMonth, day: this.jobDay, time: this.jobTime};

    this.job.setStartDate(this.jobStartDateFormatted);
    this.job.setEndDate(this.jobEndDateFormatted);
    this.job.type = this.jobTypeSelected;
    this.job.files = sugar.Array.clone(this.files);

    if (this.jobScheduler.addJobInScheduler(this.job) === null) {
      this.scheduleError = true;
      this.job.setStartDate(this.jobStartDateFormattedRecovery);
      this.job.setEndDate(this.jobEndDateFormattedRecovery);
      this.job.type = this.jobTypeSelectedRecovery;
      this.job.files = sugar.Array.clone(this.filesRecovery);
      return;
    } else {
      this.scheduleError = false;
    }
    this.job.setStatus(JobStatus.Active);
    this.job.setMaxExecutionTime(this.jobMaxExecutionTime);
    this.job.name = this.jobName;
    this.job.description = this.jobDescription;
    this.job.bucket = this.jobBucket;
    this.job.syncDeletedFiles = this.syncDeletedFiles;
    this.jobService.save(this.job);

    this.snackBar.open(this.job.name + ' Job saved', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'app-snackbar'
    });
  }

  showFileBrowser() {
    this.electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, (filePaths) => {
      if (filePaths !== undefined) {
        filePaths.forEach((item) => {
          this.addFile(item, 'file');
        });
        this.filesError = false;
      }
      this.electron.remote.getCurrentWindow().blurWebView();
    });
  }

  showDirBrowser() {
    this.electron.remote.dialog.showOpenDialog({properties: ['openDirectory', 'multiSelections']}, (filePaths) => {
      if (filePaths !== undefined) {
        filePaths.forEach((item) => {
          this.addFile(item, 'folder');
        });
        this.filesError = false;
      }
      this.electron.remote.getCurrentWindow().blurWebView();
    });
  }

  private validate() {
    if (
      !sugar.String.isBlank(this.job.name) &&
      !sugar.String.isBlank(this.job.bucket) &&
      sugar.Number.isInteger(this.job.endDate) &&
      sugar.Number.isInteger(this.job.startDate) &&
      this.files.length > 0
    ) {
      return true;
    }

    if (this.files.length === 0) {
      this.filesError = true;
    }
    return false;
  }

  removeFile(path) {
    sugar.Array.remove(this.files, e => e['path'] === path);
  }

  addFile(item, type) {
    const found = this.files.some(function (el) {
      return el.path === item;
    });

    if (!found) {
      this.files.push({'path': item, type: type});
    }
  }

  convertMinutesToHours(minutes) {
    const res = minutes / 60;
    this.maxExecutionHours = res.toFixed(2);
  }
}
