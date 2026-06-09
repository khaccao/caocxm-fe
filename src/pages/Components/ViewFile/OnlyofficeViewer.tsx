import { useEffect } from "react";

import { Spin } from "antd";

const OnlyOfficeViewer = ({ fileUrl = "", fileType = "docx", title = "Document", loading }: any) => {
  // [#20755][hao_lt][08/11/2024]_View file
  useEffect(() => {
    if (window.DocsAPI) {
        const config = {
          document: {
            fileType: fileType, // Sử dụng fileType được cung cấp
            title: title ? title : "Uploaded Document",
            url: fileUrl,
          },
          editorConfig: {
            mode: "view", // Thay đổi thành "edit" nếu cần chỉnh sửa
          },
        };
        // Khởi tạo DocEditor
        // [24/12/2024] #21192 - bật màn hình OnlyOffice sang một trang mới cho các màn hình tài liệu
        if (config.document.url !== '' && config.document.fileType !== '') {
          loading = false;
          const docEditor = new window.DocsAPI.DocEditor("onlyoffice-viewer", config);
          // Dọn dẹp khi component unmount
          return () => {
            docEditor.destroyEditor && docEditor.destroyEditor();
          };
        } else {
          loading = true;
        }
      } else {
        console.error("DocsAPI is not available on the window object.");
      }
  }, [fileUrl, fileType]);

  return (
    <>
      {/* // [18/12/2024][#21174][phuong_td] Thêm loading */}
      <div
        style={{
          position: 'absolute',
          display: loading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          height: '86vh',
          width: '80vw',
          background: 'rgba(255,255,255,0)'
        }}
      >
        <Spin size="large" />
      </div>
      <div id="onlyoffice-viewer" style={{ height: '500px' }}></div>;
    </>
  );
};

export default OnlyOfficeViewer;
