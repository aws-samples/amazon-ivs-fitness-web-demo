import anime from 'animejs';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import './Participant.css';
import { formatTime } from '../../../../../utils/helpers';
import { USER_KEY } from '../../../../../config';
import Avatar from '../../../../../components/Avatar';

const defaultAnimationParams = {
  duration: 300,
  easing: 'cubicBezier(.25,.1,.25,1)'
};

const Participant = ({
  avatar,
  currentRank,
  elapsedLapTimeMs,
  fastestLapTimeMs: newFastestLapTimeMs,
  flippedProps,
  isUser,
  name
}) => {
  const rankRef = useRef(null);
  const [prevFastestLapTimeMs, setPrevFastestLapTimeMs] =
    useState(newFastestLapTimeMs);
  const [prevRank, setPrevRank] = useState(currentRank);
  const [isAnimatingFirstPlace, setIsAnimatingFirstPlace] = useState(false);
  const [isAnimatingBestLap, setIsAnimatingBestLap] = useState(false);
  const isFirstRender = !prevFastestLapTimeMs && !newFastestLapTimeMs;

  // Times are converted to centiseconds prior to the new best lap time comparison
  const newFastestLapTimeCs = Math.floor(newFastestLapTimeMs / 10);
  const prevFastestLapTimeCs = Math.floor(prevFastestLapTimeMs / 10);
  const isNewBestLapTime =
    !prevFastestLapTimeCs || newFastestLapTimeCs < prevFastestLapTimeCs;
  const isFirstPosition = currentRank === 1;
  const animateBestLap = useCallback(
    (userParticipantEl) => {
      const participantInfoEl = userParticipantEl.childNodes[1];
      const profileInfoEl = participantInfoEl.childNodes[0];
      const participantAvatarEl = profileInfoEl.childNodes[0];
      const participantNameEl = profileInfoEl.childNodes[1];
      const bestLapTextEl = profileInfoEl.childNodes[2];
      const raceInfoEl = participantInfoEl.childNodes[1];
      const bestLapTimersEl = participantInfoEl.childNodes[2];
      const bestLapTimeEl = bestLapTimersEl.childNodes[0];
      const bestLapTimeDiffEl = bestLapTimersEl.childNodes[1];

      const timeline = anime
        .timeline({
          begin: () => {
            setIsAnimatingBestLap(true);
          },
          complete: () => {
            setPrevFastestLapTimeMs(newFastestLapTimeMs);
            setIsAnimatingBestLap(false);
          }
        })
        // Background transition black to white
        .add({
          ...defaultAnimationParams,
          backgroundPosition: '0% 0%',
          targets: participantInfoEl
        })

        // Hide timers
        .add(
          {
            ...defaultAnimationParams,
            opacity: [1, 0],
            complete: () => {
              raceInfoEl.style.display = 'none';
            },
            targets: raceInfoEl
          },
          '-=300'
        )

        // Avatar scaling up
        .add(
          {
            ...defaultAnimationParams,
            easing: 'cubicBezier(.42,0,.58,1)',
            scale: 1.2,
            targets: participantAvatarEl
          },
          '-=300'
        )

        // Avatar scale back down
        .add({
          ...defaultAnimationParams,
          duration: 50,
          scale: 1,
          targets: participantAvatarEl
        })

        // The 'New Best Lap Record!' text shows up
        .add(
          {
            ...defaultAnimationParams,
            begin: () => {
              participantNameEl.style.display = 'none';
              bestLapTextEl.style.display = 'block';
              bestLapTextEl.style.position = 'static';
            },
            duration: 500,
            targets: bestLapTextEl,
            translateX: ['-100%', 0]
          },
          '+=150'
        )
        .add(
          {
            ...defaultAnimationParams,
            duration: 650,
            opacity: [0, 1],
            targets: bestLapTextEl
          },
          '-=350'
        )

        // The new best lap time shows up
        .add(
          {
            ...defaultAnimationParams,
            begin: () => {
              bestLapTimersEl.style.display = 'block';
              bestLapTimeEl.style.display = 'block';
            },
            targets: bestLapTimersEl,
            opacity: [0, 1]
          },
          '+=100'
        );

      if (prevFastestLapTimeMs) {
        timeline
          // Push the best lap time up
          .add(
            {
              ...defaultAnimationParams,
              targets: bestLapTimeEl,
              translateY: [0, -7]
            },
            '+=300'
          )

          // The best lap time diff shows up
          .add(
            {
              ...defaultAnimationParams,
              begin: () => {
                bestLapTimeDiffEl.style.display = 'block';
              },
              targets: bestLapTimeDiffEl,
              opacity: [0, 1]
            },
            '+=100'
          )

          // Push best lap time diff down
          .add(
            {
              ...defaultAnimationParams,
              targets: bestLapTimeDiffEl,
              translateY: [-7, -3]
            },
            '-=300'
          );
      }

      timeline
        // Background transition white to black
        .add(
          {
            ...defaultAnimationParams,
            backgroundPosition: '-100% 100%',
            complete: () => {
              participantInfoEl.style.backgroundPosition = '100% 100%';
            },
            targets: participantInfoEl
          },
          '+=3000'
        )

        // Hide the best lap text and timers
        .add(
          {
            ...defaultAnimationParams,
            begin: () => {
              bestLapTextEl.style.display = 'none';
              bestLapTimersEl.style.display = 'none';
              bestLapTimeEl.style.display = 'none';
            },
            opacity: [1, 0],
            targets: [bestLapTextEl, bestLapTimersEl]
          },
          '-=250'
        )

        // Bring the user name and timers back
        .add(
          {
            ...defaultAnimationParams,
            begin: () => {
              participantNameEl.style.display = '';
              raceInfoEl.style.display = 'flex';
            },
            opacity: [0, 1],
            targets: [participantNameEl, raceInfoEl]
          },
          '-=300'
        );
    },
    [newFastestLapTimeMs, prevFastestLapTimeMs]
  );
  const animateFirstPlace = useCallback(
    (userParticipantEl) => {
      const participantRankEl = userParticipantEl.childNodes[0];
      const participantInfoEl = userParticipantEl.childNodes[1];
      const profileInfoEl = participantInfoEl.childNodes[0];
      const participantAvatarEl = profileInfoEl.childNodes[0];
      const crownEl = participantAvatarEl.childNodes?.[0];

      if (crownEl) {
        anime
          .timeline({
            begin: () => {
              setIsAnimatingFirstPlace(true);
            },
            complete: () => {
              setPrevRank(currentRank);
              setIsAnimatingFirstPlace(false);
            },
            easing: 'easeInOutSine'
          })

          // Pulse effect
          .add(
            {
              duration: 1000,
              boxShadow: [
                '0 0 0 2px #fff, 0 0 0 0px rgba(255, 255, 255, 1)',
                '0 0 0 2px #fff inset, 0 0 0 10px rgba(255, 220, 115, 0)'
              ],
              targets: participantInfoEl
            },
            0
          )

          // Color the rank
          .add(
            {
              color: '#ffdc73',
              duration: 400,
              targets: participantRankEl
            },
            100
          )

          // Spin in the crown
          .add(
            {
              duration: 1750,
              easing: 'easeOutElastic',
              scale: [0, 1],
              rotate: [-45, 0],
              targets: crownEl
            },
            250
          );
      }
    },
    [currentRank]
  );
  const animate = useCallback(
    (userParticipantEl) => {
      if (!userParticipantEl) return;

      if (isFirstPosition && prevRank !== 1 && !isAnimatingFirstPlace)
        animateFirstPlace(userParticipantEl);
      if (!isFirstRender && isNewBestLapTime && !isAnimatingBestLap)
        animateBestLap(userParticipantEl);
    },
    [
      animateBestLap,
      animateFirstPlace,
      isAnimatingBestLap,
      isAnimatingFirstPlace,
      isFirstPosition,
      isFirstRender,
      isNewBestLapTime,
      prevRank
    ]
  );

  useEffect(() => {
    if (!isFirstPosition) setPrevRank(currentRank);
  }, [currentRank, isFirstPosition]);

  useEffect(() => {
    // This is to ensure that we set the correct color in case the position changes while the new best lap animation is triggered(and rerenders the component)
    if (isUser && rankRef.current && !isAnimatingFirstPlace) {
      if (isFirstPosition) {
        rankRef.current.style.color = '#ffdc73';
      } else {
        rankRef.current.style.color = '#fff';
      }
    }
  }, [isAnimatingFirstPlace, isFirstPosition, isUser]);

  return (
    <div
      {...(isUser ? { ref: animate } : {})}
      {...flippedProps}
      className="participant"
    >
      <b className="rank" ref={rankRef}>
        {currentRank}
      </b>
      <div className={`participant-info ${isUser ? USER_KEY : ''}`}>
        <div className="profile-info">
          <Avatar
            size="md"
            name={name}
            avatar={avatar}
            crown={isFirstPosition}
          />
          <b className="participant-name">{name}</b>
          {isUser && <b className="best-lap-text">New Best Lap Record!</b>}
        </div>
        <div className="race-info">
          <div className="time-data best">
            <p className="time">({formatTime(newFastestLapTimeMs)})</p>
            <p>BEST</p>
          </div>
          <div className="time-data current">
            <p className="time">{formatTime(elapsedLapTimeMs)}</p>
            <p>CURRENT</p>
          </div>
        </div>
        {isUser && (
          <div className="best-lap-timers">
            <p className="best-lap-time">{formatTime(newFastestLapTimeMs)}</p>
            {prevFastestLapTimeMs && (
              <p className="best-lap-time-diff">
                {formatTime(newFastestLapTimeMs - prevFastestLapTimeMs)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

Participant.propTypes = {
  avatar: PropTypes.string.isRequired,
  currentRank: PropTypes.number,
  elapsedLapTimeMs: PropTypes.number.isRequired,
  fastestLapTimeMs: PropTypes.number,
  flippedProps: PropTypes.object.isRequired,
  isUser: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired
};

Participant.defaultProps = {
  currentRank: null,
  fastestLapTimeMs: null
};

export default Participant;
