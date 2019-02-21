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

  private transporter;

  constructor(private settings: SettingsService, private log: LogService) {
    this.registerNotificationChannels();
  }

  registerNotificationChannels() {
    // email channel
    // tslint:disable-next-line:prefer-const
    let options = {
      host: this.settings.getSetting('emailHost'),
      port: this.settings.getSetting('emailPort'),
      secure: this.settings.getSetting('emailSecure') // true for 465, false for other ports
    };

    if (!isUndefined(this.settings.getSetting('emailUser')) && !isUndefined(this.settings.getSetting('emailPassword'))) {
      options['auth'] = {
        user: this.settings.getSetting('emailUser'), // generated ethereal user
        pass: this.settings.getSetting('emailPassword') // generated ethereal password
      };
    }

    this.transporter = nodemailer.createTransport(options);
  }

  // subject = await this.translate.get('NOTIFICATIONS.SUBJECT-START').toPromise();
  sendNotification(subject: string, message: string, channel: string) {

    if (this.settings.getSetting('allowNotifications') === false) {
      return;
    }

    if (channel === 'email') {
      this.transporter.sendMail(this.getMailOptions(subject, message), (err: Error, res: Response) => {
        this.log.printLog(LogType.ERROR, 'Email - ' + err.message);
      });
    }
  }

  getMailOptions(subject: string, message: string) {
    return {
      from: this.settings.getSetting('emailSender'), // sender address
      to: this.settings.getSetting('emailReceivers'), // list of receivers
      subject: subject, // Subject line
      html: message // html body
    };
  }
}
