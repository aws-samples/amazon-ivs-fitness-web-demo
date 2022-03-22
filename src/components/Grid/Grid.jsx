import React from 'react';
import PropTypes from 'prop-types';

import './Grid.css';

const Grid = ({ children: columns, reverse, scrollable }) => {
  let classList = ['grid'];

  if (reverse) classList.push('reverse');
  if (scrollable) classList.push('scrollable');

  return (
    <div id="main-grid" className={classList.join(' ')}>
      {columns}
    </div>
  );
};

const GridItem = ({ type, children, autoFit, scrollable }) => {
  let classList = ['flex'];

  if (type === 'row') classList.push('grid-row');
  if (type === 'col') classList.push('grid-col');

  if (autoFit) classList.push('autoFit');
  if (scrollable) classList.push('scrollable');

  return <div className={classList.join(' ')}>{children}</div>;
};

Grid.Col = (props) => <GridItem type="col" {...props} />;
Grid.Row = (props) => <GridItem type="row" {...props} />;

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  reverse: PropTypes.bool,
  scrollable: PropTypes.bool
};

Grid.defaultProps = { reverse: false, scrollable: false };

GridItem.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['row', 'col']).isRequired,
  autoFit: PropTypes.bool,
  scrollable: PropTypes.bool
};

GridItem.defaultProps = {
  autoFit: false,
  scrollable: false
};

export default Grid;
