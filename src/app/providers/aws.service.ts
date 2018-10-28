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

@Injectable({
  providedIn: 'root'
})
export class AwsService {

  client: any;

  constructor(
    private settings: SettingsService,
    private logService: LogService,
    private electron: ElectronService,
    private jobService: JobsService) {

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

  checkCredentials() {
    this.configureAwsCli();
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
    });
  }

  configureAwsCli() {
    const settings = this.settings.getSettings();
    child.spawn('aws', ['configure', 'set', 'aws_access_key_id', settings.awsAccessKeyID], {shell: true});
    child.spawn('aws', ['configure', 'set', 'aws_secret_access_key', settings.awsSecretAccessKey], {shell: true});
    child.spawn('aws', ['configure', 'set', 'default.region', settings.awsRegion], {shell: true});
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
    }
    let bucket = 's3://' + job.bucket;
    let s3Args = ['s3', 'sync'];
    for (const file of job.files) {

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

      const proc = child.spawn('aws', s3Args, {shell: true});

      proc.stderr.on('data', err => {
        job.setIsRunning(false);
        job.setAlert(true);
        this.jobService.save(job);
        this.logService.printLog(LogType.ERROR, 'Can\'t run job ' + job.name + ' because of: \r\n' + err);
      });

      proc.stdout.on('data', data => {
        if (job.type !== JobType.Live) {
          this.logService.printLog(LogType.INFO, data);
        }
      });

      proc.on('error', err => {
        job.setIsRunning(false);
        job.setAlert(true);
        this.jobService.save(job);
        this.logService.printLog(LogType.ERROR, 'Can\'t run job ' + job.name + ' because of: \r\n' + err);
      });

      proc.on('close', (code) => {
        if (code === 0 && job.type !== JobType.Live) {
          this.logService.printLog(LogType.INFO, 'End job: ' + job.name);
        }
        job.setIsRunning(false);
        if (job.type !== JobType.Live) {
          this.jobService.checkExpiredJob(job);
        }
      });
    }
  }

  configureAwsSdk() {
    // non serve se è installata e configurata l'AWS CLI
    const credentials = this.settings.getSettings();
    const config = new AWS.Config({
      accessKeyId: credentials.awsAccessKeyID, secretAccessKey: credentials.awsSecretAccessKey, region: credentials.awsRegion
    });
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
