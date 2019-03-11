import {Component, OnInit} from '@angular/core';
import {Job} from '../../models/job.model';
import {MatSnackBar} from '@angular/material';
import {JobsService} from '../../providers/jobs.service';
import {Router} from '@angular/router';
import {AppMenuService} from '../../providers/appmenu.service';
import {ElectronService} from 'ngx-electron';
import * as sugar from 'sugar';
import {JobType} from '../../enum/job.type.enum';
import {CronService} from '../../providers/cron.service';
import {JobSchedulerService} from '../../providers/job-scheduler.service';

@Component({
  selector: 'app-new-job',
  templateUrl: './new-job.component.html',
  styleUrls: ['./new-job.component.scss']
})
export class NewJobComponent implements OnInit {

  job: Job;
  jobStartDateFormatted: string;
  jobMaxExecutionTimeFormatted: number;
  jobEndDateFormatted: string;
  filesError: boolean;
  scheduleError: boolean;
  jobType = JobType;
  jobMonth = [];
  jobDay = [];
  jobDayOfMonth = [];
  jobTime = '00:00';
  maxExecutionHours: string;

  months = this.cronService.months;
  days = this.cronService.days;
  daysOfMonth = this.cronService.daysOfMonth;

  constructor(
    private snackBar: MatSnackBar,
    private jobService: JobsService,
    private router: Router,
    private appMenuService: AppMenuService,
    private electron: ElectronService,
    private cronService: CronService,
    private jobScheduler: JobSchedulerService
  ) {
    this.job = new Job();
    this.filesError = false;
    this.scheduleError = false;
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('PAGES.NEW-JOB.MENU');
    this.jobStartDateFormatted = this.job.getStartDateFormatted();
    this.jobEndDateFormatted = this.job.getEndDateFormatted();
    this.jobMaxExecutionTimeFormatted = this.job.getMaxExecutionTimeFormatted();
    this.convertMinutesToHours(this.jobMaxExecutionTimeFormatted);
  }

  saveNewJob() {
    if (!this.validate()) {
      return;
    }
    this.job.period = {month: this.jobMonth, dayOfMonth: this.jobDayOfMonth, day: this.jobDay, time: this.jobTime};
    if (this.jobScheduler.addJobInScheduler(this.job) === null) {
      this.scheduleError = true;
      return;
    }
    this.jobService.save(this.job);
    this.router.navigateByUrl('');
    this.snackBar.open('New job saved', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'app-snackbar'
    });
  }

  showFileBrowser() {
    this.electron.remote.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']}, (filePaths) => {
      if (filePaths !== undefined) {
        filePaths.forEach((item) => {
          this.job.addFile(item, 'file');
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
          this.job.addFile(item, 'folder');
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
      this.job.files.length > 0
    ) {
      return true;
    }

    if (this.job.files.length === 0) {
      this.filesError = true;
    }
    return false;
  }

  convertMinutesToHours(minutes) {
    const res = minutes / 60;
    this.maxExecutionHours = res.toFixed(2);
  }
}
