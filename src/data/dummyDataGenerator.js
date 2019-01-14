const fs = require('fs');
const dayjs = require('dayjs');

function dataGenerator() {
  //target goal, at end of generation, should be at this percent of total storage 10.88 PB



  //every 6-8 days, will increase
  //increase varying amounts
  //other data points still generated for those days, but steady
  //need to randomly generate a time for each changing point
  //otherwise have time points be at 11:59pm (no chance of a change that day)

  //upload should be some percentage of the total

  const data = [];
  let value = 0;
  let nextJump = 0;
  let slope = 0.005;
  let toggled = false;
  let on = 0;
  let spike = false;
  let spikeCount = 0;

  let start = new Date(
    dayjs(new Date(2018, 1, 14))
      .subtract(750, 'days'),
  );


  function random(num) {
    return Math.floor(Math.random() * num);
  }
  const randomness = [230, 200, 220, 180, 150, 120, 100];
  const percentOfTotal = [27.333, 19.833, 14.927, 10.873, 7.873, 5.873, 2.813];
  const category = ['Movies', 'TV series', 'TV ads', 'Commentaries', 'Corporate videos', 'eTraining videos', 'Webcasts'];

  let cat = '';
  let mult = '';
for (let j = 0; j < percentOfTotal.length; ++j) {
  cat = category[j];
  mult = percentOfTotal[j] / 100;
  value = 0;
  on = 0;
  for (let i = 1; i < 744; ++i) {
    if (i % (40 + random(20)) === 0) {
      let add = 0.045 + 0.01 * random(6);
      value += add;
      slope = add - 0.008;
    }

    if (i % 20 + random(80) === 0) {
      toggled = true;
      on = 30;
    }

    if (toggled) {
      slope += .001;
      on--;
      if (on === 1) {
        toggled = false;
      }
    }

    if (i % randomness[j] === 0) {
      spike = true;
      spikeCount = 10;
    }

    if (spike) {
      slope += .02;
      spikeCount--;
      if (spikeCount === 0) {
        spike = false;
      }
    }


    if (i % (30 + random(10)) === 0) {
      value += 0.01;
      slope += 0.015;
    }
    if (nextJump === 0) {
      value += 0.0312 * (2 + 4 * random(3));
      let hours = (8 + random(8)).toString().padStart(2);
      let minutes = random(61);

      let date = new Date(
        dayjs(start)
          .add(i, 'days').add(hours, 'hours').add(minutes, 'minutes'));

      const dp = {
        cat: cat,
        date: date,
        stored: (value * mult) / 2.5,
      };
      data.push(dp);
      nextJump = 5 + random(3);
    } else {
      nextJump--;
      value += slope;
      slope -= slope > .002 ? 0.002 : 0;
      let hours = (8 + random(8)).toString().padStart(2);
      let minutes = random(61);
      let date = new Date(
        `${dayjs(start)
          .add(i, 'days')}`,
      );
      const dp = {
        cat: cat,
        date: date,
        stored: (value * mult) / 2.5,
      };
      data.push(dp);
    }
  }
}

  return data;

  //generate the total on the other side

  //should return array of objects
}

const data = JSON.stringify(dataGenerator());

fs.appendFile('dummydata.js', data, err => {
  if (err) {
    return console.error(err);
  }
});
