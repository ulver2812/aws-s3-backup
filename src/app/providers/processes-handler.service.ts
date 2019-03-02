import {Injectable} from '@angular/core';
import * as sugar from 'sugar';
import * as kill from 'tree-kill';

@Injectable({
  providedIn: 'root'
})
export class ProcessesHandlerService {

  processes: any[];

  constructor() {
    this.processes = [];
  }

  addJobProcess(id, process) {
    id = Number(id);
    this.processes.push({
      jobId: id,
      process: process
    });
  }

  getJobProcesses(jobId) {
    if (this.processes.length > 0) {
      jobId = Number(jobId);
      return this.processes.filter(item => {
        return item.jobId === jobId;
      });
    } else {
      return null;
    }
  }

  killJobProcesses(jobId) {

    if (this.processes.length > 0) {
      jobId = Number(jobId);

      const elements = this.processes.filter(item => {
        return item.jobId === jobId;
      });

      for (const element of elements) {
        kill(element.process.pid);
      }

      sugar.Array.remove(this.processes, (item) => {
        return item['jobId'] === jobId;
      });
    }

  }

  killAllJobsProcesses() {
    for (const element of this.processes) {
      element.process.kill();
    }
  }

  getAllJobsProcesses() {
    return this.processes;
  }
}
