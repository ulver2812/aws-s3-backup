import {Injectable} from '@angular/core';
import {SettingsService} from './settings.service';
import * as child from 'child_process';
import * as path from 'path';
import {LogService} from './log.service';
import {LogType} from '../enum/log.type.enum';
import * as AWS from 'aws-sdk';
import {ElectronService} from 'ngx-electron';
import * as fse from 'fs-extra';
import * as sugar from 'sugar';
import * as moment from 'moment';
import {Job} from '../models/job.model';
import {JobsService} from './jobs.service';
import {JobType} from '../enum/job.type.enum';
import {NotificationsService} from './notifications.service';
import {isNull, isUndefined} from 'util';
import {ProcessesHandlerService} from './processes-handler.service';

@Injectable({
  providedIn: 'root'
})
export class AwsService {

  client: any;

  constructor(
    private settings: SettingsService,
    private logService: LogService,
    private electron: ElectronService,
    private jobService: JobsService,
    private notification: NotificationsService,
    private processedHandler: ProcessesHandlerService) {

  }

  checkCli() {
    return new Promise<boolean>(resolve => {
      const proc = child.spawn('aws', ['configure', 'list'], {shell: true});

      proc.stderr.on('data', err => {
        resolve(false);
      });

      proc.stdout.on('data', data => {
        resolve(true);
      });

      proc.on('error', (err) => {
        resolve(false);
      });
    });
  }

  async checkCredentials() {
    const settings = this.settings.getSettings();

    if (isUndefined(settings.awsAccessKeyID) || isUndefined(settings.awsSecretAccessKey) || isUndefined(settings.awsRegion)) {
      return new Promise<boolean>(resolve => {
        resolve(false);
      });
    }

    await this.configureAwsCli();

    return new Promise<boolean>(resolve => {

      const proc = child.spawn('aws', ['s3', 'ls'], {shell: true});

      proc.stderr.on('data', err => {
        resolve(false);
      });

      proc.stdout.on('data', data => {
        resolve(true);
      });

      proc.on('error', (err) => {
        resolve(false);
      });

      // TODO: quando non ci sono bucket s3 associati all'account il loader non scompare perchè la aws cli non restituisce nulla
    });
  }

  async configureAwsCli() {
    const settings = this.settings.getSettings();
    await child.spawn('aws', ['configure', 'set', 'aws_access_key_id', settings.awsAccessKeyID], {shell: true});
    await child.spawn('aws', ['configure', 'set', 'aws_secret_access_key', settings.awsSecretAccessKey], {shell: true});
    await child.spawn('aws', ['configure', 'set', 'default.region', settings.awsRegion], {shell: true});
    await child.spawn('aws', ['configure', 'set', 'default.s3.max_concurrent_requests', settings.s3MaxConcurrentRequests], {shell: true});
    await child.spawn('aws', ['configure', 'set', 'default.s3.max_bandwidth', settings.s3MaxBandwidth + 'KB/s'], {shell: true});
  }

  s3Sync(job: Job) {

    if (job.isRunning && job.type !== JobType.Live) {
      const msg = 'Couldn\'t run job "' + job.name + '" because it was already run. Probably the job is too big for the time slot.';
      this.logService.printLog(LogType.WARNING, msg);
      return;
    }

    job.setIsRunning(true);
    if (job.type !== JobType.Live) {
      this.logService.printLog(LogType.INFO, 'Start job: ' + job.name);
      this.notification.sendNotification('Start job: ' + job.name, 'The job ' + job.name +
        ' has just begun you will receive another email notification on job end. <br/> - AWS S3 Backup', 'email');
    }

    const commands = [];
    for (const file of job.files) {

      let s3Args = [];
      let bucket = 's3://' + job.bucket;

      if (file.type === 'file') {
        const filePath = path.dirname(file.path);
        const dirPath = new URL(`file:///${filePath}`);
        bucket += dirPath.pathname;
        const fileInclude = '--include="' + path.basename(file.path) + '"';
        s3Args = ['s3', 'sync', path.dirname(file.path), bucket, '--exclude="*"', fileInclude];
      } else {
        const filePath = file.path;
        const dirPath = new URL(`file:///${filePath}`);
        bucket += dirPath.pathname;
        s3Args = ['s3', 'sync', file.path, bucket];
      }

      if (job.syncDeletedFiles) {
        s3Args.push('--delete');
      }

      s3Args.push('--no-progress');
      s3Args.push('--no-follow-symlinks');

      commands.push(s3Args);
    }

    const runCommands = (commandsToRun, callback) => {

      let index = 0;
      const results = [];

      const next = () => {

        if (index < commandsToRun.length) {

          const proc = child.spawn('aws', commandsToRun[index++], {shell: true});
          this.processedHandler.addJobProcess(job.id, proc);

          proc.on('close', (code) => {
            this.processedHandler.killJobProcess(job.id, proc.pid);
            if (code === 0 || code === 2) {
              next();
            } else {
              return callback(null, null);
            }
          });

          proc.on('error', err => {
            job.setAlert(true);
            this.jobService.save(job);
            this.logService.printLog(LogType.ERROR, 'Can\'t run job ' + job.name + ' because of: \r\n' + err);
            if (err) {
              return callback(err);
            }
          });

          proc.stdout.on('data', data => {
            // if (job.type !== JobType.Live) {
            // this.logService.printLog(LogType.INFO, data);
            // }
            // results.push(data.toString());
          });

          proc.stderr.on('data', err => {
            job.setAlert(true);
            this.jobService.save(job);
            this.logService.printLog(LogType.ERROR, 'Error with job ' + job.name + ' because of: \r\n' + err);
          });

        } else {
          // all done here
          callback(null, results);
        }

      };
      // start the first iteration
      next();
    };

    let timeout = null;
    if ( job.maxExecutionTime > 0 ) {
      timeout = setTimeout(() => {
        this.logService.printLog(LogType.INFO, 'The job ' + job.name + ' has just stopped because hit the maximum execution time. \r\n');
        this.processedHandler.killJobProcesses(job.id);
      }, job.maxExecutionTime);
    }

    runCommands(commands, (err, results) => {

      if ( !isNull(timeout) ) {
        clearTimeout(timeout);
      }

      job.setIsRunning(false);
      this.jobService.save(job);

      if (job.type !== JobType.Live) {
        this.logService.printLog(LogType.INFO, 'End job: ' + job.name);

        if (job.alert) {
          this.notification.sendNotification('Problem with job: ' + job.name, 'The job ' + job.name +
            ' generated an alert, for further details see the log in attachment.<br/> - AWS S3 Backup', 'email', true);
        }

        this.notification.sendNotification('End job: ' + job.name, 'The job ' + job.name +
          ' has just ended. <br/> - AWS S3 Backup', 'email');
        this.jobService.checkExpiredJob(job);
      }

      this.processedHandler.killJobProcesses(job.id);

    });

  }

  configureAwsSdk() {
    // non serve se è installata e configurata l'AWS CLI
    const credentials = this.settings.getSettings();
    const config = new AWS.Config({
      accessKeyId: credentials.awsAccessKeyID, secretAccessKey: credentials.awsSecretAccessKey, region: credentials.awsRegion
    });
  }

  async getBucketSizeBytesLastDays(bucket, storageType, days) {
    const credentials = this.settings.getSettings();
    const cloudwatch = new AWS.CloudWatch({region: credentials.awsRegion});

    const today = new Date();
    const daysBack = new Date();
    daysBack.setDate(daysBack.getDate() - days);

    const params = {
      EndTime: today, /* required */
      MetricName: 'BucketSizeBytes', /* required */
      Namespace: 'AWS/S3', /* required */
      Period: 86400, /* required */
      StartTime: daysBack, /* required */
      Dimensions: [
        {
          Name: 'BucketName', /* required */
          Value: bucket /* required */
        },
        {
          Name: 'StorageType',
          Value: storageType
        }
        /* more items */
      ],
      Statistics: [
        'Average'
      ],
      Unit: 'Bytes'
    };
    try {
      const data = await cloudwatch.getMetricStatistics(params).promise();
      if (!isUndefined(data.Datapoints)) {
        const datapoints = data.Datapoints;
        sugar.Array.sortBy(datapoints, (datapoint: any) => {
          return datapoint.Timestamp;
        });
        return datapoints;
      }
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async getBucketNumberOfObjectsLastDays(bucket, storageType, days) {
    const credentials = this.settings.getSettings();
    const cloudwatch = new AWS.CloudWatch({region: credentials.awsRegion});

    const today = new Date();
    const daysBack = new Date();
    daysBack.setDate(daysBack.getDate() - days);

    const params = {
      EndTime: today, /* required */
      MetricName: 'NumberOfObjects', /* required */
      Namespace: 'AWS/S3', /* required */
      Period: 86400, /* required */
      StartTime: daysBack, /* required */
      Dimensions: [
        {
          Name: 'BucketName', /* required */
          Value: bucket /* required */
        },
        {
          Name: 'StorageType',
          Value: 'AllStorageTypes'
        }
        /* more items */
      ],
      Statistics: [
        'Average'
      ],
      Unit: 'Count'
    };
    try {
      const data = await cloudwatch.getMetricStatistics(params).promise();
      if (!isUndefined(data.Datapoints)) {
        const datapoints = data.Datapoints;
        sugar.Array.sortBy(datapoints, (datapoint: any) => {
          return datapoint.Timestamp;
        });
        return datapoints;
      }
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async getBucketSizeBytes(bucket, storageType) {
    const credentials = this.settings.getSettings();
    const cloudwatch = new AWS.CloudWatch({region: credentials.awsRegion});
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const params = {
      EndTime: today, /* required */
      MetricName: 'BucketSizeBytes', /* required */
      Namespace: 'AWS/S3', /* required */
      Period: 86400, /* required */
      StartTime: yesterday, /* required */
      Dimensions: [
        {
          Name: 'BucketName', /* required */
          Value: bucket /* required */
        },
        {
          Name: 'StorageType',
          Value: storageType
        }
        /* more items */
      ],
      Statistics: [
        'Average'
      ],
      Unit: 'Bytes'
    };
    try {
      const data = await cloudwatch.getMetricStatistics(params).promise();
      if (!isUndefined(data.Datapoints[0].Average)) {
        return sugar.Number.bytes(data.Datapoints[0].Average, 2);
      }
    } catch (e) {
      console.log(e);
      return '0KB';
    }
  }

  async getBucketNumberOfObjects(bucket) {
    const credentials = this.settings.getSettings();
    const cloudwatch = new AWS.CloudWatch({region: credentials.awsRegion});
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const params = {
      EndTime: today, /* required */
      MetricName: 'NumberOfObjects', /* required */
      Namespace: 'AWS/S3', /* required */
      Period: 86400, /* required */
      StartTime: yesterday, /* required */
      Dimensions: [
        {
          Name: 'BucketName', /* required */
          Value: bucket /* required */
        },
        {
          Name: 'StorageType',
          Value: 'AllStorageTypes'
        }
        /* more items */
      ],
      Statistics: [
        'Average'
      ],
      Unit: 'Count'
    };
    try {
      const data = await cloudwatch.getMetricStatistics(params).promise();
      if (!isUndefined(data.Datapoints[0].Average)) {
        return sugar.Number.abbr(data.Datapoints[0].Average, 1);
      }
    } catch (e) {
      console.log(e);
      return '0';
    }
  }

  async listBuckets() {
    const S3 = new AWS.S3();
    try {
      const data = await S3.listBuckets().promise();
      return data.Buckets;
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  async listObjects(bucket: string, pathDirectory: string) {
    const S3 = new AWS.S3();
    const param = {
      Bucket: bucket,
      Delimiter: '/',
      Prefix: pathDirectory
    };

    try {
      const data = await S3.listObjectsV2(param).promise();

      data.CommonPrefixes.forEach(function (obj) {
        obj['Name'] = sugar.Array.exclude(obj.Prefix.split('/'), '').pop();
      });

      data.Contents.forEach(function (obj) {
        obj['Name'] = path.basename(obj.Key);
        obj['LastUpdate'] = moment(obj.LastModified).format('DD/MM/YYYY HH:mm');
        obj['SizeFormatted'] = sugar.Number.bytes(obj.Size);
      });

      return {
        directories: data.CommonPrefixes,
        files: data.Contents,
      };
    } catch (e) {
      console.log(e);
      return {};
    }
  }

  async downloadObject(bucket: string, key: string) {
    const S3 = new AWS.S3();
    const param = {
      Bucket: bucket,
      Key: key
    };
    try {
      const data = await S3.getObject(param).promise();
      this.electron.remote.dialog.showSaveDialog({defaultPath: path.basename(key)}, (filePath) => {
        if (filePath !== undefined) {
          fse.writeFileSync(filePath, data.Body);
        }
        this.electron.remote.getCurrentWindow().blurWebView();
      });

    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
