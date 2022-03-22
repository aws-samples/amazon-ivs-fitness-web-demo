import anime from 'animejs';
import React, {
  useRef,
  useMemo,
  useCallback,
  useEffect,
  forwardRef
} from 'react';

import { RacetrackPath } from '../../../../assets/svg';

import { USER_KEY } from '../../../../config';
import { sortByRank } from '../../../../utils/helpers';
import Avatar from '../../../../components/Avatar';
import useParticipants from '../../../../contexts/Participants/useParticipants';

import './Racetrack.css';

const Racetrack = forwardRef((_, ref) => {
  const racetrackRef = useRef();
  const { completeLap, participantCount, participants, updateRankings } =
    useParticipants();
  const trackerMap = useMemo(() => new Map(), []); // key: id, value: { lapDuration, animation }

  useEffect(() => {
    const intervalID = setInterval(() => {
      const currentLapProgressList = [];

      for (const [id, { animation }] of trackerMap.entries()) {
        const { progress } = animation;
        currentLapProgressList.push({ id, progress });
      }

      // currentLapProgressList is reversed so that the user starts the race at the bottom of the rankings
      updateRankings(currentLapProgressList.reverse());
    }, 250);

    return () => clearInterval(intervalID);
  }, [trackerMap, updateRankings]);

  const createAnimation = useCallback(
    ({ trackerEls, duration, id }) => {
      const path = anime.path(`#${racetrackRef.current.id} path:first-child`);
      let progress = trackerMap.get(id)?.animation?.progress || 0;
      progress = progress >= 99.999999999999999 ? 0 : progress;
      const timestamp = (progress / 100) * duration;

      // To update the lapDuration of a participant, we need to first delete the existing animation...
      anime.remove(trackerEls);

      // ...and then create a new one with the new lapDuration
      const animation = anime({
        targets: trackerEls,
        translateX: path('x'),
        translateY: path('y'),
        easing: 'linear',
        loop: true,
        duration,
        autoplay: false, // required for animation.seek to work
        loopComplete: () => completeLap(id)
      });

      // move tracker to the same position it was before the lapDuration update
      animation.seek(timestamp);
      animation.play();

      return animation;
    },
    [completeLap, trackerMap]
  );

  return (
    <section ref={ref} className="racetrack">
      <div className="racetrack-path">
        <RacetrackPath ref={racetrackRef} />
        {sortByRank(participants)
          .reverse()
          .map(([id, participant], idx) => {
            const {
              name,
              avatar,
              currentRank,
              lapDuration: newLapDuration
            } = participant;
            const participantType = id === USER_KEY ? USER_KEY : 'ai';

            const animate = (trackerEl) => {
              if (!trackerEl) return;

              const prevTime = trackerMap.get(id)?.lapDuration;

              if (prevTime !== newLapDuration) {
                const animation = createAnimation({
                  trackerEls: trackerEl.childNodes,
                  duration: newLapDuration,
                  id
                });

                trackerMap.set(id, { lapDuration: newLapDuration, animation });
              }
            };

            return (
              <div
                className={`participant-tracker-container ${participantType}`}
                key={id}
                ref={animate}
              >
                <Avatar
                  size="sm"
                  name={name}
                  avatar={avatar}
                  crown={currentRank === 1}
                  marker={participantType}
                />
                <div className={`participant-tracker ${participantType}`}></div>
              </div>
            );
          })}
      </div>
      <p className="participant-count">{participantCount} Participants</p>
    </section>
  );
});

export default Racetrack;
