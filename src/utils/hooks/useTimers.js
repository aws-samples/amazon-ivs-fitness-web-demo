import { useCallback, useEffect, useRef, useState } from 'react';

import useFirstMountState from './useFirstMountState';
import { getPageVisibilityProps } from '../helpers';

const UPDATE_DELAY = 10; // ms

const useTimers = (initIDs = []) => {
  /**
   * @type {[Map<String, { startTime: number, elapsedTimeMs: number }>, Function]}
   */
  const [timers, setTimers] = useState(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const prevTime = useRef(Date.now());
  const timeoutID = useRef();
  const isFirstMount = useFirstMountState();

  const updateTimers = useCallback(() => {
    setTimers((prevTimers) => {
      if (prevTimers.size) {
        const now = Date.now();
        const nextTimers = new Map();

        for (let [timerID, { startTime }] of prevTimers.entries()) {
          const elapsedTimeMs = now - startTime;
          nextTimers.set(timerID, { startTime, elapsedTimeMs });
        }

        prevTime.current = now;
        return nextTimers;
      }

      return prevTimers;
    });
  }, []);

  /**
   * Runs one or more timers using the provided time as the startTime
   * or the current time if no startTime is specified.
   *
   * @example Resetting timers with specified IDs
   * // Resets and runs one timer with ID 'my-timer'
   * const timerID = 'my-timer'
   * runTimers(timerID)
   *
   * @example Resuming timers with specified IDs
   * // Resumes two timers with IDs ['my-first-timer', 'my-second-timer'], if they exist
   * const timerIDs = ['my-first-timer', 'my-second-timer']
   * runTimers(timerIDs, false)
   *
   * @example Resetting or Resuming all existing timers
   * // Resets and runs all existing timers
   * runTimers()
   *
   * // Resumes all existing timers if they are currently not running
   * runTimers(null, false)
   */
  const runTimers = useCallback(
    /**
     * @param {number | string | (number | string)[]} [timerIDs]
     * @param {boolean} [reset=true]
     */
    (timerIDs, reset = true) => {
      setTimers((prevTimers) => {
        const now = Date.now();
        let targetIDs = [];

        if (timerIDs) {
          if (Array.isArray(timerIDs)) {
            targetIDs = [...new Set(timerIDs)]; // remove any duplicate IDs
          } else {
            targetIDs = [timerIDs];
          }
        } else {
          targetIDs = [...prevTimers.keys()]; // re-run all existing timers with new start times
        }

        if (targetIDs.length) {
          return targetIDs.reduce((nextTimers, id) => {
            let startTime = now;
            let elapsedTimeMs = 0;

            if (!reset) {
              if (!prevTimers.has(id)) {
                // Cannot resume a timer that does not exist, so skip this target ID
                return nextTimers;
              }

              const prevElapsedTimeMs = prevTimers.get(id).elapsedTimeMs;
              startTime = now - prevElapsedTimeMs;
              elapsedTimeMs = prevElapsedTimeMs;
            }

            return nextTimers.set(id, { startTime, elapsedTimeMs });
          }, new Map(prevTimers));
        }

        return prevTimers;
      });

      setTimeout(() => setIsRunning(true));
    },
    []
  );

  /**
   * Pauses all timers if the document is hidden.
   *  - i.e. the user switches tabs, minimizes the window, or performs any action that hides the document from view
   * Resumes all timers when the document becomes visible again.
   */
  useEffect(() => {
    if (!timers.size) return;

    const { hidden, visibilityState, visibilityChangeEventType } =
      getPageVisibilityProps();

    const handleTabVisibilityChange = () => {
      const isHidden =
        document[hidden] || document[visibilityState] === 'hidden';

      if (isHidden) {
        clearTimeout(timeoutID.current);
        setIsRunning(false);
      } else {
        runTimers(null, false);
      }
    };

    window.addEventListener(
      visibilityChangeEventType,
      handleTabVisibilityChange
    );

    return () =>
      window.removeEventListener(
        visibilityChangeEventType,
        handleTabVisibilityChange
      );
  }, [runTimers, timers.size]);

  // Initialization using the optional initIDs
  useEffect(() => {
    if (isFirstMount) runTimers(initIDs);
  }, [isFirstMount, runTimers, initIDs]);

  // Timer updates
  useEffect(() => {
    if (isRunning) {
      (function timer() {
        updateTimers();
        timeoutID.current = setTimeout(timer, UPDATE_DELAY);
      })();
    }

    return () => clearTimeout(timeoutID.current);
  }, [isRunning, updateTimers]);

  const getElapsedMs = useCallback(
    (timerID) => timers.get(timerID)?.elapsedTimeMs || 0,
    [timers]
  );

  return [runTimers, getElapsedMs];
};

export default useTimers;
