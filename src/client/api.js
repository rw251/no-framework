import state from './state';
import data from './dummyData';

const doGet = url => fetch(url).then(response => response.json());
const doPost = (url, dataToSend) => fetch(url, {
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(dataToSend),
}).then(response => response.json());
const doDelete = url => fetch(url, { method: 'DELETE' }).then(response => response.json());

export default {

  practices: () => new Promise((resolve) => {
    if (state.practices) return resolve(state.practices);
    return doGet('/api/practices').then((practices) => {
      state.practices = practices;
      resolve(state.practices);
    });
  }),

  summary: (practiceId, dateId, comparisonDateId) => (!practiceId || practiceId === '0'
    ? new Promise(resolve => resolve({ tableData: [], summaryData: {} }))
    : doGet(`/api/practice/${practiceId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`)),

  ccgSummary: (indicatorId, dateId, comparisonDateId) => (!indicatorId || indicatorId === '0'
    ? doGet(`/api/indicator/all/summaryfordate/${dateId}`)
    : doGet(`/api/indicator/${indicatorId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`)),

  affected: (practiceId, indicatorId, dateId, comparisonDateId) => doGet(`/api/patients/${practiceId}/${dateId}/${comparisonDateId}/${indicatorId}/numerator`),

  existing: (practiceId, indicatorId, dateId, comparisonDateId) => doGet(`/api/patients/${practiceId}/${dateId}/${comparisonDateId}/${indicatorId}/existing`),

  resolved: (practiceId, indicatorId, dateId, comparisonDateId) => doGet(`/api/patients/${practiceId}/${dateId}/${comparisonDateId}/${indicatorId}/resolved`),

  new: (practiceId, indicatorId, dateId, comparisonDateId) => doGet(`/api/patients/${practiceId}/${dateId}/${comparisonDateId}/${indicatorId}/new`),

  multiple: (practiceId, dateId) => doGet(`/api/patients/${practiceId}/multiple/on/${dateId}`),

  datesForDisplay: () => new Promise((resolve) => {
    if (state.dates) return resolve(state.dates);
    return doGet('/api/datesForDisplay').then((dates) => {
      state.dates = dates;
      resolve(state.dates);
    });
  }),

  indicators: () => new Promise((resolve) => {
    if (state.indicators) return resolve(state.indicators);
    return doGet('/api/indicators').then((indicators) => {
      state.indicators = indicators;
      resolve(state.indicators);
    });
  }),

  notesDelete: patientId => doDelete(`/api/note/${patientId}`),

  notesUpsert: note => doPost('/api/note', note),
};
