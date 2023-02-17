import React, { useState, useRef } from 'react';
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
  const nameInputRef = useRef();

  const handleAvatarClick = (avatarSrcName) => {
    setAvatar(avatarSrcName);
    // If the name has not been filled-in yet, give it focus so the user naturally understands that that is what is needed next
    if (!name) {
      nameInputRef.current?.focus();
    }
  };

  const joinClass = (e) => {
    e.preventDefault();

    if (name && avatar) {
      navigate('/class');
      updateUser({ name: name, avatar: avatar });
    } else console.error('Error joining class');
  };

  const isBtnDisabled = !(name && avatar);
  // TODO: It would be nicer to be specific to the user about which one they lack, e.g., "Please enter a name"
  const disabledBtnTooltip = "Please enter a name and select an avatar";
  const enabledBtnTooltip = "Let's rock! 🏃🏽‍♀️";

  return (
    <section className="user-section">
      <h2>Join the class</h2>
      <form onSubmit={joinClass}>
        <input
          ref={nameInputRef}
          type="text"
          id="name"
          placeholder="Your name"
          // TODO: Discuss this idea and if we want to us it, determine how to suppress the compilation error ("jsx-a11y/no-autofocus")
          //autoFocus   
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
                onClick={() => handleAvatarClick(avatarSrcName)}
              />
            ))}
          </div>
        </div>
      </form>
      <button 
        type="submit" 
        className="join-class-btn" 
        disabled={isBtnDisabled} 
        title={isBtnDisabled ? disabledBtnTooltip : enabledBtnTooltip} 
        onClick={joinClass}
      >
        Join Class
      </button>
    </section>
  );
};

export default User;
