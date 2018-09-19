import state from './state';
import data from './dummyData';

export default {

  practices: () => new Promise((resolve) => {
    if (state.practices) return resolve(state.practices);
    return setTimeout(() => {
      state.practices = data.practices;
      resolve(state.practices);
    }, Math.random() * 500);
  }),

  summary: (practiceId, dateId, comparisonDateId) => new Promise((resolve) => {
    setTimeout(() => {
      resolve(data.summary(practiceId, dateId, comparisonDateId));
    }, Math.random() * 300);
  }),

  ccgSummary: (indicatorId, dateId, comparisonDateId) => new Promise((resolve) => {
    setTimeout(() => {
      if (!indicatorId || indicatorId === '0') resolve(data.ccgSummaryAllIndicators(indicatorId, dateId, comparisonDateId));
      else resolve(data.ccgSummarySingleIndicator(indicatorId, dateId, comparisonDateId));
    }, Math.random() * 300);
  }),

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
    return setTimeout(() => {
      state.dates = data.dates;
      resolve(state.dates);
    }, Math.random() * 600);
  }),

  indicators: () => new Promise((resolve) => {
    if (state.indicators) return resolve(state.indicators);
    return setTimeout(() => {
      state.indicators = data.indicators;
      resolve(state.indicators);
    }, Math.random() * 1000);
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
