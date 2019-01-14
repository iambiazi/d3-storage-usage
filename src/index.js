import React from 'react';
import ReactDOM from 'react-dom';
import AreaChart from './components/AreaChart';
import data from './data/dummydata';

const maxStorage = 22;

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data: [],
      filteredData: [],
      // keep arrays in same order to keep colors consistent when toggled
      keys: [
        'Total storage',
        'Movies',
        'TV series',
        'TV ads',
        'Commentaries',
        'Corporate videos',
        'eTraining videos',
        'Webcasts',
      ],
      filteredKeys: [
        'Total storage',
        'Movies',
        'TV series',
        'TV ads',
        'Commentaries',
        'Corporate videos',
        'eTraining videos',
        'Webcasts',
      ],
      grandMax: 0,
    };
    this.filterOnClick = this.filterOnClick.bind(this);
  }

  componentDidMount() {
    const combined = new Map();

    data.forEach(el => {
      const key = el.date.slice(0, 10);
      if (combined.has(key)) {
        const toUpdate = combined.get(key);
        toUpdate[el.cat] = el.stored;
        toUpdate['Total storage'] += el.stored;
        combined.set(key, toUpdate);
      } else {
        combined.set(key, {
          date: new Date(el.date),
          [el.cat]: el.stored,
          'Total storage': el.stored,
        });
      }
    });
    if (this.state.grandMax === 0) {
      const arr = Array.from(combined.values());
      this.setState({grandMax: arr[arr.length - 1]['Total storage']});
    }
    this.setState({
      data: Array.from(combined.values()),
      filteredData: Array.from(combined.values()),
    });
  }

  filterOnClick(name) {
    this.setState(state => {
      for (let i = 0; i < state.filteredKeys.length; ++i) {
        if (state.filteredKeys[i] === name && state.filteredKeys.length > 1) {
          const copy = state.filteredKeys.slice();
          copy.splice(i, 1);
          return {
            filteredKeys: copy,
            filteredData: state.data.map(obj => mapAndRecalc(obj, copy)),
          };
        }
      }
      const copy = [...state.filteredKeys];
      for (let i = 0; i < state.keys.length; ++i) {
        if (state.keys[i] === name && !copy.includes(name)) {
          copy.splice(i, 0, name);
        }
      }
      return {
        filteredKeys: copy,
        filteredData: state.data.map(obj => mapAndRecalc(obj, copy)),
      };
    });

    function mapAndRecalc(obj, keys) {
      const altered = {'Total storage': 0};
      const toKeep = {date: 1};
      for (let i = 0; i < keys.length; ++i) {
        toKeep[keys[i]] = 1;
      }
      for (const key in obj) {
        if (key !== 'Total storage' && toKeep.hasOwnProperty(key)) {
          altered[key] = obj[key];
          if (key !== 'date') {
            altered['Total storage'] += obj[key];
          }
        }
      }
      return altered;
    }
  }

  render() {
    return (
      <div>
        {this.state.filteredData.length && (
          <AreaChart
            data={this.state.filteredData}
            maxStorage={maxStorage}
            colorKeys={this.state.keys}
            keys={this.state.filteredKeys}
            handleClick={this.filterOnClick}
            grandMax={this.state.grandMax}
          />
        )}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));
