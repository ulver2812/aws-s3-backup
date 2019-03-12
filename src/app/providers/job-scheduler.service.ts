import {Injectable} from '@angular/core';
import * as schedule from 'node-schedule';
import {JobsService} from './jobs.service';
import {JobType} from '../enum/job.type.enum';
import * as moment from 'moment';
import {CronService} from './cron.service';
import {Job} from '../models/job.model';
import {JobStatus} from '../enum/job.status.enum';
import * as sugar from 'sugar';
import {AwsService} from './aws.service';
import * as chokidar from 'chokidar';
import {LogService} from './log.service';
import {LogType} from '../enum/log.type.enum';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class JobSchedulerService {

  scheduledJobs: { jobId: number, scheduler: schedule.Job | chokidar }[];

  constructor(
    private jobService: JobsService,
    private cronService: CronService,
    private awsService: AwsService,
    private logService: LogService,
    private translate: TranslateService,
  ) {
    this.scheduledJobs = [];
  }

  bootstrapScheduleJobs() {
    let isTerminated = false;
    const jobs = this.jobService.getJobs();
    let endDateIsPast;
    jobs.forEach((job) => {
      if (job.type === JobType.Live && job.status === JobStatus.Active) {
        this.addJobInScheduler(job);
        return;
      }

      if (job.type === JobType.OneTime) {
        endDateIsPast = moment.unix(job.startDate).isBefore();
      } else {
        endDateIsPast = moment.unix(job.endDate).isBefore();
      }

      if (!endDateIsPast) {
        if (job.status === JobStatus.Active) {
          this.addJobInScheduler(job);
        }
      } else {
        if (job.status !== JobStatus.Terminated) {
          job.status = JobStatus.Terminated;
          isTerminated = true;
        }
      }
    });

    if (isTerminated) {
      this.jobService.saveAllJobs();
    }
  }

  addJobInScheduler(job: Job) {

    let scheduler = null;
    const startTime = moment.unix(job.startDate).toDate();

    if (job.type === JobType.OneTime) {
      // ONE TIME JOB
      scheduler = schedule.scheduleJob(startTime, () => {
        this.awsService.s3Sync(job);
      });
    } else if (job.type === JobType.Recurring) {
      // RECURRING JOB
      const endTime = moment.unix(job.endDate).toDate();
      const cronRule = this.cronService.getCronStringFromJobPeriod(job.period);
      scheduler = schedule.scheduleJob({start: startTime, end: endTime, rule: cronRule}, () => {
        this.awsService.s3Sync(job);
      });
    } else if (job.type === JobType.Live) {
      // LIVE JOB
      const watchedPath = [];
      job.files.forEach((item) => {
        watchedPath.push(item.path);
      });

      const lazyS3Sync = sugar.Function.lazy(() => {
        this.awsService.s3Sync(job);
      }, 10000, true, 2);

      scheduler = chokidar.watch(watchedPath, {awaitWriteFinish: true});

      scheduler.on('ready', () => {
        lazyS3Sync();
        scheduler.on('all', (path, event) => {
          lazyS3Sync();
        });
      });

      scheduler.on('error', (err) => {
        this.logService.printLog(LogType.ERROR, 'Can\'t run live sync for ' + job.name + ' because of: \r\n' + err);
        job.alert = true;
        this.jobService.save(job);
      });
    }

    if (scheduler === null) {
      return null;
    }

    const scheduledJob = {jobId: job.id, scheduler: scheduler};

    const jobIndex = this.scheduledJobs.findIndex((item) => {
      return item.jobId === scheduledJob.jobId;
    });

    if (jobIndex !== -1) {
      if (this.scheduledJobs[jobIndex].scheduler instanceof schedule.Job) {
        this.scheduledJobs[jobIndex].scheduler.cancel();
      } else {
        this.scheduledJobs[jobIndex].scheduler.close();
      }
      this.scheduledJobs[jobIndex] = scheduledJob;
    } else {
      this.scheduledJobs.push(scheduledJob);
    }

    return true;
  }

  removeJobInScheduler(job: Job) {
    const jobIndex = this.scheduledJobs.findIndex((item) => {
      return item.jobId === job.id;
    });

    if (jobIndex !== -1) {
      if (this.scheduledJobs[jobIndex].scheduler instanceof schedule.Job) {
        this.scheduledJobs[jobIndex].scheduler.cancel();
      } else {
        this.scheduledJobs[jobIndex].scheduler.close();
      }
      sugar.Array.removeAt(this.scheduledJobs, jobIndex);
      return true;
    } else {
      return false;
    }
  }

  togglePause(job: Job) {
    const jobIndex = this.scheduledJobs.findIndex((item) => {
      return item.jobId === job.id;
    });

    if (jobIndex !== -1) {
      this.removeJobInScheduler(job);
    } else {
      this.addJobInScheduler(job);
    }
  }

  getScheduledJobs() {
    return this.scheduledJobs;
  }

  getScheduledJob(jobId): { jobId: number, scheduler: schedule.Job | chokidar } {
    return this.scheduledJobs.find(function (scheduledJob) {
      return scheduledJob.jobId === jobId;
    });
  }

  getScheduledJobsFormattedTime(): Array<string> {
    const res = [];
    moment.locale(this.translate.currentLang);
    this.scheduledJobs.forEach((scheduledJob) => {
      if (scheduledJob.scheduler instanceof schedule.Job && scheduledJob.scheduler.nextInvocation() !== null) {
        res[scheduledJob.jobId] = (moment(scheduledJob.scheduler.nextInvocation().toISOString()).format('LLLL'));
      }
    });
    return res;
  }
}
