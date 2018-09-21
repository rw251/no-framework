import state from './state';
import data from './dummyData';

const myFetch = url => fetch(url).then(response => response.json());

export default {

  practices: () => new Promise((resolve) => {
    if (state.practices) return resolve(state.practices);
    return myFetch('/api/practices').then((practices) => {
      state.practices = practices;
      resolve(state.practices);
    });
  }),

  summary: (practiceId, dateId, comparisonDateId) => myFetch(`/api/practice/${practiceId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`),

  ccgSummary: (indicatorId, dateId, comparisonDateId) => (!indicatorId || indicatorId === '0'
    ? myFetch(`/api/indicator/all/summaryfordate/${dateId}`)
    : myFetch(`/api/indicator/${indicatorId}/summaryfordate/${dateId}/comparedWith/${comparisonDateId}`)),

  // new Promise((resolve) => {
  //   setTimeout(() => {
  //     if (!indicatorId || indicatorId === '0') resolve(dat
  // a.ccgSummaryAllIndicators(indicatorId, dateId, comparisonDateId));
  //     else resolve(data.ccgSummarySingleIndicator(indicatorId, dateId, comparisonDateId));
  //   }, Math.random() * 300);
  // }),

  affected: (practiceId, indicatorId, dateId, comparisonDateId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.affected(practiceId, indicatorId, dateId, comparisonDateId));
    }, Math.random() * 600);
  }),

  existing: (practiceId, indicatorId, dateId, comparisonDateId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.existing(practiceId, indicatorId, dateId, comparisonDateId));
    }, Math.random() * 600);
  }),

  resolved: (practiceId, indicatorId, dateId, comparisonDateId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.resolved(practiceId, indicatorId, dateId, comparisonDateId));
    }, Math.random() * 600);
  }),

  new: (practiceId, indicatorId, dateId, comparisonDateId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.new(practiceId, indicatorId, dateId, comparisonDateId));
    }, Math.random() * 600);
  }),

  multiple: (practiceId, dateId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.multiple(practiceId, dateId));
    }, Math.random() * 600);
  }),

  datesForDisplay: () => new Promise((resolve) => {
    if (state.dates) return resolve(state.dates);
    return myFetch('/api/datesForDisplay').then((dates) => {
      state.dates = dates;
      resolve(state.dates);
    });
  }),

  indicators: () => new Promise((resolve) => {
    if (state.indicators) return resolve(state.indicators);
    return myFetch('/api/indicators').then((indicators) => {
      state.indicators = indicators;
      resolve(state.indicators);
    });
  }),

  notesDelete: patientId => new Promise(resolve => setTimeout(() => {
    data.noteDelete(patientId);
    resolve();
  }, Math.random() * 500)),

  notesUpsert: (patientId, note) => new Promise(resolve => setTimeout(() => {
    data.upsertNote(patientId, note);
    resolve();
  }, Math.random() * 500)),
};
