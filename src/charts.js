import Template from 'rw-templater';

const c3 = require('c3');

const singlePracticeComparison = (bindto, data) => {
  c3.generate({
    bindto,
    size: { height: 400 },
    data,
    axis: {
      x: {
        type: 'category',
        tick: {
          rotate: 60,
          multiline: false,
        },
      },
      y: {
        label: {
          text: '% of eligible patients affected',
          position: 'outer-middle',
        },
      },
    },
    point: { r: 6 },
    grid: { y: { show: true } },
  });
};

const singlePracticeTrend = (bindto, data, yLabel) => {
  c3.generate({
    bindto,
    size: { height: 400 },
    data,
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m-%d',
          rotate: 60,
          multiline: false,
        },
        height: 60,
      },
      y: {
        label: {
          text: yLabel,
          position: 'outer-middle',
        },
      },
    },
    grid: {
      x: { show: true },
      y: { show: true },
    },
  });
};

const comparisonChartData = (tableData) => {
  const chartData = {
    keys: { x: 'x', value: ['ccg', 'practice'] },
    types: { ccg: 'line', practice: 'bar' },
    names: { ccg: 'CCG Average', practice: 'Aintry  Medical Practice' },
    colors: { ccg: 'black', practice: 'red' },
  };
  chartData.json = tableData
    .map(item => ({ x: item.short_name, ccg: item.ccg, practice: item.avg }));
  return chartData;
};

const trendChartData = (
  trendData,
  startDate = new Date(2000, 1, 1),
  endDate = new Date()
) => {
  const rtn = { x: 'x' };
  const from = new Date(startDate);
  from.setHours(from.getHours() - 3);
  const to = new Date(endDate);
  to.setHours(to.getHours() + 3);
  rtn.columns = [];
  trendData.columns[0].forEach((v, i) => {
    if (i === 0) {
      trendData.columns.forEach((vv) => {
        rtn.columns.push([vv[0]]);
      });
    } else if (new Date(v) >= from && new Date(v) <= to) {
      trendData.columns.forEach((vv, ii) => {
        rtn.columns[ii].push(trendData.columns[ii][i]);
      });
    }
  });
  rtn.columns[0] = rtn.columns[0].map(v => v.substr(0, 10));
  return rtn;
};

const shortDateFormat = (date) => {
  const d1 = (new Date(date)).toDateString().substr(4); // Jan 01 2016
  const dateBits = d1.split(' '); // ['Jan', '01', '2016']
  return `${+dateBits[1]} ${dateBits[0]} ${dateBits[2]}`;
};

const doDates = (start, end, trendData) => {
  const dates = trendData.columns[0]
    .slice(1) // don't want the "x"
    .sort((a, b) => new Date(b) - new Date(a)); // sort date descending

  const startDate = new Date(start || dates[dates.length - 1]);
  startDate.setHours(startDate.getHours() + 3);
  const endDate = new Date(end || dates[0]);
  const endDateForComparison = new Date(end || dates[0]);
  endDateForComparison.setHours(endDate.getHours() - 3);

  const endDates = trendData.columns[0]
    .slice(2) // don't want the "x" or first date as end dates
    .sort((a, b) => new Date(b) - new Date(a)) // sort date descending
    .filter(d => new Date(d) > startDate)
    .map(d => ({
      date: shortDateFormat(d),
      isSelected: shortDateFormat(d) === shortDateFormat(endDate),
    }));

  const startDates = trendData.columns[0]
    .slice(1) // don't want the "x"
    .sort((a, b) => new Date(b) - new Date(a)) // sort date descending
    .filter(d => new Date(d) < endDateForComparison)
    .map(d => ({
      date: shortDateFormat(d),
      isSelected: shortDateFormat(d) === shortDateFormat(startDate),
    }));
  return { endDates, startDates, endDate, startDate };
};

const displaySinglePracticeChart = (id, data, start, end) => {
  // determine the valid dates for the start/end dropdowns
  const { endDates, startDates, startDate, endDate } = doDates(start, end, data.trendChartData[+id === 1 ? 'num' : 'avg']);
  const areDates = +id !== 1;

  // create chart panel
  const chartContainerHtml = Template.it('chartContainer', {
    startDates,
    endDates,
    areDates,
    startDate,
    endDate,
  });
  $('#chartPanel').html(chartContainerHtml);

  switch (+id) {
    case 2:
      singlePracticeTrend('#chart', trendChartData(data.trendChartData.num, startDate, endDate), 'Number of affected patients');
      break;
    case 3:
      singlePracticeTrend('#chart', trendChartData(data.trendChartData.avg, startDate, endDate), '% of eligible patients affected');
      break;
    default:
      singlePracticeComparison('#chart', comparisonChartData(data.tableData));
  }
};

const displayPracticeIndicatorChart = (data, start, end) => {
  const { endDates, startDates, startDate, endDate } = doDates(start, end, data);
  const chartContainerHtml = Template.it('chartContainer', {
    startDates,
    endDates,
    areDates: true,
    startDate,
    endDate,
  });
  $('#chartPanel').html(chartContainerHtml);

  singlePracticeTrend('#chart', trendChartData(data, startDate, endDate), 'Number of affected patients');
};


export { displaySinglePracticeChart, displayPracticeIndicatorChart };
