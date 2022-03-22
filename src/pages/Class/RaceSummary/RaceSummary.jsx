import React, { forwardRef } from 'react';

import './RaceSummary.css';
import Leaderboard from './Leaderboard';
import Racetrack from './Racetrack';
import useParticipants from '../../../contexts/Participants/useParticipants';

const RaceSummary = forwardRef((_, ref) => {
  const { participants } = useParticipants();

  return (
    <section className="race-summary">
      <Racetrack ref={ref} />
      <Leaderboard participants={participants} />
    </section>
  );
});

export default RaceSummary;
