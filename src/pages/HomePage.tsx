import React from 'react';

import { Navigate, useLocation } from 'react-router-dom';

export const HomePage = () => {
  const location = useLocation();

  return <Navigate to="/projects" state={{ from: location }} replace />;
};
