import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as userAvatars from '../../../assets/avatars/user-avatars';
import Avatar from '../../../components/Avatar';
import useUser from '../../../contexts/User/useUser';

import './User.css';

const User = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const [name, setname] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);

  const joinClass = (e) => {
    e.preventDefault();

    if (name && avatar) {
      navigate('/class');
      updateUser({ name: name, avatar: avatar });
    } else console.error('Error joining class');
  };

  return (
    <section className="user-section">
      <h2>Join the class</h2>
      <form onSubmit={joinClass}>
        <input
          type="text"
          id="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setname(e.target.value)}
        />
        <div className="select-avatar-container">
          <h4>Select Avatar</h4>
          <div className="avatars">
            {Object.keys(userAvatars).map((avatarSrcName) => (
              <Avatar
                avatar={avatarSrcName}
                hoverable
                selected={avatar === avatarSrcName}
                key={avatarSrcName}
                onClick={() => setAvatar(avatarSrcName)}
              />
            ))}
          </div>
        </div>
      </form>
      <button type="submit" className="join-class-btn" onClick={joinClass}>
        Join Class
      </button>
    </section>
  );
};

export default User;
