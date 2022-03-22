import { useCallback, useEffect, useRef, useState } from 'react';
import { isAccelerationKeyEvent } from '../../utils/helpers';

const useTimeoutState = (initialState, isMobileView, onEventSuccess) => {
  const recurringTimeoutId = useRef(null);
  const [timeoutState, setTimeoutState] = useState(initialState);
  const handleEvent = useCallback(
    (event) => {
      if (isMobileView || isAccelerationKeyEvent(event)) {
        onEventSuccess();

        // Hide the bouncing arrow when the user starts running
        setTimeoutState(false);
        window.clearTimeout(recurringTimeoutId.current);

        recurringTimeoutId.current = setTimeout(() => {
          // Show the bouncing arrow if there is no event for at least 1 sec
          setTimeoutState(true);
        }, 1000);
      }
    },
    [isMobileView, onEventSuccess]
  );

  useEffect(() => {
    if (!isMobileView) {
      window.addEventListener('keydown', handleEvent);
    }

    return () => {
      clearTimeout(recurringTimeoutId.current);
      window.removeEventListener('keydown', handleEvent);
    };
  }, [handleEvent, isMobileView]);

  return [timeoutState, handleEvent];
};

export default useTimeoutState;
