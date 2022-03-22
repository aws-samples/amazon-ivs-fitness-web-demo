import React from 'react';

import Grid from '../../components/Grid';
import Landing from './Landing';
import User from './User';

const Join = () => (
  <Grid>
    <Grid.Col>
      <Landing />
    </Grid.Col>
    <Grid.Col autoFit>
      <User />
    </Grid.Col>
  </Grid>
);

export default Join;
