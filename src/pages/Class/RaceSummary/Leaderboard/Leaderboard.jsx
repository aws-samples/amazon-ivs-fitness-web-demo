import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Flipper, Flipped } from 'react-flip-toolkit';

import './Leaderboard.css';
import { NEW_TIME_EVERY_LAP, USER_KEY } from '../../../../config';
import { sortByRank } from '../../../../utils/helpers';
import Participant from './Participant';
import usePreviousDistinct from '../../../../utils/hooks/usePreviousDistinct';
import useTimers from '../../../../utils/hooks/useTimers';
import useViewportObserver from '../../../../utils/hooks/useViewportObserver';
import useMobileBreakpoint from '../../../../contexts/MobileBreakpoint/useMobileBreakpoint';

const compareParticipantsByLapsCompleted = (
  prevParticipants,
  nextParticipants
) =>
  Object.keys(prevParticipants).reduce((participants, id) => {
    const prevParticipant = prevParticipants[id];
    const nextParticipant = nextParticipants[id];
    const { lapsCompleted: prevLapsCompleted } = prevParticipant;
    const { lapsCompleted: nextLapsCompleted } = nextParticipant;

    if (nextLapsCompleted > prevLapsCompleted) {
      participants[id] = nextParticipant;
    }

    return participants;
  }, {});

const Leaderboard = ({ participants: nextParticipants }) => {
  const [runTimers, getElapsedMs] = useTimers(Object.keys(nextParticipants));
  const [fastestLapTimes, setFastestLapTimes] = useState({});
  const {
    isMobileView,
    isLandscape,
    isPageScrollable,
    updateIsPageScrollable
  } = useMobileBreakpoint();
  const [participantEntries, observe] = useViewportObserver(null, {
    threshold: 0.5,
    freezeOnEntry: true
  });

  const newLapParticipants = usePreviousDistinct(
    nextParticipants,
    compareParticipantsByLapsCompleted
  );

  useEffect(() => {
    if (newLapParticipants) {
      Object.entries(newLapParticipants).forEach(
        ([id, { currentLapStartTime }]) => {
          if (NEW_TIME_EVERY_LAP || id === USER_KEY) {
            /**
             * Times are converted to centiseconds prior to the lap time comparison.
             *
             * Fastest lap time is updated only if the new lap time is faster by
             * 10ms (1cs) or more than the current fastest lap time.
             */
            const elapsedLapTimeMs = getElapsedMs(id);
            const currentFastestLapTimeMs = fastestLapTimes[id];
            const elapsedLapTimeCs = Math.floor(elapsedLapTimeMs / 10);
            const currentFastestLapTimeCs = Math.floor(
              currentFastestLapTimeMs / 10
            );

            if (
              !currentFastestLapTimeCs ||
              elapsedLapTimeCs < currentFastestLapTimeCs
            ) {
              setFastestLapTimes((prevFastestLapTimes) => ({
                ...prevFastestLapTimes,
                [id]: elapsedLapTimeMs
              }));
            }
          }

          runTimers(id); // reset the current timer
        }
      );
    }
  }, [newLapParticipants, runTimers]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const visibleParticipantsCount = participantEntries.filter(
      ({ isIntersecting }) => isIntersecting
    ).length;

    // Make page scrollable if there are less than 4 participants visible in the leaderboard
    updateIsPageScrollable(visibleParticipantsCount < 4);
  }, [isMobileView, isLandscape, participantEntries, updateIsPageScrollable]);

  const observeParticipants = useCallback(
    (leaderboard) => {
      if (leaderboard?.el) {
        observe([...(leaderboard.el.children || [])]);
      }
    },
    [observe]
  );

  const sortedParticipants = useMemo(
    () => sortByRank(nextParticipants),
    [nextParticipants]
  );

  const flipKey = useMemo(
    () => sortedParticipants.reduce((key, [id]) => key + id, ''),
    [sortedParticipants]
  );

  return (
    <Flipper
      flipKey={flipKey}
      spring="stiff"
      element="section"
      className={`leaderboard ${
        isMobileView && !isPageScrollable ? 'with-tutorial' : ''
      }`}
      ref={observeParticipants}
    >
      {sortedParticipants.map(([id, { avatar, currentRank, name }], idx) => {
        const elapsedLapTimeMs = getElapsedMs(id);
        const fastestLapTimeMs = fastestLapTimes[id];

        return (
          <Flipped key={id} flipId={id}>
            {(flippedProps) => (
              <Participant
                avatar={avatar}
                currentRank={currentRank}
                elapsedLapTimeMs={elapsedLapTimeMs}
                fastestLapTimeMs={fastestLapTimeMs}
                flippedProps={flippedProps}
                isUser={id === USER_KEY}
                key={id}
                name={name}
              />
            )}
          </Flipped>
        );
      })}
    </Flipper>
  );
};

Leaderboard.propTypes = {
  participants: PropTypes.object.isRequired
};

export default React.memo(Leaderboard, (prevProps, nextProps) => {
  const { participants: prevParticipants } = prevProps;
  const { participants: nextParticipants } = nextProps;

  return Object.entries(prevParticipants).every(([id, prevParticipant]) => {
    const { currentRank: prevCurrentRank, lapsCompleted: prevLapsCompleted } =
      prevParticipant;
    const { currentRank: nextCurrentRank, lapsCompleted: nextLapsCompleted } =
      nextParticipants[id];

    return (
      prevCurrentRank === nextCurrentRank &&
      prevLapsCompleted === nextLapsCompleted
    );
  });
});
