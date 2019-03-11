import {JobStatus} from '../enum/job.status.enum';
import {JobType} from '../enum/job.type.enum';

export interface IJob {
  id: number;
  name: string;
  description: string;
  syncDeletedFiles: boolean;
  startDate: number;
  endDate: number;
  period: {month: number[], dayOfMonth: number[], day: number[], time: string};
  type: JobType;
  status: JobStatus;
  files: {path: string, type: string}[];
  bucket: string;
  alert: boolean;
  isRunning: boolean;
  maxExecutionTime: number;

  getStartDateFormatted(): string;

  setStartDate(formattedDate);

  getEndDateFormatted(): string;

  setEndDate(formattedDate);

  getMaxExecutionTimeFormatted(): number;

  getMaxExecutionTimeFormattedHours(): string;

  setMaxExecutionTime(formattedMaxExecutionTime);
}
