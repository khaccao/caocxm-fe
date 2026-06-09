import { memo, useEffect, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import OnlyOfficeViewer from "./OnlyofficeViewer";
import { getEnvVars } from "@/environment";
import { useAppSelector } from "@/store/hooks";
import { getDataFileView, issueActions } from "@/store/issue";
import { getSelectedProject } from "@/store/project";

const extensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'xlsm', 'csv', 'ppt', 'pptx', 'pps', 'ppsx', 'mdb', 'accdb', 'pst', 'ost', 'one', 'onetoc2'];

const { apiUrl } = getEnvVars();
export const FileUpload = ({ previewDataOffice, isModalVisible, setIsModalVisible }: any) => {
  const [fileData, setFileData] = useState<any>(null);
  const selectedProject = useAppSelector(getSelectedProject());
  const dataFileView = useAppSelector(getDataFileView());
  const [ext, setExt] = useState<string>('');
  const { fileType, fileId, companyId } = useParams();
  // [24/12/2024] #21192 - bật màn hình OnlyOffice sang một trang mới cho các màn hình tài liệu
  useEffect(() => {
    // const extName = previewDataOffice.name.split('.').pop();
    // setExt(extName);
      if (selectedProject) {
        setFileData({
          fileUrl: `${apiUrl}/Document/downloadFile/${fileId}?companyId=${selectedProject.companyId}`,
          fileType: `${fileType}`,
        });
      } else {
        setFileData({
          fileUrl: `${apiUrl}/Document/downloadFile/${fileId}?companyId=${companyId}`,
          fileType: `${fileType}`,
        });
      }
  }, [previewDataOffice, selectedProject, dataFileView]);


  return (
    <div style={{height: '100vh'}}>
      <OnlyOfficeViewer 
        fileUrl={fileData?.fileUrl} 
        fileType={fileData?.fileType} 
       />
    </div>
  );
};
