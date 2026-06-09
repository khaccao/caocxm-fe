import { ReactNode } from 'react';

interface ProjectDescriptionProps {
  label?: string | ReactNode;
  children: ReactNode;
}

const ProjectDescription = ({ label, children }: ProjectDescriptionProps) => {
  return (
    <div style={{ display: 'flex', gap: 5, lineHeight: 1.2 }}>
      {label}
      {children}
    </div>
  );
};

export default ProjectDescription;
