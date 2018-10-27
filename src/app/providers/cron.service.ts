import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CronService {

  months = [
    {value: 1, name: 'DATE-TIME.MONTHS.JAN'},
    {value: 2, name: 'DATE-TIME.MONTHS.FEB'},
    {value: 3, name: 'DATE-TIME.MONTHS.MAR'},
    {value: 4, name: 'DATE-TIME.MONTHS.APR'},
    {value: 5, name: 'DATE-TIME.MONTHS.MAY'},
    {value: 6, name: 'DATE-TIME.MONTHS.JUN'},
    {value: 7, name: 'DATE-TIME.MONTHS.JUL'},
    {value: 8, name: 'DATE-TIME.MONTHS.AUG'},
    {value: 9, name: 'DATE-TIME.MONTHS.SEP'},
    {value: 10, name: 'DATE-TIME.MONTHS.OCT'},
    {value: 11, name: 'DATE-TIME.MONTHS.NOV'},
    {value: 12, name: 'DATE-TIME.MONTHS.DEC'},
  ];

  days = [
    {value: 1, name: 'DATE-TIME.DAYS.MON'},
    {value: 2, name: 'DATE-TIME.DAYS.TUE'},
    {value: 3, name: 'DATE-TIME.DAYS.WED'},
    {value: 4, name: 'DATE-TIME.DAYS.THU'},
    {value: 5, name: 'DATE-TIME.DAYS.FRI'},
    {value: 6, name: 'DATE-TIME.DAYS.SAT'},
    {value: 7, name: 'DATE-TIME.DAYS.SUN'},
  ];

  daysOfMonth = [];

  constructor() {
    for (let i = 1; i <= 31; i++) {
      this.daysOfMonth.push(i);
    }
  }

  getCronStringFromJobPeriod(jobPeriod: { month: number[], dayOfMonth: number[], day: number[], time: string }): string {
    const time = jobPeriod.time.split(':');

    const dayOfMonth = jobPeriod.dayOfMonth.length > 0 ? jobPeriod.dayOfMonth.join(',') : '*';
    const month = jobPeriod.month.length > 0 ? jobPeriod.month.join(',') : '*';
    const day = jobPeriod.day.length > 0 ? jobPeriod.day.join(',') : '*';
    return time[1] + ' ' + time[0] + ' ' + dayOfMonth + ' ' + month + ' ' + day;
  }
}
