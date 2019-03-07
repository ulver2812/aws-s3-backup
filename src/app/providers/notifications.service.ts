import {Injectable} from '@angular/core';
import * as nodemailer from 'nodemailer';
import {SettingsService} from './settings.service';
import {LogService} from './log.service';
import {LogType} from '../enum/log.type.enum';
import {isUndefined} from 'util';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private settingsService: SettingsService, private log: LogService) {
  }

  getEmailTransporter() {
    const settings = this.settingsService.getSettings();
    // email channel
    // tslint:disable-next-line:prefer-const
    let options = {
      host: settings.emailHost,
      port: settings.emailPort,
      secure: settings.emailSecure // true for 465, false for other ports
    };

    if (!isUndefined(settings.emailUser) && !isUndefined(settings.emailPassword)) {
      options['auth'] = {
        user: settings.emailUser, // generated ethereal user
        pass: settings.emailPassword // generated ethereal password
      };
    }

    return nodemailer.createTransport(options);
  }

  // subject = await this.translate.get('NOTIFICATIONS.SUBJECT-START').toPromise();
  sendNotification(subject: string, message: string, channel: string, logAttachment: boolean = false) {
    const settings = this.settingsService.getSettings();
    if (settings.allowNotifications === false) {
      return;
    }

    if (channel === 'email') {
      const transporter = this.getEmailTransporter();
      transporter.sendMail(this.getMailOptions(subject, message, logAttachment), (err: Error, res: Response) => {
        this.log.printLog(LogType.ERROR, 'Email - ' + err.message);
      });
    }
  }

  getMailOptions(subject: string, message: string, logAttachment: boolean = false) {
    const settings = this.settingsService.getSettings();

    const options = {
      from: settings.emailSender, // sender address
      to: settings.emailReceivers, // list of receivers
      subject: subject, // Subject line
      html: message, // html body
    };

    if (logAttachment) {
      options['attachments'] = [
        {
          filename: 'log-activities.txt',
          path: this.log.getLogsFile() // stream this file
        }
      ];
    }

    return options;
  }
}
