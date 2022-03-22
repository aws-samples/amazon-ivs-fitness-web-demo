import { useCallback, useEffect, useRef } from 'react';

import { isAccelerationKeyEvent } from '../../utils/helpers';
import { TIME_BOUNDS, USER_STARTING_LAP_DURATION } from '../../config';
import useMobileBreakpoint from '../../contexts/MobileBreakpoint/useMobileBreakpoint';
import useParticipants from '../../contexts/Participants/useParticipants';

const REFRESH_RATE = 100; //ms
const BUFFER = 50; // ms
const ACCELERATION_FACTOR = 0.92;
const DECAY_FACTOR = 1.15;
const USER_MAX_SPEED = 15000; // ms

/**
 * Converting a key-press delta to a lap duration between 15s and 50s
 *
 * 1 tap every 1 sec is a 50 sec lap duration
 * 1 tap every 0.2 sec is a 15 sec lap duration
 *
 * 1000ms -------> 50,000ms
 *  key_Δ -------> lapDuration
 *
 * lapDuration = (key_Δ * 50000) / 1000
 *
 */

const useUserSpeed = () => {
  const prevTimestamp = useRef(null);
  const keyDeltas = useRef([]);
  const intervalId = useRef(null);
  const timeoutId = useRef(null);
  const currentUserLapDuration = useRef(USER_STARTING_LAP_DURATION);
  const targetLapDuration = useRef(USER_STARTING_LAP_DURATION);
  const { updateUserTime } = useParticipants();
  const isMobileView = useMobileBreakpoint();

  const handleAccelerationEvent = useCallback(
    (event) => {
      if (isMobileView || isAccelerationKeyEvent(event)) {
        clearTimeout(timeoutId.current);

        const now = Date.now();
        let newKeyDelta = now - prevTimestamp.current;
        if (!prevTimestamp.current) newKeyDelta = 1000;
        if (newKeyDelta < 300) newKeyDelta = 300;
        if (newKeyDelta > 1000) newKeyDelta = 1000;

        prevTimestamp.current = now;
        const prevKeyDelta = keyDeltas.current[keyDeltas.current.length - 1];
        const lowerBound = prevKeyDelta - BUFFER;
        const upperBound = prevKeyDelta + BUFFER;

        if (
          !keyDeltas.current.length ||
          lowerBound >= newKeyDelta ||
          newKeyDelta >= upperBound
        ) {
          keyDeltas.current.push(newKeyDelta);
          targetLapDuration.current =
            (newKeyDelta * USER_STARTING_LAP_DURATION) / 1000;
        }

        timeoutId.current = setTimeout(() => {
          targetLapDuration.current = USER_STARTING_LAP_DURATION;
        }, 1000);
      }

      return () => clearTimeout(timeoutId.current);
    },
    [isMobileView]
  );

  useEffect(() => {
    intervalId.current = setInterval(() => {
      if (currentUserLapDuration.current === targetLapDuration.current) return;

      let newLapDuration =
        currentUserLapDuration.current < targetLapDuration.current
          ? // DECAY
            Math.min(
              currentUserLapDuration.current * DECAY_FACTOR,
              TIME_BOUNDS.MAX,
              targetLapDuration.current
            )
          : // ACCELERATION
            Math.max(
              currentUserLapDuration.current * ACCELERATION_FACTOR,
              USER_MAX_SPEED,
              targetLapDuration.current
            );

      currentUserLapDuration.current = newLapDuration;
      updateUserTime(newLapDuration);
    }, REFRESH_RATE);

    window.addEventListener('keydown', handleAccelerationEvent);

    return () => {
      window.removeEventListener('keydown', handleAccelerationEvent);
      clearInterval(intervalId.current);
    };
  }, [handleAccelerationEvent, updateUserTime]);

  return { handleAccelerationEvent };
};

export default useUserSpeed;
