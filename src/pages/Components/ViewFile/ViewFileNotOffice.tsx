import { memo, useEffect, useRef, useState } from "react";

import { Modal, Button } from "antd";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import OnlyOfficeViewer from "./OnlyofficeViewer";
import { useAppSelector } from "@/store/hooks";
import { getDataFileView, issueActions } from "@/store/issue";
import { getSelectedProject } from "@/store/project";

export const ViewFileNotOffice = ({  previewDataNotoffice, setPreviewDataNotOffice }: any) => {
  const selectedProject = useAppSelector(getSelectedProject());
  const dataFileView = useAppSelector(getDataFileView());
  const dispatch = useDispatch();
  const [viewFrame, setViewFrame] = useState({ width: '70vw', height: '70vh' });
  // [#20755][hao_lt][08/11/2024]_View file
  const { fileId, fileName, companyId } = useParams();
  // [24/12/2024] #21192 - bật màn hình OnlyOffice sang một trang mới cho các màn hình tài liệu
  useEffect(()=> {
    if (!dataFileView) {
      dispatch(issueActions.downloadFileAttachmentOfIssue({ id: fileId, fileName: fileName, isView: true }));
    }
  },[fileName])

  useEffect(() => {
    if (dataFileView?.url) {
      const img = new Image();
      img.src = dataFileView.url;
      img.onload = () => {
        setViewFrame({ width: `${img.width + 100}px`, height: `${img.height + 100}px` });
      };
      img.onerror = () => {
        console.error("Failed to load image dimensions");
      };
    }
  }, [selectedProject, dataFileView, fileName ]);


  return (
    <div style={{height: '100vh'}}>
      {dataFileView && dataFileView?.url ? (
         <img
             src={dataFileView.url}
             alt="File Viewer"
             style={{
               maxWidth: '100%',
               maxHeight: '100%',
               display: 'block',
               margin: '0 auto'
             }}
           />
       ) : null}
    </div>
  );
};
