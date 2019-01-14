import React from 'react';

const InfoDisplayTemplate = ({
  label,
  valueMain,
  valueLabel,
  additionalInfo,
  header,
}) => {
  return (
    <div>
      <div className="metric-type-label">{header ? `${header}:` : ''}</div>
      <p className="linechart-metric-info">
        <span className="linechart-metric-label">{label}</span>
        <br />
        <span className="linechart-metric-value">
          <span className="value-main">{valueMain}</span>
          {valueLabel}
        </span>
        <br />
        <br />
        <span className='linechart-additional-info'>{additionalInfo}</span>
        <style>{`
          .value-main {
            font-weight: 700;
          }
      `}</style>
      </p>
    </div>
  );
};

export default InfoDisplayTemplate;
