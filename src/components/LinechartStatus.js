import React from 'react';
import CapacityConsumed from './CapacityConsumed';
import GrowthRate from './GrowthRate';
import FutureGrowth from './FutureGrowth';

// TODO fast designed for browser, change for responsive
const totalWidth = window.innerWidth > 900 ? window.innerWidth - 100 : 900;

export default class LinechartStatus extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      tooltipData,
      maxStorage,
      displayedStartData,
      displayedEndData,
      daysDisplayed,
      grandMax,
    } = this.props;
    let tbAverage = 0;
    if (displayedStartData && displayedEndData) {
      tbAverage =
        ((displayedEndData[tooltipData.metric] -
          displayedStartData[tooltipData.metric]) *
          1000) /
        daysDisplayed;
    }
    return (
      <div>
        <div id="linechart-container">
          <CapacityConsumed tooltipData={tooltipData} maxStorage={maxStorage} />
          <GrowthRate average={tbAverage.toFixed(1)} />
          <FutureGrowth
            average={tbAverage}
            maxStorage={maxStorage}
            grandMax={grandMax}
          />
          {/* <Tooltip tooltipData={tooltipData} /> */}
          <style>
            {`
            .lineChart-metric-value {
              font-size: 2rem;
              color: ${tooltipData.color};
            }
            #linechart-container {
              display: flex;
              width: ${totalWidth}px;
              justify-content: space-around;
            }
            .linechart-metric-value {
              color: ${tooltipData.color};
              font-size: 1.7rem;
            }
            .metric-type-label {
              color: ${tooltipData.color};
              font-size: 2rem;
              height: 2rem;
            }
            .linechart-metric-info {
              color: lightgrey;
              font-size: 1.3rem;
            }
            .linechart-additional-info {
              color: ${tooltipData.color};
              font-size: 1rem;
            }
          `}
          </style>
        </div>
      </div>
    );
  }
}
