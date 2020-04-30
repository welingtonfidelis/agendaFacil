import React from 'react';
import { Fade, LinearProgress } from '@material-ui/core'

import './styles.scss';

export default function Load(props) {
  const { loading } = props;

  return (
    <div>
      <Fade
        in={loading}
        style={{
          transitionDelay: loading ? '10ms' : '10ms',
        }}
      >
        <LinearProgress color="secondary" />
      </Fade>
    </div>
  )
}