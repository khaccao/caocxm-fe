import React from 'react';

import styles from './Filter.module.less';
import { colors } from '@/common/colors';

interface FilterContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const FilterContainer = ({ children, style }: FilterContainerProps) => {
  return (
    <section className={styles.container} style={{ backgroundColor: colors.filter.bg, ...style }}>
      {children}
    </section>
  );
};

export default FilterContainer;
