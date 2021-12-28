const { menubar } = require("menubar");
const { app, Tray, ipcMain, BrowserWindow } = require("electron");
const { setCircleDashArray, pad } = require("./helpers");

// Global state
let intervalRef;
let previousDelta;
let previousPosition;

// Global constants
const SIT = 1200;
const STAND = 480;
const WALK = 120;
const intervals = [SIT, STAND, WALK];
const phases = ["sit", "stand", "walk"];

// Startup function
const onStart = (tray, mb) => {
  const time = intervals[0];
  const minutes = pad(Math.floor(time / 60));
  const seconds = pad(time % 60);
  currentTimeFormatted = `${minutes}:${seconds}`;
  tray.setTitle(" " + currentTimeFormatted);
  if (mb && mb.window && mb.window.webContents) {
    mb.window.webContents.send("timer-updated", {
      time: currentTimeFormatted,
      phase: phases[0],
      circleDashArray: 283,
    });
  }
};

// Window logic
const mainWindow = () => {
  const icon = "/clock-white@2x.png";
  const tray = new Tray(
    !app.isPackaged
      ? `${process.cwd()}${icon}`
      : `${process.resourcesPath}/app${icon}`
  );

  const mb = menubar({
    tooltip: "20 minutes",
    icon: "assets/clock-20px.png",
    tray,
    preloadWindow: true,
    browserWindow: {
      webPreferences: { nodeIntegration: true, contextIsolation: false },
    },
  });

  mb.setOption("webPreferences.nodeIntegration", true);

  onStart(tray, mb);

  ipcMain.on("TOGGLE_TIMER", (_, data) => {
    if (data === "paused") {
      clearInterval(intervalRef);
    } else {
      intervalRef = startTimer(tray, mb);
    }
  });
};

// Main timer logic
const startTimer = (tray, mb) => {
  let position = previousPosition || 0;
  let start = previousDelta ? Date.now() - previousDelta : Date.now();
  let time = intervals[position];

  return setInterval(() => {
    let currentTimeFormatted;
    const delta = Date.now() - start; // milliseconds elapsed since start
    const timeNow = Math.floor(delta / 1000); // in seconds

    previousPosition = position;
    previousDelta = delta;
    time = intervals[position] - timeNow;

    const minutes = pad(Math.floor(time / 60));
    const seconds = pad(time % 60);
    currentTimeFormatted = `${minutes}:${seconds}`;

    const newDashArraySize = setCircleDashArray(time, intervals[position]);

    tray.setTitle(" " + currentTimeFormatted);
    if (mb && mb.window && mb.window.webContents) {
      mb.window.webContents.send("timer-updated", {
        time: currentTimeFormatted,
        phase: phases[position],
        circleDashArray: newDashArraySize,
      });
    }

    if (time < 1) {
      position + 1 < intervals.length ? position++ : (position = 0);
      time = intervals[position];
      previousDelta = null;
      previousPosition = position;
      start = Date.now();
      clearInterval(intervalRef);
      tray.setTitle(phases[position].toUpperCase());
      setTimeout(() => {
        intervalRef = startTimer(tray, mb);
      }, 2000);
    }
  }, 1000);
};

app.whenReady().then(() => {
  mainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow();
    }
  });
});
