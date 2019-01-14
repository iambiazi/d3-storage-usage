import React from 'react';
import InfoDisplayTemplate from './InfoDisplayTemplate';

const GrowthRate = ({average}) => (
  <InfoDisplayTemplate
    label="Growth rate"
    valueMain={`${average}TB`}
    valueLabel="/day"
  />
);

export default GrowthRate;
