import React from 'react';

import { getEnvVars } from "@/environment";

const { apiUrl } = getEnvVars();
export const CapabilityProfile = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <embed src={`${apiUrl}/Projects/Images/43196979-5ad3-4cf0-8095-259bd8a5bbe2.pdf`} type="application/pdf"  style={{ width: '100%', height: '99%' }} />
    </div>
  )
}
