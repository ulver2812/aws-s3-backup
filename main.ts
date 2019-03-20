import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  screen,
  Tray,
  Menu,
  nativeImage,
  ipcMain
} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as Splashscreen from '@trodi/electron-splashscreen';
import * as contextMenuInternal from 'electron-context-menu';

const {autoUpdater} = require('electron-updater');
const sugar = require('sugar');
const kill = require('tree-kill');

let win, serve, tray;
const awsCliProcesses = [];
const args = process.argv.slice(1);
let winIsHidden = false;
serve = args.some(val => val === '--serve');

function createWindow() {

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  // win = new BrowserWindow({
  //   x: 0,
  //   y: 0,
  //   width: 1080,
  //   height: 650
  // });

  const config: Splashscreen.Config = {
    windowOpts: {
      x: 0,
      y: 0,
      width: 1080,
      height: 650
    },
    templateUrl: path.join(__dirname, 'dist/assets/splash-screen.html'),
    splashScreenOpts: {
      width: 400,
      height: 460
    },
    minVisible: 2000
  };

  win = Splashscreen.initSplashScreen(config);

  win.setMenuBarVisibility(false);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  // win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('close', (event) => {
    win.hide();
    winIsHidden = true;
    event.preventDefault();
  });
}

function createTray() {
  const trayIcon = path.join(__dirname, 'icons/favicon.16x16.png');
  const nimage = nativeImage.createFromPath(trayIcon);
  tray = new Tray(nimage);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      click: () => {
        win = null;
        app.quit();
      }
    }
  ]);
  tray.setToolTip('AWS S3 backup');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    win.show();
    winIsHidden = false;
  });
}

function createContextMenuInternal() {
  contextMenuInternal.default({
    showInspectElement: false
  });
}

function checkForUpdate() {
  autoUpdater.checkForUpdatesAndNotify();
}

function initIpc() {
  ipcMain.on('add-process-to-kill', (event, processPid) => {
    awsCliProcesses.push(processPid);
  });

  ipcMain.on('remove-process-to-kill', (event, processPid) => {
    sugar.Array.remove(awsCliProcesses, processPid);
  });

  ipcMain.on('set-auto-start', (event, enableAutoStart) => {
        enableAutoStart = Boolean(enableAutoStart);
        setAutoStart(enableAutoStart);
  });
}

function setAutoStart(enableAutoStart) {
  app.setLoginItemSettings({
    openAtLogin: enableAutoStart,
    path: app.getPath('exe')
  });
}

function checkSingleInstance() {
  // TODO: da cambiare dopo l'aggiornamento a electron 4
  // to make singleton instance
  const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) {
        win.restore();
        win.focus();
      } else if (winIsHidden) {
        win.show();
      }
    }
  });

  if (isSecondInstance) {
    app.exit();
    return;
  }
}

try {

  checkSingleInstance();

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  app.on('ready', createTray);

  app.on('ready', createContextMenuInternal);

  app.on('ready', checkForUpdate);

  app.on('ready', initIpc);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  app.on('before-quit', function () {
    for (const process of awsCliProcesses) {
      kill(process);
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
