import { useEffect, useRef, useState } from 'react';

import { CloudUploadOutlined, PaperClipOutlined, DeleteOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { SelectProps, UploadFile, UploadProps } from 'antd';
import { Modal, Form, Input, DatePicker, Select, Row, Typography, Upload, Button, Space, Tooltip, Col } from 'antd';
import dayjs from 'dayjs';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import Draggable from 'react-draggable';
import { useTranslation } from 'react-i18next';

import { colors } from '@/common/colors';
import { AttributeDimDTO, CreateUpdateIssueModalName, FormatDateAPI, MilestoneLabel, NatureOfWorks, WorkingProgress, eAttribute, eNatureOfTheJob, eTrackerCode, formatDateDisplay, sMilestone } from '@/common/define';
import { codeStatus, IssuesResponse, Status, StatusHelperControl } from '@/services/IssueService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIssueProgressList, getIssueStatusList, getSelectedIssue, getTagsVersion, issueActions, getEditIssuePublic, getTracker, getAttributes, getTargets, getFileAttachmenForIssue, getAllMembersToGroup, getCategorys } from '@/store/issue';
import { getModalVisible, hideModal } from '@/store/modal';
import { getProjectMembers, getSelectedProject } from '@/store/project';
import Utils from '@/utils';

export const CreateUpdateIssue = ({tagVersionId, isCreate}: any) => {
  const { t } = useTranslation('bidding');

  const [form] = Form.useForm();

  const dispatch = useAppDispatch();

  const isModalOpen = useAppSelector(getModalVisible(CreateUpdateIssueModalName));
  const selectedIssue = useAppSelector(getSelectedIssue());
  const selectedProject = useAppSelector(getSelectedProject());
  const projectMembers = useAppSelector(getProjectMembers());
  const issueStatusList = useAppSelector(getIssueStatusList());
  const issueProgressList = useAppSelector(getIssueProgressList());
  const isEditPublic = useAppSelector(getEditIssuePublic());
  const tags = useAppSelector(getTagsVersion());
  const trackers = useAppSelector(getTracker());
  const attributes = useAppSelector(getAttributes());
  const targets = useAppSelector(getTargets());
  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 });
  const draggleRef = useRef<HTMLDivElement>(null);
  const [formFileData, setFormFileData] = useState<any>(null);
  const getListFileOfIssue = useAppSelector(getFileAttachmenForIssue())
  const getAllListMemberToGroup = useAppSelector(getAllMembersToGroup())
  const [listFileRemove, setListFileRemove] = useState<any[]>([]);
  const [team, setTeams] = useState<any[]>([]);
  const categorys = useAppSelector(getCategorys());
  const [teamsData, setTeamsData] = useState<any[]>([]);

  const issueProgressListTemp = [
    {
      key: sMilestone.Bid,
      id: Utils.getMileStoneId(sMilestone.Bid, tags),
      name: MilestoneLabel.Bid,
    },
    {
      key: sMilestone.ContractBiddingKPIs,
      id: Utils.getMileStoneId(sMilestone.ContractBiddingKPIs, tags),
      name: MilestoneLabel.ContractBiddingKPIs,
    },
    {
      key: sMilestone.PrepareForConstruction,
      id: Utils.getMileStoneId(sMilestone.PrepareForConstruction, tags),
      name: MilestoneLabel.PrepareForConstruction,
    },
    {
      key: sMilestone.SetupInitialProgress,
      id: Utils.getMileStoneId(sMilestone.SetupInitialProgress, tags),
      name: MilestoneLabel.SetupInitialProgress,
    }
  ];

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const handleUploadChange = (info: any) => {
    const { status, fileList } = info;
      const formData = new FormData();
      fileList.forEach((file: any) => {
        if (file || file.originFileObj) {
          formData.append('files', file.originFileObj || file as File);
        }
      });
      setFormFileData(formData);
  };


  const handleChange = (value: any) => {
    setTeams([...value])
  }
  const uploadProps: UploadProps = {
    beforeUpload: (file, files) => {
      const _fileList = fileList || [];
      setFileList([..._fileList, ...files]);
      return false;
    },
    fileList,
    name: 'file',
    multiple: true,
    onChange: handleUploadChange,
    showUploadList: false,
  };

  const removefile = (file: UploadFile<any> | any) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    setListFileRemove((prevList: any) => [...prevList, {drawingId: file?.drawingId, id: file?.id } ]);
  };

  const saveFile = (file:any) => {
    dispatch(issueActions.downloadFileAttachmentOfIssue({id: file.drawingId, fileName:file.fileName }));
  }

  useEffect(()=> {
    setFileList(getListFileOfIssue);
  },[getListFileOfIssue])

  useEffect(()=> {
    setFileList([])
  }, [isEditPublic])

  const dataTeams: SelectProps['options'] = getAllListMemberToGroup?.results?.map((mem: any) => {
    return {value: mem.id, label:`${mem.lastName} ${mem.middleName} ${mem.firstName}`}
  })

  const handleSaveIssue = (values: any) => {
    if (selectedProject && getAllListMemberToGroup) {
      const selectedAssign = getAllListMemberToGroup.results.filter((mem: any) => team.includes(mem.id));
      let createContactslist = null;
        createContactslist = selectedAssign?.map((mem: any) => ({
          fullname: `${mem.lastName} ${mem.middleName} ${mem.firstName}`,
          phone: mem.contactDetail?.mobile ? mem?.contactDetail?.mobile : "",
          email: mem.contactDetail?.workEmail ? mem?.contactDetail?.workEmail : "",
          userId: mem.userId ? mem?.userId : '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          employeeId: mem?.contactDetail?.employeeId,
          employeeCode: mem?.employeeCode ? mem.employeeCode : "",
          titleType: 0
        })) || [];
      let trackerId = 20;
      if (trackers && trackers.length) {
        const tracker = trackers?.find((t)=> t.code === eTrackerCode.CongViecHangTuan);
        if (tracker && tracker.id !== null && tracker.id !== undefined) trackerId = tracker.id;
      }
      const selectedTag = issueProgressList.find(tag => tag.id === values.tagVersionId);
      let inputData: any = {
        projectId: selectedProject.id,
        categoryId: tagVersionId === Utils.getMileStoneId(sMilestone.Bid, tags) ? (values.category ? values.category : 0) : 0,
        tagVersionId: tagVersionId,
        subject: values.name || values.subject,
        description: values.description,
        parentId: +values.parentId ? +values.parentId : null,
        tagVersionName: selectedTag ? selectedTag.name : '',
        plannedStartDate: values?.plannedStartDate ? values.plannedStartDate.format(FormatDateAPI) : undefined,
        plannedEndDate: values?.plannedEndDate ? values.plannedEndDate.format(FormatDateAPI) : undefined,
        actualStartDate: values?.actualStartDate ? values.actualStartDate.format(FormatDateAPI) : undefined,
        actualEndDate: values?.actualEndDate ? values.actualEndDate.format(FormatDateAPI) : undefined,
        type: values.type,
        startDate: values.startDate ? values.startDate.format(FormatDateAPI) : undefined,
        dueDate: values.endDate ? values.endDate.format(FormatDateAPI) : undefined,
        status: Utils.convertStatus(+values.status),
        progress: values.progress,
        notes: values.notes,
        createContacts: createContactslist?.length > 0 ? createContactslist : [],
        trackerId,
      }
      const _attributes = selectedIssue ? Utils.createAttributes(selectedIssue.attributes, attributes) : [];
      if (inputData && inputData.status === Utils.convertStatus(Status.Done)) {
        inputData = {...inputData, progress: 100}
      }
      if (selectedIssue && isEditPublic) {
        const updatedIssue = {
          ...selectedIssue,
          ...inputData,
        };
        inputData.issueAttributes = _attributes;
        dispatch(issueActions.updateIssueRequest({ 
          issueId: selectedIssue.id, 
          issue: updatedIssue, 
          tagVersionId: Utils.getMileStoneId(sMilestone.Bid, tags),
          typeUpdate: sMilestone.Bid,
        }));
        if (inputData && +inputData.progress === 100 && +inputData.progress !== selectedIssue.progress) {
          dispatch(issueActions.updateStatusIssue({id: selectedIssue?.id, issue: inputData , projectId: inputData.projectId, code: codeStatus.Done}))
        }
        const fileChanges = fileList.filter((file: any) => !file.hasOwnProperty('issueId'))
        if (fileList && fileList.length > 0 && fileChanges.length > 0) {
          dispatch(issueActions.upLoadFileAttachment({issueId: selectedIssue.id, files: formFileData}))
        }
        if (listFileRemove && listFileRemove.length > 0) {
          for (let i = 0; i < listFileRemove.length; i++) {
            const element = listFileRemove[i];
            dispatch(issueActions.removeFileOfIssue({issueId: selectedIssue?.id, fileId: element?.id, drawingId: [element?.drawingId]}))
          }
        }
        dispatch(hideModal({ key: CreateUpdateIssueModalName }));
        return;
      }
      if (inputData && +inputData.progress === 100) {
        inputData = {...inputData, status: Utils.convertStatus(Status.Done)}
      }
      inputData.issueAttributes = _attributes;
      dispatch(issueActions.createIssueRequest({
        issue: inputData,
        tagVersionId: Utils.getMileStoneId(sMilestone.Bid, tags),
        typeUpdate: sMilestone.Bid,
        files: formFileData,
      }));
      dispatch(hideModal({ key: CreateUpdateIssueModalName }));
    }
  };

  const confirmRemoveIssue = (issue: IssuesResponse) => {
    Modal.confirm({
      title: t('Notification'),
      content: (
        <div
          dangerouslySetInnerHTML={{
            __html: t('Confirm remove', {
              name: `<strong>"${issue.id}"</strong>`,
            }),
          }}
        />
      ),
      closable: true,
      maskClosable: true,
      onOk: close => {
        handleRemoveIssue(issue.id);
        close();
      },

    });
  };

  const handleRemoveIssue = (issueId: number) => {
    if(selectedProject) {
      dispatch(issueActions.removeIssueRequest({ issueId, projectId: selectedProject.id }));
    }
  };

  const handleCancel = () => {
    dispatch(issueActions.setSelectedIssue(undefined));
    dispatch(hideModal({ key: 'CreateUpdateIssueModal' }));
  };

  const handleOk = () => form.submit();

  const issueStatusListTest = StatusHelperControl.statusOptions 

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const getStatus = () => {
    if (selectedIssue && +selectedIssue.progress === 100) return Utils.getStatus(sMilestone.Complete);
    return isEditPublic && (!selectedIssue?.status || selectedIssue?.status !== null) ? selectedIssue?.status! : null;
  };
  // Hàm để loại bỏ dấu tiếng Việt
  const removeAccents = (str: string): string => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  useEffect(()=> {
    if (selectedIssue) {
      const lstId = selectedIssue?.issueContacts?.map((item: any) => (item.contact.employeeId))
      const dataAssign = getAllListMemberToGroup?.results?.filter((mem: any)=>
        lstId.includes(mem.id)
      )
      setTeamsData(dataAssign)
      form.setFieldsValue({
        assignee: dataAssign?.map((item: any) => ({value: item.id, label: item.fullname, key: item.id}))
      });
      if (selectedIssue.issueContacts) {
        setTeams(lstId);
      }
    } else {
      form.resetFields();
    }
  }, [form, selectedIssue])

  return (
    <Modal
      title={
        <div
        style={{
          width: '100%',
          cursor: 'move',
        }}
        onMouseOver={() => {
          if (disabled) {
            setDisabled(false);
          }
        }}
        onMouseOut={() => {
          setDisabled(true);
        }}
        onFocus={() => {}}
        onBlur={() => {}}
        >
          {(selectedIssue && isEditPublic) ? t('Edit') : t('New')}
        </div>
      }
      className="custom-modal-scrollbar"
      centered
      open={isModalOpen}
      style={{ width: '580px', ...{ important: 'true' },}}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={t('Save')}
      footer={(_, { OkBtn, CancelBtn }) =>
        selectedIssue ? (
          <Row style={{ margin: 0 }} align="stretch">
          <Space style={{ flex: 1 }}>
            <Button key="remove" type="primary" danger onClick={() => confirmRemoveIssue(selectedIssue)} style={{display: 'none'}}>
              {t('Remove')}
            </Button>
          </Space>
          <Space>
            <CancelBtn />
            <OkBtn />
          </Space>
        </Row>
        ) : (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )
      }
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event: any, uiData: any) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...selectedIssue,
          subject: (selectedIssue && isEditPublic) ? selectedIssue?.subject : '',
          tagVersionId: (isEditPublic && selectedIssue?.tagVersionId) ? selectedIssue?.tagVersionId :  tagVersionId,
          startDate:  (isEditPublic && selectedIssue?.startDate) ? dayjs(selectedIssue.startDate) : null,
          dueDate:  (isEditPublic && selectedIssue?.dueDate) ? dayjs(selectedIssue.dueDate) : null,
          plannedStartDate: (isEditPublic &&  selectedIssue?.plannedStartDate) ? dayjs(selectedIssue.plannedStartDate) : null,
          plannedEndDate: (isEditPublic && selectedIssue?.plannedEndDate) ? dayjs(selectedIssue.plannedEndDate) : null,
          actualStartDate: (isEditPublic && selectedIssue?.actualStartDate) ? dayjs(selectedIssue.actualStartDate) : null,
          actualEndDate: (isEditPublic && selectedIssue?.actualEndDate) ? dayjs(selectedIssue.actualEndDate) : null,
          status: getStatus(),
          type: (isEditPublic && selectedIssue?.type) ? selectedIssue?.type : eNatureOfTheJob.DailyRepetitiveWork,
          parentId: (isEditPublic && selectedIssue ) ? selectedIssue.parentId : (selectedIssue?.id && !isEditPublic && selectedIssue.id !== selectedIssue.parentId) ? selectedIssue.id : '',
          description: (isEditPublic && selectedIssue?.description) ? selectedIssue.description : '',
          notes: (isEditPublic && selectedIssue?.description) ? selectedIssue.notes : '',
          progress: (selectedIssue && (selectedIssue?.progress !== null || selectedIssue?.progress) && isEditPublic) ? selectedIssue?.progress : 0,
          category: (selectedIssue && (selectedIssue?.categoryId !== null || selectedIssue?.categoryId) && isEditPublic) ? selectedIssue?.categoryId : '',
        }}
        onFinish={handleSaveIssue}
        autoComplete="off"
      >

        <Row gutter={[16, 16]}>
          {
            tagVersionId === Utils.getMileStoneId(sMilestone.Bid, tags) ? (
             <>
              <Col span={24} md={18}>
                <Form.Item
                  label={t('Subject')}
                  name="subject"
                  rules={[{ required: true, message: t('Please input name!') }]}
                >
                  <Input />
                </Form.Item>
              </Col>
                  <Col span={24} md={6}>
                <Form.Item label={t('Parent')} name="parentId">
                  <Input />
                </Form.Item>
              </Col>
                </>
            ) : (
              <Col span={24}>
              <Form.Item
                label={t('Subject')}
                name="subject"
                rules={[{ required: true, message: t('Please input name!') }]}
              >
                <Input />
              </Form.Item>
            </Col>
            )
          }
          <Col span={24}>
            <Form.Item
              label={t('Description')}
              name="description"
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
         
          {/* <Col span={24} md={12}>
            <Form.Item
              label={t('Assignee')}
              name="assignee"
              rules={[{ required: true, message: t('Please input assignee!') }]}
            >
              <Select
                allowClear
                options={getAllListMemberToGroup?.results?.map((x: any) => ({ label: `${x.lastName} ${x.middleName} ${x.firstName} `, value: x.id }))}
                optionFilterProp="label"
              />
            </Form.Item>
          </Col> */}

          <Col span={24} md={12}>
              <Form.Item
                label={t('Assignee')}
                name="assignee"
                // rules={[{ required: true, message: t('Please input assignee!') }]}
              >
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                onChange={handleChange}
                options={dataTeams}
                optionFilterProp="label"
                showSearch={true}
                filterOption={(inputValue, option) =>
                  typeof option?.label === 'string' &&
                  removeAccents(option.label).toLowerCase().includes(removeAccents(inputValue).toLowerCase())
                }
              />
              </Form.Item>
            </Col>

          {
            tagVersionId !== Utils.getMileStoneId(sMilestone.Bid, tags) && (
              <Col span={24} md={12}>
            <Form.Item label={t('Parent')} name="parentId">
              <Input />
            </Form.Item>
          </Col>
            )
          }
         
          <Col span={24} md={12}>
            <Form.Item
              label={t('Phase')}
              name="tagVersionId"
              rules={[{ required: true, message: t('Please input phase!') }]}
            >
             <Select
                  options={issueProgressListTemp.map((status) => ({ label: status.name, value: status.id }) )}
                />
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Form.Item
              label={t('Nature of work')}
              name="type"
              rules={[{ required: true, message: t('Please input Nature of work!') }]}
            >
              <Select options={NatureOfWorks()} />
            </Form.Item>
          </Col>
          {
            tagVersionId === Utils.getMileStoneId(sMilestone.Bid, tags) && (
              <Col span={24} md={12}>
              <Form.Item
                label={t('Status')}
                name="status"
                rules={[{ required: true, message: t('Please input status!') }]}
              >
                <Select options={issueStatusListTest.map(status => ({ label: status.label, value: status.value }))} />
              </Form.Item>
            </Col>
            )
          }
          <Col span={24} md={12}>
            <Form.Item
              label={t('Start date Contract')}
              name="plannedStartDate"
              rules={[{ required: true, message: t('Please input start date!') }]}
            >
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Form.Item
              label={t('End date Contract')}
              name="plannedEndDate"
              rules={[{ required: true, message: t('Please input due date!') }]}
            >
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Form.Item
              label={t('Actual start date')}
              name="actualStartDate"
            >
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
          </Col>
          <Col span={24} md={12}>
            <Form.Item
              label={t('Actual end date')}
              name="actualEndDate"
            >
              <DatePicker style={{ width: '100%' }} format={formatDateDisplay} />
            </Form.Item>
          </Col>
            {
              tagVersionId !== Utils.getMileStoneId(sMilestone.Bid, tags) && (
                <Col span={24} md={12}>
                <Form.Item
                  label={t('Status')}
                  name="status"
                  rules={[{ required: true, message: t('Please input status!') }]}
                >
                  <Select options={issueStatusListTest.map(status => ({ label: status.label, value: status.value }))} />
                </Form.Item>
              </Col>
              )
            }
          <Col span={24} md={12}>
            <Form.Item
              label={t('Progress')}
              name="progress"
              rules={[{ required: true, message: t('Please input progress!') }]}
            >
              <Select options={WorkingProgress.map((w: any) => ({ label: w.label, value : w.value}))} />
            </Form.Item>
          </Col>
          {
            tagVersionId === Utils.getMileStoneId(sMilestone.Bid, tags) && (<Col span={24} md={12}>
              <Form.Item
                label={t('Category')}
                name="category"
                // rules={[{ required: true, message: t('Please input category!') }]}
              >
                <Select options={categorys?.map((c: any) => ({ label: c.name, value : c.id}))} />
              </Form.Item>
            </Col>)
          }
          <Col span={24}>
            <Form.Item label={t('Notes')} name="notes">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item style={{ marginBottom: 0 }}>
          <Row align="stretch" style={{ margin: 0 }}>
            <Typography.Text style={{ flex: 1 }} className="ant-form-item-label">
              {t('Attachments')}
            </Typography.Text>
            <Upload {...uploadProps}>
              <Button type="link" icon={<CloudUploadOutlined />} style={{ padding: 0 }}>
                {t('Click to Upload')}
              </Button>
            </Upload>
          </Row>
          {fileList?.length > 0 && (
            <div style={{ border: '1px solid #D9D9D9', padding: 10, borderRadius: 8 }}>
              {fileList.map((f:any) => (
                <Row key={f.uid ? f.uid : f?.id} style={{ margin: 0 }} className="app-upload-list-item">
                  <Space style={{ flex: 1 }}>
                    <PaperClipOutlined />
                    <span>{f.name ? f.name : f.fileName}</span>
                  </Space>
                  {f.fileName  &&
                  <Tooltip title={t('Lưu file')}>
                    <ArrowDownOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: colors.primary }}
                      onClick={() => saveFile(f)}
                    />
                  </Tooltip>
                    }
                  <div style={{marginLeft: '5px'}}></div>
                  <Tooltip title={t('Remove file')}>
                    <DeleteOutlined
                      role="button"
                      style={{ cursor: 'pointer', color: 'red' }}
                      onClick={() => removefile(f)}
                    />
                  </Tooltip>
                </Row>
              ))}
            </div>
          )}
        </Form.Item>
      </Form>
    </Modal>
  );
};
