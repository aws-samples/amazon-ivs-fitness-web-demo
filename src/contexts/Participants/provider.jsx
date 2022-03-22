import React, { useCallback, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

import ParticipantsContext from './context';
import useUser from '../User/useUser';
import { USER_KEY } from '../../config';

import {
  generateAiParticipants,
  randomNumber,
  rankParticipants
} from './utils';
import {
  TIME_BOUNDS,
  NEW_TIME_EVERY_LAP,
  USER_STARTING_LAP_DURATION
} from '../../config';

/**
 * @typedef {Object} Participant
 * @property {string} name
 * @property {string} avatar
 * @property {number} currentLapStartTime
 * @property {number} currentRank
 * @property {number} lapsCompleted
 * @property {number} lapDuration
 *
 * @typedef {Object.<string, Participant> & { user: Participant}} Participants
 */

/**
 * State initialization
 * @param {{ name: string, avatar: string }} savedUserData
 * @param {Participants} ais randomly generated AI participants
 * @returns {Participants} ai and user participants
 */
const init = (userData) => {
  const user = {
    ...userData,
    currentLapStartTime: Date.now(),
    currentRank: null,
    lapsCompleted: 0,
    lapDuration: USER_STARTING_LAP_DURATION
  };
  const ais = generateAiParticipants();
  const participants = { ...ais, user };

  return participants;
};

const actionTypes = {
  COMPLETE_LAP: 'COMPLETE_LAP',
  UPDATE_RANKINGS: 'UPDATE_RANKINGS',
  UPDATE_USER_TIME: 'UPDATE_USER_TIME'
};

/**
 * @param {Participants} participants
 * @param {Object.<string, any> & { type: string}} action
 * @returns {Participants}
 */
const reducer = (participants, action) => {
  switch (action.type) {
    case actionTypes.COMPLETE_LAP: {
      const { id } = action;
      const newParticipants = cloneDeep(participants);
      const { lapsCompleted } = newParticipants[id];
      const updatedProps = {
        lapsCompleted: lapsCompleted + 1,
        currentLapStartTime: Date.now()
      };

      if (NEW_TIME_EVERY_LAP && id !== USER_KEY) {
        // Randomize the lapDuration for AI pariticipants that just completed a lap
        updatedProps.lapDuration = randomNumber(
          TIME_BOUNDS.MIN,
          TIME_BOUNDS.MAX
        );
      }

      newParticipants[id] = { ...newParticipants[id], ...updatedProps };

      return newParticipants;
    }

    case actionTypes.UPDATE_RANKINGS: {
      const { currentLapProgressList } = action;
      const newParticipants = cloneDeep(participants);
      const rankedParticipants = rankParticipants(
        newParticipants,
        currentLapProgressList
      );

      return rankedParticipants;
    }

    case actionTypes.UPDATE_USER_TIME: {
      const { lapDuration } = action;
      const newParticipants = cloneDeep(participants);

      newParticipants[USER_KEY] = { ...newParticipants[USER_KEY], lapDuration };

      return newParticipants;
    }

    default:
      throw new Error('Unexpected action type');
  }
};

const ParticipantsProvider = ({ children }) => {
  const { user: userData } = useUser();

  /**
   * @type {[Participants, Function]}
   */
  const [participants, dispatch] = useReducer(reducer, userData, init);

  const updateUserTime = useCallback((lapDuration) => {
    dispatch({ type: actionTypes.UPDATE_USER_TIME, lapDuration });
  }, []);

  const updateRankings = useCallback((currentLapProgressList) => {
    dispatch({ type: actionTypes.UPDATE_RANKINGS, currentLapProgressList });
  }, []);

  const completeLap = useCallback((id) => {
    dispatch({ type: actionTypes.COMPLETE_LAP, id });
  }, []);

  const value = useMemo(() => {
    const participantCount = Object.keys(participants).length;

    return {
      completeLap,
      updateRankings,
      updateUserTime,
      participantCount,
      participants
    };
  }, [completeLap, participants, updateRankings, updateUserTime]);

  return (
    <ParticipantsContext.Provider value={value}>
      {children}
    </ParticipantsContext.Provider>
  );
};

ParticipantsProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default ParticipantsProvider;
