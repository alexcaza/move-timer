const { menubar } = require("menubar");
const { app, BrowserWindow, Tray, ipcMain } = require("electron");

let intervalRef;

const pad = (number) => (number < 10 ? `0${number}` : number);

const startTimer = (tray, mb) => {
  const SIT = 1200;
  const STAND = 480;
  const WALK = 120;
  const intervals = [SIT, STAND, WALK];
  const phases = ["sit", "stand", "walk"];

  let position = 0;
  let start = Date.now();
  let time = intervals[position];

  return setInterval(() => {
    let currentTimeFormatted;
    const delta = Date.now() - start; // milliseconds elapsed since start
    const timeNow = Math.floor(delta / 1000); // in seconds
    time = intervals[position] - timeNow;

    const minutes = pad(Math.floor(time / 60));
    const seconds = pad(time % 60);
    currentTimeFormatted = `${minutes}:${seconds}`;
    console.log("Current time formatted: ", currentTimeFormatted);

    if (time < 1) {
      position + 1 < intervals.length ? position++ : (position = 0);
      time = intervals[position];
      start = Date.now();
    }

    tray.setTitle(currentTimeFormatted);
    if (mb && mb.window && mb.window.webContents) {
      mb.window.webContents.send("timer-updated", {
        time: currentTimeFormatted,
        phase: phases[position],
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
    },
  });

  mb.setOption("webPreferences.nodeIntegration", true);

  mb.on("ready", () => {});

  intervalRef = startTimer(tray, mb);

  ipcMain.on("TOGGLE_TIMER", (_, data) => {
    if (data === "paused") {
      // TODO: Store previous time somewhere to start countdown back up correctly
      clearInterval(intervalRef);
    } else {
      intervalRef = startTimer(tray, mb);
    }
  });
});
