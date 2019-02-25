import {app, BrowserWindow, BrowserWindowConstructorOptions, screen, Tray, Menu, nativeImage} from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as Splashscreen from '@trodi/electron-splashscreen';
import * as contextMenuInternal from 'electron-context-menu';

let win, serve, tray;
const args = process.argv.slice(1);
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
    event.preventDefault();
  });
}

function createTray() {
  const trayIcon = path.join(__dirname, 'icons/favicon.png');
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
  });
}

function createContextMenuInternal() {
  contextMenuInternal.default({
    showInspectElement: false
  });
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  app.on('ready', createTray);

  app.on('ready', createContextMenuInternal);

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

} catch (e) {
  // Catch Error
  // throw e;
}
