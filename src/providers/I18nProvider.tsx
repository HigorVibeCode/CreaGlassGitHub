import React from 'react';
import '../i18n/config';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // i18n is initialized in config.ts
  return <>{children}</>;
};
