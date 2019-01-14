import React, {Component} from 'react';
import * as d3 from 'd3';
import HoverLine from './HoverLine';
import LinechartStatus from './LinechartStatus';

// TODO fast designed for browser, change for responsive
const totalWidth = window.innerWidth > 700 ? window.innerWidth - 350 : 600;
const totalHeight = 500;

const margin = {
  top: 20,
  right: 20,
  bottom: 110,
  left: 40,
};
const margin2 = {
  top: 420,
  right: 20,
  bottom: 50,
  left: 40,
};
const width = totalWidth - margin.left - margin.right;
const height = totalHeight - margin.top - margin.bottom;
const height2 = totalHeight - margin2.top - margin2.bottom + 20;

class AreaChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tooltipData: {
        date: undefined,
        metric: '',
        value: 0,
        color: '',
      },
      mousePosition: {},
      currentTotalUsed: 0,
      displayedStartData: null,
      displayedEndData: null,
      startIdx: 0,
      endIdx: 0,
    };
    this.createChart = this.createChart.bind(this);
  }

  componentDidMount() {
    const {data, keys} = this.props;
    this.createChart(data, keys);
  }

  componentWillReceiveProps(nextProps) {
    const {data, keys, colorKeys} = nextProps;
    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    colors.domain(colorKeys);
    d3.select('#areaChart')
      .selectAll('*')
      .remove();

    d3.selectAll('.legend')
      .transition()
      .duration(300)
      .style('fill', d => {
        if (keys.includes(d) && data[0][d]) {
          return colors(d);
        }
        return '#DDDDDD';
      });

    this.createChart(nextProps.data, nextProps.keys);
  }

  createChart(data, keys) {
    const _this = this;
    const currentTotalUsed = data[data.length - 1]['Total storage'];
    const max = 2 + currentTotalUsed;

    const colors = d3.scaleOrdinal(d3.schemeCategory10);
    colors.domain(this.props.colorKeys);

    _this.setState({
      currentTotalUsed,
      tooltipData: {
        date: new Date(),
        metric: 'Total storage',
        value: currentTotalUsed,
        color: colors('Total storage'),
      },
      // TODO maybe change this for initial view?
      displayedStartData: data[0],
      displayedEndData: data[data.length - 1],
      startIdx: 0,
      endIdx: data[data.length - 1],
    });

    const svg = d3.select('#areaChart').attr('transform', 'translate(30,20)');

    const xUpperScale = d3.scaleTime().range([0, width]);
    const xLowerScale = d3.scaleTime().range([0, width]);
    const yMainScale = d3.scaleLinear().range([height, 0]);
    const yPreviewScale = d3.scaleLinear().range([height2, 0]);

    const xAxis = d3.axisBottom(xUpperScale);
    const xAxis2 = d3.axisBottom(xLowerScale);
    const yAxis = d3.axisLeft(yMainScale);

    const stack = d3.stack();

    stack.keys(keys);

    const container = svg.append('g').attr('transform', 'translate(20,0)');

    const brush = d3
      .brushX()
      .extent([[0, 0], [width, height2]])
      .on('end', brushed);

    const zoom = d3
      .zoom()
      .scaleExtent([1, data.length / 2])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on('zoom', zoomed);

    const area = d3
      .area()
      .curve(d3.curveLinear)
      .x(d => xUpperScale(d.data.date))
      .y0(() => yMainScale(0))
      .y1(d => yMainScale(d[1] - d[0]));

    const area2 = d3
      .area()
      .x(d => xLowerScale(d.data.date))
      .y0(() => yPreviewScale(0))
      .y1(d => yPreviewScale(d[1] - d[0]));

    xUpperScale.domain(d3.extent(data, d => d.date));
    xLowerScale.domain(xUpperScale.domain());
    yMainScale.domain([0, max]);
    yPreviewScale.domain([0, max]);

    function make_y_gridlines() {
      return d3.axisLeft(yMainScale).ticks(5);
    }

    container
      .append('g')
      .attr('class', 'grid')
      .call(
        make_y_gridlines()
          .tickSize(-width)
          .tickFormat(''),
      );

    const focus = container
      .selectAll('.focus')
      .data(stack(data))
      .enter()
      .append('g')
      .attr('class', 'focus');

    focus.select('.brush').call(brush);

    const binarySearchDate = (arr, target) => {
      let left = 0;
      let right = arr.length - 1;
      while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        if (arr[mid].date.toDateString() === target.toDateString()) {
          return mid;
        }
        if (arr[mid].date < target) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return -1;
    };

    focus
      .append('path')
      .attr('class', 'area')
      .style('fill', d => colors(d.key))
      .style('opacity', '0.7')
      .attr('d', area)
      .attr('id', d => d.key)
      .on('mousemove', function(d) {
        const currentIdx = binarySearchDate(
          data,
          xUpperScale.invert(d3.mouse(this)[0]),
        );
        const currentDataPoint = d[currentIdx];
        const myTimeseries = this.id;

        _this.setState({
          tooltipData: {
            date: currentDataPoint.data.date,
            metric: myTimeseries,
            value: currentDataPoint[1] - currentDataPoint[0],
            color: colors(d.key),
          },
          mousePosition: {
            x: event.clientX,
            y: event.clientY,
          },
        });
      })
      .on('mouseover', function() {
        d3.select(this).style('opacity', '1');
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', '0.8');
        _this.setState({
          tooltipData: {
            date: new Date(),
            metric: 'Total storage',
            value: currentTotalUsed,
            color: colors('Total storage'),
          },
          mousePosition: {},
        });
      });

    container
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    container
      .append('g')
      .attr('class', 'axis axis--y')
      .call(yAxis);

    const context = container
      .selectAll('.context')
      .data(stack(data))
      .enter()
      .append('g')
      .attr('class', 'context')
      .attr('transform', `translate(${0},${margin2.top})`);

    context
      .append('path')
      .attr('class', 'area2')
      // TODO grey out other colors once data is in right form
      .style('fill', d => colors(d.key))
      .attr('d', area2);

    container
      .append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', `translate(0,${margin2.top + 50})`)
      .call(xAxis2);

    container
      .append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, xUpperScale.range())
      .attr('transform', `translate(${0},${margin2.top})`);

    const legendSvg = d3
      .select('#legend')
      .append('svg')
      .attr('width', 10000)
      .attr('height', 10000)
      .attr('x', 0)
      .attr('y', 0);

    const legend = legendSvg
      .append('g')
      .attr('class', 'legend1')
      .attr('transform', 'translate(-20,50)');

    const legendRectSize = 20;
    const legendSpacing = 4;
    legend
      .selectAll('rect')
      .data(colors.domain())
      .enter()
      .append('rect')
      .attr('class', 'legend')
      .attr('x', width - 65)
      .attr('y', 25)
      .attr('height', 25)
      .attr('width', 25)
      .style('fill', colors)
      .attr('stroke', colors)
      .attr('stroke-width', 4)
      .attr('transform', (d, i) => {
        const height = legendRectSize + legendSpacing;
        const horz = -2 * legendRectSize + 225;
        const vert = 1.5 * i * height;
        return `translate(${horz},${vert})`;
      })
      .on('click', d => {
        this.props.handleClick(d);
      });

    legend
      .selectAll('text')
      .data(colors.domain())
      .enter()
      .append('text')
      .attr('x', width + 155)
      .attr('y', (d, i) => (i - 1) * 36 + 80)
      .style('fill', colors)
      .text(d => d)
      .on('click', d => {
        this.props.handleClick(d);
      });

    svg.call(zoom);

    function brushed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return; // ignore brush-by-zoom
      const s = d3.event.selection || xLowerScale.range();
      xUpperScale.domain(s.map(xLowerScale.invert, xLowerScale));
      focus.select('.area').attr('d', area);
      container.select('.axis--x').call(xAxis);
      container
        .select('.brush')
        .call(
          zoom.transform,
          d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0),
        );
      const [minX, maxX] = s;
      _this.setState({
        zoomedStart: minX,
        zoomedEnd: maxX,
      });
    }

    function zoomed() {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return; // ignore zoom-by-brush
      const t = d3.event.transform;
      const startEndDates = t.rescaleX(xLowerScale).domain();
      const startIdx = binarySearchDate(data, startEndDates[0]);
      const endIdx = binarySearchDate(data, startEndDates[1]);

      xUpperScale.domain(startEndDates);
      yMainScale.domain([0, data[endIdx]['Total storage'] * 1.1]);
      focus.select('.area').attr('d', area);
      container
        .select('.axis--x')
        .transition()
        .duration(0)
        .call(xAxis);
      container
        .select('.axis--y')
        .transition()
        .duration(0)
        .call(yAxis);
      container
        .select('.grid')
        .transition()
        .duration(0)
        .call(
          make_y_gridlines()
            .tickSize(-width)
            .tickFormat(''),
        );

      container
        .select('.brush')
        .call(brush.move, xLowerScale.range().map(t.invertX, t));
      container.select('.brush').call(brush.move, null);
      _this.setState({
        displayedStartData: data[startIdx],
        displayedEndData: data[endIdx - 1],
        startIdx,
        endIdx,
      });
    }
  }

  render() {
    return (
      <div>
        <LinechartStatus
          tooltipData={this.state.tooltipData}
          maxStorage={this.props.maxStorage}
          displayedStartData={this.state.displayedStartData}
          displayedEndData={this.state.displayedEndData}
          daysDisplayed={this.state.endIdx - this.state.startIdx + 1}
          currentUsed={this.state.currentTotalUsed}
          grandMax={this.props.grandMax}
        />
        <svg
          id="areaChart"
          ref={node => (this.node = node)}
          width={totalWidth - 40}
          height={totalHeight}
        />
        <HoverLine
          width={width}
          height={height}
          marginTop={margin.top}
          mousePosition={this.state.mousePosition}
        />
      </div>
    );
  }
}

export default AreaChart;
