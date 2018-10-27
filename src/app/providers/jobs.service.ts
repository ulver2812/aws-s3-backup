import {Injectable} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import * as fs from 'fs-extra';
import {Job} from '../models/job.model';
import {UtilsService} from './utils.service';
import {JobStatus} from '../enum/job.status.enum';
import * as sugar from 'sugar';
import {JobType} from '../enum/job.type.enum';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class JobsService {

  jobs: Job[];
  jobsFile: string;
  electronService: ElectronService;

  constructor(private utils: UtilsService) {
    this.jobs = [];
    this.electronService = new ElectronService();
    this.jobsFile = this.electronService.remote.app.getPath('userData') + '/storage/jobs.json';
  }

  save(job) {
    const jobIndex = this.jobs.findIndex((item) => {
      return item.id === job.id;
    });

    if (jobIndex !== -1) {
      this.jobs[jobIndex] = job;
    } else {
      this.jobs.push(job);
    }
    fs.outputJsonSync(this.jobsFile, this.jobs);
  }

  saveAllJobs() {
    fs.outputJsonSync(this.jobsFile, this.jobs);
  }

  load() {
    fs.ensureFileSync(this.jobsFile);
    const data = fs.readJsonSync(this.jobsFile, {throws: false});
    if (data !== null) {
      for (const rawJob of data) {
        this.jobs.push(this.utils.castObj(rawJob, Job));
      }
    }
  }

  getJob(id): Job | null {
    if (this.jobs.length > 0) {
      id = Number(id);
      return this.jobs.find(item => {
        return item.id === id;
      });
    } else {
      return null;
    }
  }

  getJobs(): Job[] {
    if (this.jobs.length > 0) {
      return this.jobs;
    } else {
      return [];
    }
  }

  togglePause(job) {
    if (job.status === JobStatus.Active) {
      job.status = JobStatus.Pause;
    } else if (job.status === JobStatus.Pause) {
      job.status = JobStatus.Active;
    }
    this.save(job);
  }

  deleteJob(jobId) {
    sugar.Array.remove(this.jobs, (e) => {
      return e['id'] === jobId;
    });
    fs.outputJsonSync(this.jobsFile, this.jobs);
  }

  checkExpiredJob(job: Job) {
    if (job.status === JobStatus.Terminated) {
      return;
    }

    let endDateIsPast;
    if (job.type === JobType.OneTime) {
      endDateIsPast = moment.unix(job.startDate).isBefore();
    } else {
      endDateIsPast = moment.unix(job.endDate).isBefore();
    }

    if (endDateIsPast) {
      job.status = JobStatus.Terminated;
      this.save(job);
    }
  }
}
