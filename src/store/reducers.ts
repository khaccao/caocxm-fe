import { combineReducers } from '@reduxjs/toolkit';

import { accountingInvoiceReducer } from './accountingInvoice';
import { appReducer } from './app';
import { documentReducer } from './documents/documentSlice';
import { employeeReducer } from './employee/employeeSlice';
import { GroupReducer } from './group/groupSlice';
import { importFileReducer } from './importFile/importFileSlice';
import { issueReducer } from './issue/issueSlice';
import { kpiReducer } from './kpi';
import { labelReducer } from './label';
import { loadingReducer } from './loading';
import { modalReducer } from './modal';
import { newsReducer } from './news';
import { organizationReducer } from './organization';
import { projectReducer } from './project';
import { reviewReducer } from './review';
import { salaryReducer } from './salary';
import { shiftReducer } from './shift';
import { teamReducer } from './team';
import { timekeepingReducer } from './timekeeping';
import { userReducer } from './user';

const mainReducer = combineReducers({
  app: appReducer,
  loading: loadingReducer,
  modal: modalReducer,
  project: projectReducer,
  user: userReducer,
  timekeeping: timekeepingReducer,
  shift: shiftReducer,
  issue: issueReducer,
  team: teamReducer,
  document: documentReducer,
  label: labelReducer,
  employee: employeeReducer,
  organization: organizationReducer,
  importFile: importFileReducer,
  accountingInvoice: accountingInvoiceReducer,
  kpi: kpiReducer,
  review: reviewReducer,
  group: GroupReducer,
  news: newsReducer,
  salary: salaryReducer
});

const rootReducers = (state: any, action: any) => {
  // reset store if logout
  if (action.type === 'app/logout') {
    state = {
      app: {
        language: state.app.language,
      },
    };
  }

  return mainReducer(state, action);
};

export default rootReducers;
