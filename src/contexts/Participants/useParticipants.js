import { useContext } from 'react';
import ParticipantsContext from './context';

const useParticipants = () => {
  const context = useContext(ParticipantsContext);

  if (!context) {
    throw new Error(
      'Participants context must be consumed inside the Participants Provider'
    );
  }

  return context;
};

export default useParticipants;
