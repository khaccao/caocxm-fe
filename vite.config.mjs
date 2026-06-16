import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const identityAgent = new https.Agent({
  servername: 'sit.cxm.hicas.vn',
  lookup: (_hostname, options, callback) => {
    const cb = typeof options === 'function' ? options : callback;
    if (!cb) return;

    if (typeof options === 'object' && options?.all) {
      cb(null, [{ address: '27.72.57.237', family: 4 }]);
      return;
    }

    cb(null, '27.72.57.237', 4);
  },
  rejectUnauthorized: false,
});

const issueServiceRoutes = [
  'AccountingMapping',
  'AdditionalCost',
  'AdditionAttachmentLink',
  'api/Cxm',
  'api/ImportConfig',
  'api/Issue',
  'api/Pcvm',
  'AssigneeMachineQuota',
  'AssigneeMaterialQuota',
  'AttachmentLink',
  'AttributeDim',
  'BudgetEstimate',
  'CategoryDim',
  'DisciplineDim',
  'EmployeeReport',
  'EmployReportAttribute',
  'FeeTableEmployee',
  'FinanceDocument',
  'issue/Tag',
  'Issue_CheckItems',
  'Issue_CheckItemsTeam',
  'Issue_DailyConsumption',
  'Issue_DailyTarget',
  'Issue_OtherResourceQuota',
  'IssueLaborQuota',
  'IssueMachineQuota',
  'IssueMaterialsQuota',
  'IssueResourceReceipt',
  'IssuesRelationship',
  'IssueTeam',
  'IssueTemplate',
  'KPICriteria',
  'KPIEmployee',
  'LaborDim',
  'MachineryDim',
  'MaterialsDim',
  'OtherResourcesDim',
  'Period',
  'ProjectReport',
  'ProjectTarget',
  'RelationshipDim',
  'SalaryAdvance',
  'SSNameDocument',
  'StructureBaseSet',
  'SubContractor',
  'TargetCategory',
  'TargetDim',
  'TeamMachineAudit',
  'TeamMaterialAudit',
  'TrackerDim',
  'VATInvoice',
];

const issueServiceProxy = Object.fromEntries(
  issueServiceRoutes.map(route => [
    `/cxm/${route}`,
    {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: requestPath => requestPath.replace(/^\/cxm/, ''),
    },
  ]),
);

const localCoreRoutes = [
  'api/Project',
  'api/Employee',
  'api/Team',
  'Project_Employee',
  'Group',
  'EmployeesGroup',
  'Team_Employee',
  'Team_Shift',
];

const localCoreProxy = Object.fromEntries(
  localCoreRoutes.map(route => [
    `/cxm/${route}`,
    {
      target: 'http://localhost:8080',
      changeOrigin: true,
      rewrite: requestPath => requestPath.replace(/^\/cxm/, ''),
    },
  ]),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      src: path.resolve(rootDir, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3020,
    strictPort: true,
    proxy: {
      ...issueServiceProxy,
      ...localCoreProxy,
      '/identity': {
        target: 'https://sit.cxm.hicas.vn',
        changeOrigin: true,
        secure: false,
        agent: identityAgent,
        rewrite: requestPath => requestPath.replace(/^\/identity/, ''),
      },
      '/cxm': {
        target: 'https://sit.cxm.hicas.vn',
        changeOrigin: true,
        secure: false,
        agent: identityAgent,
        rewrite: requestPath => requestPath.replace(/^\/cxm/, ''),
      },
      '/checkin': {
        target: 'http://localhost:44306',
        changeOrigin: true,
        rewrite: requestPath => requestPath.replace(/^\/checkin/, ''),
      },
      '/iservice': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: requestPath => requestPath.replace(/^\/iservice/, ''),
      },
    },
  },
  build: {
    sourcemap: false,
  },
});
