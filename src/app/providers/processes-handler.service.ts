import {Injectable} from '@angular/core';
import * as sugar from 'sugar';
import * as kill from 'tree-kill';
import {ElectronService} from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class ProcessesHandlerService {

  processes: any[];

  constructor(private electronService: ElectronService) {
    this.processes = [];
  }

  addJobProcess(id, process) {
    id = Number(id);
    this.processes.push({
      jobId: id,
      process: process
    });

    this.electronService.ipcRenderer.send('add-process-to-kill', process.pid);
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

  killJobProcess(jobId, pid) {
    if (this.processes.length > 0) {

      jobId = Number(jobId);
      pid = Number(pid);

      const elements = this.processes.filter(item => {
        return item.jobId === jobId && item.process.pid === pid;
      });

      for (const element of elements) {
        this.electronService.ipcRenderer.send('remove-process-to-kill', element.process.pid);
        kill(element.process.pid);
      }

      sugar.Array.remove(this.processes, (item) => {
        return item['jobId'] === jobId && item['process']['pid'] === pid;
      });

    }
  }

  killJobProcesses(jobId) {

    if (this.processes.length > 0) {
      jobId = Number(jobId);

      const elements = this.processes.filter(item => {
        return item.jobId === jobId;
      });

      for (const element of elements) {
        this.electronService.ipcRenderer.send('remove-process-to-kill', element.process.pid);
        kill(element.process.pid);
      }

      sugar.Array.remove(this.processes, (item) => {
        return item['jobId'] === jobId;
      });
    }

  }

  killAllJobsProcesses() {
    for (const element of this.processes) {
      this.electronService.ipcRenderer.send('remove-process-to-kill', element.process.pid);
      element.process.kill();
    }
  }

  getAllJobsProcesses() {
    return this.processes;
  }
}
