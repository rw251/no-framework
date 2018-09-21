const state = {
  practiceTabId: 1,
  practiceIndicatorTabId: 1,
  tables: {},
  redrawTables() {
    Object.keys(state.tables).forEach((table) => {
      state.tables[table].columns.adjust().draw(false);
    });
  },
};

export default state;
