import PropTypes from 'prop-types';
import React from 'react';

import { Checkmark, Crown } from '../../assets/svg';
import AVATARS from '../../assets/avatars';
import { USER_KEY } from '../../config';

import './Avatar.css';

const Icon = ({ avatar = '', name = '' }) => (
  <img
    src={AVATARS[avatar]}
    alt={`${name || avatar} Avatar`}
    draggable={false}
  />
);

Icon.propTypes = {
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string
};

const Avatar = ({
  avatar = '',
  name = '',
  size = 'auto',
  crown = false,
  marker = '',
  onClick = null,
  selected = false,
  hoverable = false
}) => {
  const classes = ['avatar'];
  classes.push(size);
  if (marker) classes.push(`marker--${marker}`);
  if (selected) classes.push('selected');
  if (hoverable) classes.push('hoverable');

  return onClick ? (
    <button type="button" onClick={onClick} className={classes.join(' ')}>
      {selected && <Checkmark />}
      <Icon avatar={avatar} name={name} />
    </button>
  ) : (
    <div className={classes.join(' ')}>
      {crown && <Crown className="crown" />}
      <Icon avatar={avatar} name={name} />
    </div>
  );
};

Avatar.propTypes = {
  avatar: PropTypes.string.isRequired,
  name: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'auto']),
  crown: PropTypes.bool,
  marker: PropTypes.oneOf([USER_KEY, 'ai', '']),
  onClick: PropTypes.func,
  selected: PropTypes.bool,
  hoverable: PropTypes.bool
};

export default Avatar;
