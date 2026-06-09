/* eslint-disable import/order */
import { useEffect, useState } from 'react';

// import { CKEditor } from '@ckeditor/ckeditor5-react';
import { DeleteOutlined } from '@ant-design/icons';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import type { UploadFile } from 'antd';
import { Button, Col, DatePicker, Flex, Form, Input, notification, Row, Select, Typography, Upload } from 'antd';
// import { ClassicEditor } from 'ckeditor5';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ClassicEditor from '@/common/ckeditor';
import { eNewsCategoryCode, NewsService } from '@/services/NewsService';
import { getAuthenticated, getCurrentCompany, getCurrentUser } from '@/store/app';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { newsActions } from '@/store/news';
import { projectActions } from '@/store/project';
import Utils from '@/utils';
import styles from '../ManagerNews.module.css';

interface IManagerNews {
  test?: string
}

interface CustomUploadFile extends UploadFile {
  drawingId: string;
}


const EditNews = ({ test }: IManagerNews) => {
  const { t } = useTranslation('shift');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAppSelector(getAuthenticated());
  const company = useAppSelector(getCurrentCompany());
  const user = useAppSelector(getCurrentUser());
  const [form] = Form.useForm();
  const [newsBody, setNewsBody] = useState('');
  const [fileList, setFileList] = useState<CustomUploadFile[]>([]);
  const [removeFileList, setRemoveFileList] = useState<string[]>([]);
  const currentNews = useAppSelector(state => state.news.currentNews);
  const [title, setTitle] = useState<string>('');
  const newsId = Utils.ParseNumber(searchParams.get('id')); // Lấy giá trị của tham số 'id'
  let categoryCode = searchParams.get('categoryCode');
  const projectList = useAppSelector(state => state.project.projectList);
  const [selectedNewsGroup, setSelectedNewsGroup] = useState<string | undefined>(currentNews?.newsGroup);
  const listNews = useAppSelector(state => state.news.listNews);
  useEffect(() => {
    if (company && newsId > 0) {
      dispatch(newsActions.getNewsById({ newsId, companyId: company.id }));
    }
    if (newsId > 0) {
      setTitle('Chỉnh sửa tin tức');
    } else {
      if (!categoryCode) categoryCode = eNewsCategoryCode.BANGTIN_TINTUC;
      dispatch(newsActions.setCurrentNews(NewsService.generateNewsRecord(categoryCode)));
      setTitle('Thêm mới tin tức');
    }
  }, [newsId, company]);
  useEffect(() => {
    if (company && company.id) {
      dispatch(projectActions.getProjectsByCompanyIdRequest(company.id));
      dispatch(newsActions.getListNews({ companyId: company.id | 1, type: 1 }));
    }
    // eslint-disable-next-line
  }, [company]);
  useEffect(() => {
    if (currentNews && projectList.length) {
      setNewsBody(currentNews.htmlContent);
      if (currentNews.attachmentLinkReadDTOs?.length > 0) {
        const initialFileList = currentNews.attachmentLinkReadDTOs.map((attachment: any, index: number) => ({
          uid: `${index}`,
          name: attachment.fileName,
          url: NewsService.getImageUrl(attachment.drawingId, company.id), // attachment.imageUrl || '', // `${apiUrl}/Document/downloadFile/${attachment.drawingId}?companyId=${company.id}`, //lấy trực tiếp link apiUrl
          drawingId: attachment.drawingId,
        }));
        const list = initialFileList.filter(x => removeFileList.findIndex(y => y === x.drawingId) === -1)
        if (list?.length > 1) {
          const removeList = [...removeFileList]
          list.forEach((value, index) => {
            if (index > 0) {
              removeList.push(value.drawingId)
            }
          });
          setRemoveFileList(removeList);
          setFileList([list[0]] as CustomUploadFile[]);
        } else setFileList(list as CustomUploadFile[]);
      }
      else setFileList([]);
      const selectedProject = projectList.find(p => p.id === currentNews.projectId);
      form.setFieldsValue({
        ...currentNews,
        createDatejs: Utils.convertISOStringToDayjs(currentNews.createDate),
        project: selectedProject
          ? {
            label: selectedProject.name,
            value: JSON.stringify({
              projectId: selectedProject.id,
              projectCode: selectedProject.code
            })
          }
          : undefined,
      });
      setSelectedNewsGroup(currentNews.newsGroup);
      setNewsBody(currentNews.htmlContent || '');
    }
  }, [currentNews, projectList]);

  const handleRemoveFile = (file: UploadFile) => {
    const customFile = file as CustomUploadFile;
    setRemoveFileList([...removeFileList, customFile.drawingId]);
    setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));
  };
  const onSaveNews = () => {
    if (currentNews?.published === 2) {
      notification.warning({
        message: 'Không thể lưu',
        description: 'Không thể lưu tin tức đã xuất bản',
      });
      return; // dừng lại không thực hiện lưu
    }

    form.validateFields()
      .then((values) => {
        try {
          onFinish(values, -1);
        } catch (err) {
          console.error('Error in onFinish:', err);
        }
      });
  };
  const onPublishNews = (status: number) => {
    form.validateFields()
      .then((values) => {
        onFinish(values, status === 2 ? 1 : 2);
      })
      .catch((errorInfo) => {
        console.error('Validation failed:', errorInfo);
      });
  }

  const onFinish = (values: any, status: number) => {
    if (!currentNews) return;
    const newValues = { ...values, htmlContent: newsBody, published: 0, createDate: Utils.convertISODateToLocalTime(values.createDatejs) };
    let parsedValue: { projectCode?: string; projectId?: number } = {projectCode: currentNews.projectCode, projectId: currentNews.projectId};
    try {
      parsedValue = JSON.parse(newValues.project || '{}');
    } catch (err) {
      console.error('Invalid JSON in project:', newValues.project);
    }
    const news = {
      subject: newValues.title,
      companyId: Number(company.id),
      categoryCode: newValues.newsGroup,
      projectCode: parsedValue ? parsedValue.projectCode : currentNews.projectCode || '',
      projectId: parsedValue ? parsedValue.projectId : currentNews.projectId || 0,
      content: newValues.htmlContent,
      createdDate: newValues.createDate,
      description: newValues.description,
      toIdList: 'user1', // Replace with actual ID list
      status: status === -1 ? currentNews.published : status,
      type: 1,
      id: currentNews.id,
    };
    const formData = new FormData();
    fileList?.length && fileList.forEach((file: any) => {
      if (file.originFileObj) {
        formData.append('files', file.originFileObj);
      }
    });
    if (currentNews.id === 0) { // add new
      dispatch(newsActions.addNews({ news, dataImage: formData }));
    } else { // edit
      if (removeFileList?.length > 0) {
        dispatch(newsActions.deleteFilesRequest({ id: newsId, drawingIds: removeFileList }));
      }
      dispatch(newsActions.editNews({ news, id: news.id, dataImage: formData, ispublish: status !== -1 }));
    }
    setRemoveFileList([]);
    // navigate('/manager-news', { state: { categoryCode: currentNews?.newsGroup } });
  };
  const handleUploadChange = (info: any) => {
    const { fileList } = info;
    if (fileList.length > 1) {
      const removeList = [...removeFileList]
      for (let i = 0; i < fileList.length - 1; i += 1) {
        if (fileList[i].drawingId) removeList.push(fileList[i].drawingId);
      }
      setRemoveFileList(removeList);
      setFileList([fileList[fileList.length - 1]]);
    }
    else setFileList(fileList);
  };

  const getPreviewURL = (fileView?: any) => {
    if (fileView) {
      if (fileView.url) return fileView.url; // URL từ server (nếu có)
      return fileView.originFileObj ? URL.createObjectURL(fileView.originFileObj) : '';  // URL tạm thời
    }
    if (fileList.length > 0) {
      const file = fileList[0];
      if (file.url) return file.url; // URL từ server (nếu có)
      return file.originFileObj ? URL.createObjectURL(file.originFileObj) : '';  // URL tạm thời
    }
    return '';
  };
  const getUsedProjectCodes = (newsList: any[]) => {
    return newsList
      .filter(news => news.projectId)
      .map(news => news.projectId);
  };

  return (
    <Flex vertical style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className={styles.functionContainer}>
        <Row align="stretch" style={{ flex: 1, padding: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            {/* padding: top right bottom left; */}
            <Button onClick={() => { navigate('/manager-news', { state: { categoryCode: currentNews?.newsGroup } }) }}
              type="link" block
              style={{ width: 60, height: 10, margin: 0, padding: '0 0 0 5px', justifyContent: 'left' }}>
              &#65513; Quay lại
            </Button>
            <Typography.Title style={{ margin: 0, padding: '5px 0 0 5px' }} level={4}>
              {title}
            </Typography.Title>
          </div>
          <div style={{ alignSelf: 'end' }}>
            {currentNews?.id && currentNews?.id > 0 ? (<Button style={{ marginLeft: 10 }} type="primary" onClick={() => onPublishNews(currentNews?.published || 1)}>
              {currentNews?.published === 2 ? 'Ngừng xuất bản' : 'Xuất bản'}
            </Button>) : <></>}
            <Button style={{ marginLeft: 10 }} type="primary" onClick={onSaveNews}>
              {'Lưu'}
            </Button>
          </div>
        </Row>
      </div>
      <Form
        initialValues={{
          ...currentNews ?? {},
          createDatejs: Utils.convertISOStringToDayjs(currentNews?.createDate),
          project: {
            label: projectList.find(p => p.id === currentNews?.projectId)?.name || '',
            value: JSON.stringify({ projectId: currentNews?.projectId, projectCode: currentNews?.projectCode })
          }
        }}
        form={form}
        layout='vertical'
        autoComplete='off'
        style={{ padding: 10 }}
      // onFinish={onFinish}
      >
        <div className='w-100 border-bottom rounded-2 bg-white p-3 shadow-sm mb-2'>
          <Form.Item
            name='imageUrl'
            label='Photo'
          >
            <Upload.Dragger
              name="file"
              listType="picture"
              accept=".jpg,.jpeg,.png"
              beforeUpload={() => false}
              fileList={[...fileList]}
              // maxCount={1}
              onChange={handleUploadChange}
              onRemove={handleRemoveFile}
              itemRender={(originNode, file, fileList, actions) => (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 10 }}>
                  <img src={getPreviewURL(file)}
                    alt="Preview"
                    style={{ width: '50px', height: '50px', objectFit: 'cover', paddingRight: 10 }}
                  />
                  <span style={{ color: file.url && '#096798' }}>{file.name}</span>
                  <span style={{ flex: 1 }}></span>
                  <DeleteOutlined
                    style={{ color: '#ff0000' }}
                    onClick={() => actions.remove()}
                  />
                </div>
              )}
            // showUploadList={false} // Ẩn danh sách mặc định của Ant Design
            >
              {fileList.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                  <div style={{ marginLeft: 16 }}>
                    <img
                      src={getPreviewURL()}
                      alt="Preview"
                      style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: 8 }}
                    />
                  </div>

                </div>
              ) : (<p className="ant-upload-text">Chọn từ thư mục hoặc kéo thả tệp định dạng JPEG, PNG</p>)
              }
            </Upload.Dragger>
          </Form.Item>
          <Form.Item
            label={'Nhóm tin'}
            name='newsGroup'
            rules={[{ required: true, message: 'vui lòng chọn nhóm tin' }]}
          >
            <Select options={NewsService.groupOption} onChange={(value) => setSelectedNewsGroup(value)} />
          </Form.Item>
          {(currentNews?.newsGroup === eNewsCategoryCode.BANGTIN_CONGTRINH || selectedNewsGroup === eNewsCategoryCode.BANGTIN_CONGTRINH) && (
            <Form.Item
              label="Dự án"
              name="project"
              rules={[{ required: true, message: 'Vui lòng chọn dự án' }]}
            >
              <Select
                placeholder="Chọn dự án"          
                options={projectList
                  ?.filter(p => {
                    // Bỏ qua dự án hiện tại đang edit (nếu có)
                    if (currentNews?.projectId === p.id) {
                      return true;
                    }
                    // Lọc bỏ các dự án đã được sử dụng trong tin tức khác
                    const usedProjectCodes = getUsedProjectCodes(listNews);
                    return !usedProjectCodes.includes(p.id);
                  })
                  .map(p => ({
                    label: p.name,
                    value: JSON.stringify({ projectId: p.id, projectCode: p.code })
                  }))}
              />
            </Form.Item>
          )}
          <Row gutter={[10, 10]}>
            <Col span={24} md={12}>
              <Form.Item
                label={
                  <div>
                    <span>{'Tiêu đề'}</span>
                  </div>
                }
                name='title'
                rules={[
                  { required: true, message: 'Vui lòng nhập tên tiêu đề' },
                  {
                    max: 500,
                    min: 0,
                    message: t('StringRange', {
                      ns: 'common',
                      range1: 0,
                      range2: 500,
                    }),
                  },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={24} md={12}>
              <Form.Item
                label='Ngày tạo'
                name='createDatejs'
                style={{ width: '100%' }}
              >
                <DatePicker
                  className='w-250'
                  allowClear={false}
                  format={Utils.dateFormat}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={
              <div>
                <span>{'Mô tả'}</span>
              </div>
            }
            name='description'
            rules={[
              {
                max: 2000,
                min: 0,
                message: t('StringRange', {
                  ns: 'common',
                  range1: 0,
                  range2: 2000,
                }),
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
          {/* <div onClick={handleAddIframe}>Add PDF Iframe</div> */}
          <div>
            <Form.Item
              label={'Nội dung'}
              name={'htmlContent'}
              rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              required
            >
              <CKEditor
                editor={ClassicEditor}
                data={newsBody}
                config={{
                }}
                onReady={(editor: any) => {
                  if (editor.setCustomParam) {
                    editor.setCustomParam({ auth, company, user, itemId: 124 });
                  }
                  if (currentNews)
                    setNewsBody(currentNews?.htmlContent);
                }}
                onChange={(e, editor) => {
                  const data = editor.getData();
                  setNewsBody(data);
                  form.setFieldsValue({ htmlContent: data })
                }}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Flex>
    // {
    //   showModal && (<Modal open={showModal} title="" onCancel={handleCloseModal} footer={null}>

    //   </Modal>)
    // }


  );
};

export default EditNews;
