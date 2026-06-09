import React, { useEffect } from 'react';

import { App, ConfigProvider, ThemeConfig, theme as antdTheme } from 'antd';
import enUS from 'antd/locale/en_US';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import i18next from 'i18next';
import moment from 'moment';
import 'moment/locale/vi';

import { colors } from '@/common/colors';
import { getLanguage } from '@/store/app';
import { useAppSelector } from '@/store/hooks';

export const theme: ThemeConfig = {
  ...antdTheme.defaultConfig,
  token: {
    colorPrimary: colors.primary,
    // borderRadius: 20,
  },
  algorithm: antdTheme.defaultAlgorithm,
  components: {
    Button: {
      colorPrimary: colors.primary,
      algorithm: true, // Enable algorithm
      borderRadius: 6,
    },
    Input: {
      colorPrimary: colors.primary,
      algorithm: true, // Enable algorithm
    },
    Checkbox: {
      colorPrimary: colors.primary,
      algorithm: true, // Enable algorithm
    },
    Layout: {
      siderBg: colors.sider.bg,
      headerBg: colors.header.bg,
      algorithm: true,
    },
    Menu: {
      itemSelectedColor: colors.sider.menu.itemSelected,
    },
    Table: {
      headerBg: colors.table.headerBg.gray,
    }
  },
};

interface ThemeProps {
  children: React.ReactNode;
}

export default function ThemeCustomization({ children }: ThemeProps) {
  const language = useAppSelector(getLanguage());

  useEffect(() => {
    i18next.changeLanguage(language);
    moment.locale(language);
    dayjs.locale(language);
  }, [language]);

  const getLocale = () => {
    if (language === 'vi') {
      return viVN;
    }
    return enUS;
  }

  return (
    <ConfigProvider theme={theme} locale={getLocale()}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
