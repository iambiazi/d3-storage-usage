import React from 'react';
import InfoDisplayTemplate from './InfoDisplayTemplate';

const CapacityConsumed = ({tooltipData, maxStorage}) => {
  const percentage = (tooltipData.value / maxStorage) * 100;
  const dateTime = tooltipData.date
    ? `${tooltipData.date.toDateString()} @ ${tooltipData.date.toLocaleTimeString(
        [],
        {
          hour: 'numeric',
          minute: '2-digit',
        },
      )}`
    : '';
  return (
    <InfoDisplayTemplate
      label="Capacity consumed"
      valueMain={`${percentage.toFixed(3)}%`}
      valueLabel={` (${tooltipData.value.toFixed(2)}PB)`}
      header={tooltipData.metric}
      additionalInfo={dateTime}
    />
  );
};

export default CapacityConsumed;
