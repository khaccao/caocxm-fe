import { Badge } from 'antd';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';

type statusType = 'bidding' | 'completed' | 'executing';

interface ProjectStatusProps {
  status: statusType;
}

const getInforByStatus = (status: statusType) => {
  return {
    label: `project.status.${status}`,
    bgColor: colors.projects.project.statusBg[status],
  };
};

const ProjectStatus = ({ status }: ProjectStatusProps) => {
  const { t } = useTranslation(['projects']);
  const { label, bgColor } = getInforByStatus(status);
  
  return <Badge count={t(label)} color={bgColor} />;
};

export default ProjectStatus;
