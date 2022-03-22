import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import UserContext from './context';

/**
 * @typedef {Object} User
 * @property {string} name
 * @property {string} avatar
 * @property {boolean} joined
 */

const UserProvider = ({ children, storage, savedUserData }) => {
  /**
   * @type {[User, Function]}
   */
  const [user, setUser] = useState({
    ...savedUserData,
    joined: !!(savedUserData.name && savedUserData.avatar)
  });

  const updateUser = useCallback(
    (userData) => {
      if (userData.name && userData.avatar) {
        storage.setItem('userData', JSON.stringify(userData));
        setUser({ ...userData, joined: true });
      }
    },
    [storage]
  );

  const value = useMemo(() => ({ user, updateUser }), [user, updateUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
  storage: PropTypes.object,
  savedUserData: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string
  })
};

UserProvider.defaultProps = {
  storage: sessionStorage,
  savedUserData: { name: '', avatar: '' }
};

export default UserProvider;
