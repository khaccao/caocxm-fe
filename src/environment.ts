const defaultIssuer = 'https://sit.cxm.hicas.vn';

interface EnvVars {
  dev: EnvVar;
  prod: EnvVar;
  local: EnvVar;
}

interface EnvVar {
  identityUrl: string;
  apiUrl: string;
  checkInUrl: string;
  accountingInvoiceURL: string;
  accountinginvoiceReportURL: string;
  companyId: number;
  oAuthConfig: {
    issuer: string;
    clientId: string;
    scope: string;
    clientSecret?: string;
  };
  localization: {
    defaultResourceName: string;
  };
}

const sharedConfig = {
  accountingInvoiceURL: 'https://nvh-api.dev.nhiha.com',
  accountinginvoiceReportURL: 'https://nvh.report-api.nhiha.com',
  companyId: 3,
  oAuthConfig: {
    issuer: defaultIssuer,
    clientId: 'CXM',
    scope: 'offline_access API',
    clientSecret: 'ConstruxivViewersecret',
  },
  localization: {
    defaultResourceName: 'hicas',
  },
};

const ENV: EnvVars = {
  dev: {
    ...sharedConfig,
    identityUrl: 'https://sit.cxm.hicas.vn',
    apiUrl: 'https://sit.cxm.hicas.vn',
    checkInUrl: 'https://sit.recognition.tingconnect.com',
  },
  local: {
    ...sharedConfig,
    identityUrl: '/identity',
    apiUrl: '/cxm',
    checkInUrl: '/checkin',
  },
  prod: {
    ...sharedConfig,
    identityUrl: 'https://sit.cxm.hicas.vn',
    apiUrl: 'https://sit.cxm.hicas.vn',
    checkInUrl: 'https://sit.recognition.tingconnect.com',
  },
};

const applyEnvOverrides = (env: EnvVar): EnvVar => ({
  ...env,
  identityUrl: import.meta.env.VITE_IDENTITY_URL || env.identityUrl,
  apiUrl: import.meta.env.VITE_API_URL || env.apiUrl,
  checkInUrl: import.meta.env.VITE_CHECKIN_URL || env.checkInUrl,
  accountingInvoiceURL: import.meta.env.VITE_ACCOUNTING_INVOICE_URL || env.accountingInvoiceURL,
  accountinginvoiceReportURL:
    import.meta.env.VITE_ACCOUNTING_INVOICE_REPORT_URL || env.accountinginvoiceReportURL,
  companyId: Number(import.meta.env.VITE_COMPANY_ID || env.companyId),
  oAuthConfig: {
    ...env.oAuthConfig,
    issuer: import.meta.env.VITE_OAUTH_ISSUER || env.oAuthConfig.issuer,
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || env.oAuthConfig.clientId,
    scope: import.meta.env.VITE_OAUTH_SCOPE || env.oAuthConfig.scope,
    clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || env.oAuthConfig.clientSecret,
  },
});

export const maKhoTongVT = 'TONGTEST';
export const maKhoTongMM = 'TONGTEST_CCDC';

export const getEnvVars = () => {
  const envName = import.meta.env.VITE_CXM_ENV;
  const currentEnv = envName === 'local' ? ENV.local : import.meta.env.DEV ? ENV.dev : ENV.prod;

  return applyEnvOverrides(currentEnv);
};
