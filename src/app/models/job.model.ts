import * as moment from 'moment';
import {IJob} from '../interfaces/ijob';
import {JobStatus} from '../enum/job.status.enum';
import {JobType} from '../enum/job.type.enum';
import * as sugar from 'sugar';

export class Job implements IJob {
  id: number;
  name: string;
  description: string;
  syncDeletedFiles: boolean;
  startDate: number;
  endDate: number;
  period: { month: number[], dayOfMonth: number[], day: number[], time: string };
  type: JobType;
  status: JobStatus;
  files: { path: string, type: string }[];
  bucket: string;
  alert: boolean;
  isRunning: boolean;
  maxExecutionTime: number;

  constructor() {
    this.id = moment().unix();
    this.name = '';
    this.description = '';
    this.syncDeletedFiles = true;
    this.startDate = moment().unix();
    this.endDate = moment().add('7', 'days').unix();
    this.period = {month: [], dayOfMonth: [], day: [], time: '00:00'};
    this.type = JobType.OneTime;
    this.files = [];
    this.bucket = '';
    this.status = JobStatus.Active;
    this.alert = false;
    this.isRunning = false;
    this.maxExecutionTime = 0;
  }

  getStartDateFormatted(): string {
    return moment.unix(this.startDate).format('YYYY-MM-DDTHH:mm');
  }

  getStartDateReadable(): string {
    return moment.unix(this.startDate).format('DD/MM/YYYY HH:mm');
  }

  getEndDateReadable(): string {
    return moment.unix(this.endDate).format('DD/MM/YYYY HH:mm');
  }

  setStartDate(formattedDate) {
    this.startDate = moment(formattedDate).unix();
  }

  getEndDateFormatted(): string {
    return moment.unix(this.endDate).format('YYYY-MM-DDTHH:mm');
  }

  setEndDate(formattedDate) {
    this.endDate = moment(formattedDate).unix();
  }

  getMaxExecutionTimeFormatted(): number {
    return (this.maxExecutionTime / 1000) / 60;
  }

  getMaxExecutionTimeFormattedHours(): string {
    const res = this.getMaxExecutionTimeFormatted() / 60;
    return res.toFixed(2);
  }

  setMaxExecutionTime(formattedMaxExecutionTime) {
    this.maxExecutionTime = sugar.Number.minutes(formattedMaxExecutionTime);
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

  setStatus(status: JobStatus) {
    this.status = status;
  }

  setAlert(alert: boolean) {
    this.alert = alert;
  }

  setIsRunning(isRunning: boolean) {
    this.isRunning = isRunning;
  }
}
