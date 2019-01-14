import React from 'react';
import InfoDisplayTemplate from './InfoDisplayTemplate';

const FutureGrowth = ({average, maxStorage, grandMax}) => {
  const remaining = maxStorage - grandMax;
  const daysLeft = (remaining * 1000) / average;

  return (
    <InfoDisplayTemplate
      label={'Usage Forecast'}
      valueMain={`${Math.round(daysLeft)}`}
      valueLabel={' days before exceeding 22PB max'}
    />
  );
};

export default FutureGrowth;
