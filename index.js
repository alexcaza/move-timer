const { menubar } = require("menubar");
const { app, Tray } = require("electron");

const SIT = 1200;
const STAND = 480;
const WALK = 120;

app.whenReady().then(() => {
  const tray = new Tray(process.cwd() + "/clock-20px.png");

  const mb = menubar({
    tooltip: "20 minutes",
    icon: "clock-20px.png",
    tray,
  });

  mb.on("ready", () => {
    const start = Date.now();
    const intervals = [SIT, STAND, WALK];
    let position = 0;
    let currentDelta = intervals[position];

    setInterval(function () {
      const delta = Date.now() - start; // milliseconds elapsed since start
      // total seconds
      const timeNow = Math.floor(delta / 1000); // in seconds
      // minutes (currentDelta / 60)
      currentDelta = intervals[position] - timeNow;
      tray.setTitle(
        // TODO: Add seconds to this when brain working
        `${Math.floor(currentDelta / 60)}`
      );
      // alternatively just show wall clock time:
      // output(new Date().toUTCString());
    }, 1000);
  });
});
