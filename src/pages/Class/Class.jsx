import { Navigate } from 'react-router-dom';
import React, { useEffect, useRef } from 'react';

import Grid from '../../components/Grid';
import Player from './Player';
import RaceSummary from './RaceSummary';
import useMobileBreakpoint from '../../contexts/MobileBreakpoint/useMobileBreakpoint';
import useUser from '../../contexts/User/useUser';
import useUserSpeed from '../../utils/hooks/useUserSpeed';
import useViewportObserver from '../../utils/hooks/useViewportObserver';

const Class = () => {
  const { user } = useUser();
  const {
    isMobileView,
    isLandscape,
    isPageScrollable,
    updateIsNotificationHidden
  } = useMobileBreakpoint();
  const { handleAccelerationEvent } = useUserSpeed();
  const playerRef = useRef();
  const racetrackRef = useRef();
  const [[targetEntry]] = useViewportObserver(
    [isLandscape ? racetrackRef.current : playerRef.current],
    { threshold: 0.9 }
  );

  useEffect(() => {
    if (targetEntry) {
      updateIsNotificationHidden(!targetEntry.isIntersecting);
    }
  }, [isMobileView, updateIsNotificationHidden, targetEntry]);

  return user.joined ? (
    <Grid
      reverse={isMobileView}
      scrollable={isPageScrollable || (isMobileView && isLandscape)}
    >
      <Grid.Col scrollable={!isMobileView}>
        <RaceSummary ref={racetrackRef} />
      </Grid.Col>
      <Grid.Col autoFit>
        <Player
          ref={playerRef}
          handleAccelerationEvent={handleAccelerationEvent}
        />
      </Grid.Col>
    </Grid>
  ) : (
    <Navigate replace to="/join" />
  );
};

export default Class;
