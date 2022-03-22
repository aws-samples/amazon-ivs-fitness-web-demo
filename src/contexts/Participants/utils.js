import * as aiParticipantAvatars from '../../assets/avatars/ai-avatars';

import { NUMBER_OF_AI_PARTICIPANTS, TIME_BOUNDS } from '../../config';

export const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const generateAiParticipants = (num = NUMBER_OF_AI_PARTICIPANTS) => {
  let participants = {};
  const avatars = Object.keys(aiParticipantAvatars);
  const avatarsLength = avatars.length;

  for (let i = 0; i < NUMBER_OF_AI_PARTICIPANTS; i++) {
    const lapDuration = randomNumber(TIME_BOUNDS.MIN, TIME_BOUNDS.MAX);
    const participant = {
      name: `Participant ${i + 1}`,
      currentRank: null,
      lapsCompleted: 0,
      currentLapStartTime: Date.now(), // ms
      avatar: avatars[((i % avatarsLength) + avatarsLength) % avatarsLength],
      lapDuration
    };
    const id = `ai_${i}`;
    participants[id] = participant;
  }

  return participants;
};

export const rankParticipants = (participants, currentLapProgressList) => {
  // Compute the total ditance travelled by adding the laps completed to the current lap progress for each participant
  const totalDistanceTravelledList = currentLapProgressList.map(
    ({ id, progress: lapProgress }) => {
      const { lapsCompleted } = participants[id];
      const totalDistanceTravelled = lapProgress + lapsCompleted * 100;

      return { id, totalDistanceTravelled };
    }
  );

  // Sort the list by total distance travelled in descending order such that the participant with the longest distance travelled is on top
  const totalDistanceTravelledListSortedDesc = totalDistanceTravelledList.sort(
    (distanceData1, distanceData2) => {
      const p1DistanceTravelled = distanceData1.totalDistanceTravelled;
      const p2DistanceTravelled = distanceData2.totalDistanceTravelled;

      return p2DistanceTravelled - p1DistanceTravelled;
    }
  );

  // Assign a rank to each participant corresponding to the position of its id in the totalDistanceTravelledListSortedDesc array
  totalDistanceTravelledListSortedDesc.forEach(({ id }, i) => {
    participants[id].currentRank = i + 1;
  });

  return participants;
};
