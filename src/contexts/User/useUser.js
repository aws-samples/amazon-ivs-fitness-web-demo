import { useContext } from 'react';
import UserContext from './context';

const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('User context must be consumed inside the User Provider');
  }

  return context;
};

export default useUser;
