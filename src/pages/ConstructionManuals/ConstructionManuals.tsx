import { getEnvVars } from "@/environment";

const { apiUrl } = getEnvVars();

export const ConstructionManuals = () => {
  return (
    <iframe
      src={`${apiUrl}/Projects/Images/36da97bf-aade-44a4-a85e-a18adc98555e.html`}
      title="Construction manuals"
      style={{ border: 0, width: '100%', height: 'calc(100% - 6px)', padding: 10 }}
    ></iframe>
  );
};
