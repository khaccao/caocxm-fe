const apiUrl = `https://sit.cxm.hicas.vn`;

interface EnvVars {
  dev: EnvVar;
  prod: EnvVar;
}

interface EnvVar {
  identityUrl: string;
  apiUrl: string;
  checkInUrl: string,
  accountingInvoiceURL: string,
  accountinginvoiceReportURL : string,
  companyId: number,
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

const ENV: EnvVars = {
  dev: {
    identityUrl: 'https://sit.cxm.hicas.vn',
    apiUrl: 'https://sit.cxm.hicas.vn',
    checkInUrl: 'https://sit.recognition.tingconnect.com',
    accountingInvoiceURL: 'https://nvh-api.dev.nhiha.com',
    accountinginvoiceReportURL: 'https://nvh.report-api.nhiha.com',
    companyId: 3,
    oAuthConfig: {
      issuer: apiUrl,
      clientId: 'CXM',
      scope: 'offline_access API',
      clientSecret: 'ConstruxivViewersecret',
    },
    localization: {
      defaultResourceName: 'hicas',
    },
  },
  prod: {
    identityUrl: 'https://sit.cxm.hicas.vn',
    apiUrl: 'https://sit.cxm.hicas.vn',
    checkInUrl: 'https://sit.recognition.tingconnect.com',
    accountingInvoiceURL: 'https://nvh-api.dev.nhiha.com',
    accountinginvoiceReportURL: 'https://nvh.report-api.nhiha.com',
    companyId: 3,
    oAuthConfig: {
      issuer: apiUrl,
      clientId: 'CXM',
      scope: 'offline_access API',
      clientSecret: 'ConstruxivViewersecret',
    },
    localization: {
      defaultResourceName: 'hicas',
    },
  },
};
export const maKhoTongVT = 'TONGTEST';
export const maKhoTongMM = 'TONGTEST_CCDC';

export const getEnvVars = () => {
  // eslint-disable-next-line no-undef
  return process.env.NODE_ENV === 'development' ? ENV.dev : ENV.prod;
};
