// Helper funcs
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

module.exports = {
  setCircleDashArray,
  pad,
};
