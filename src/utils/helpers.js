import { ACCELERATION_KEY } from '../config';

export const formatTime = (timeInMs) => {
  if (timeInMs == null) return '--.--';

  const absTimeInMs = Math.abs(timeInMs);
  let seconds = Math.floor(absTimeInMs / 1000);
  let centiseconds = Math.floor((absTimeInMs % 1000) / 10);
  seconds = seconds.toString().padStart(2, '0');
  centiseconds = centiseconds.toString().padStart(2, '0');

  return `${timeInMs < 0 ? '-' : ''}${seconds}.${centiseconds}`;
};

export const sortByRank = (participants) =>
  Object.entries(participants).sort((p1, p2) => {
    const p1Rank = p1[1].currentRank;
    const p2Rank = p2[1].currentRank;

    if (p1Rank === null) return 1;
    if (p2Rank === null) return -1;

    return p1Rank - p2Rank;
  });

export const isAccelerationKeyEvent = (event = {}) =>
  (event.keyCode === ACCELERATION_KEY.keyCode ||
    event.key === ACCELERATION_KEY.key) &&
  !event.repeat;

export const getPageVisibilityProps = () => {
  let hidden, visibilityState, visibilityChangeEventType;

  if (typeof document.hidden !== 'undefined') {
    hidden = 'hidden';
    visibilityState = 'visibilityState';
    visibilityChangeEventType = 'visibilitychange';
  } else if (typeof document.mozHidden !== 'undefined') {
    hidden = 'mozHidden';
    visibilityState = 'mozVisibilityState';
    visibilityChangeEventType = 'mozvisibilitychange';
  } else if (typeof document.msHidden !== 'undefined') {
    hidden = 'msHidden';
    visibilityState = 'msVisibilityState';
    visibilityChangeEventType = 'msvisibilitychange';
  } else if (typeof document.webkitHidden !== 'undefined') {
    hidden = 'webkitHidden';
    visibilityState = 'webkitVisibilityState';
    visibilityChangeEventType = 'webkitvisibilitychange';
  }

  return { hidden, visibilityState, visibilityChangeEventType };
};
