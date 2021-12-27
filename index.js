const { menubar } = require("menubar");
const { app, Tray, ipcMain } = require("electron");

// Global state
let intervalRef;
let previousDelta;
let previousPosition;

// Helper func
const pad = (number) => (number < 10 ? `0${number}` : number);
const calculateTimeFraction = (timeLeft, maxTime) => {
  const rawTimeFraction = timeLeft / maxTime;
  return rawTimeFraction - (1 / maxTime) * (1 - rawTimeFraction);
};
const setCircleDashArray = (timeLeft, maxTime) => {
  const FULL_DASH_ARRAY = 283;
  const circleDasharray = `${(
    calculateTimeFraction(timeLeft, maxTime) * FULL_DASH_ARRAY
  ).toFixed(0)} ${FULL_DASH_ARRAY}`;
  return circleDasharray;
};

// Main timer logic
const startTimer = (tray, mb) => {
  //   const SIT = 1200;
  //   const STAND = 480;
  //   const WALK = 120;

  const SIT = 10;
  const STAND = 480;
  const WALK = 120;
  const intervals = [SIT, STAND, WALK];
  const phases = ["sit", "stand", "walk"];

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
    console.log("Current time formatted: ", currentTimeFormatted);

    const newDashArraySize = setCircleDashArray(time, intervals[position]);

    if (time < 1) {
      position + 1 < intervals.length ? position++ : (position = 0);
      time = intervals[position];
      previousDelta = null;
      start = Date.now();
    }

    tray.setTitle(currentTimeFormatted);
    if (mb && mb.window && mb.window.webContents) {
      mb.window.webContents.send("timer-updated", {
        time: currentTimeFormatted,
        phase: phases[position],
        circleDashArray: newDashArraySize,
      });
    }
  }, 1000);
};

app.whenReady().then(() => {
  const tray = new Tray(process.cwd() + "/clock-20px.png");

  const mb = menubar({
    tooltip: "20 minutes",
    icon: "clock-20px.png",
    tray,
    browserWindow: {
      webPreferences: { nodeIntegration: true, contextIsolation: false },
      alwaysOnTop: true,
    },
  });

  mb.setOption("webPreferences.nodeIntegration", true);

  mb.on("ready", () => {});

  intervalRef = startTimer(tray, mb);

  ipcMain.on("TOGGLE_TIMER", (_, data) => {
    if (data === "paused") {
      clearInterval(intervalRef);
    } else {
      intervalRef = startTimer(tray, mb);
    }
  });
});
