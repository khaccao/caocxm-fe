import { combineEpics } from 'redux-observable';

import { accountingInvoiceEpics } from './accountingInvoice';
import { appEpics } from './app';
import { documentEpics } from './documents';
import { employeeEpics } from './employee';
import { groupEpics } from './group/groupEpics';
import { importFileEpics } from './importFile';
import { issueEpics } from './issue';
import { labelEpics } from './label';
import { newsEpics } from './news';
import { projectEpics } from './project';
import { reviewEpics } from './review/reviewEpics';
import { salaryEpics } from './salary';
import { shiftEpics } from './shift';
import { teamEpics } from './team';
import { timekeepingEpics } from './timekeeping';
import { userEpics } from './user';

const rootEpics = combineEpics(
  ...appEpics,
  ...userEpics,
  ...timekeepingEpics,
  ...issueEpics,
  ...shiftEpics,
  ...projectEpics,
  ...employeeEpics,
  ...documentEpics,
  ...labelEpics,
  ...teamEpics,
  ...importFileEpics,
  ...accountingInvoiceEpics,
  ...reviewEpics,
  ...groupEpics,
  ...newsEpics,
  ...salaryEpics
);

export default rootEpics;
