/* eslint-disable import/order */
import React, { useEffect, useState } from 'react';

import { CheckOutlined, CloseOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Form, Input, Modal, Row, Select, Table, Typography } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import ImportGoods from 'src/pages/Project/MainMaterial/components/ImportGoods';

import { eTypeVatTuMayMoc } from '@/common/define';
import { getCapDuyet } from '@/store/accountingInvoice';
import { useAppSelector } from '@/store/hooks';
import styles from './MachineryMaterialsForm.module.css';

const { Option } = Select;
const { Title } = Typography;

interface ProposalType {
  id: string;
  project: string;
  section: string;
  proposer: string;
  requestDate: string;
  status: string;
  approved: string;
  color?: string;
}

interface MachineryMaterialsFormProps {
  proposal: ProposalType;
  type: eTypeVatTuMayMoc
}

const MachineryMaterialsForm: React.FC<MachineryMaterialsFormProps> = ({ proposal }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const capDuyet =  useAppSelector(getCapDuyet()); 
  const dataSource = [
    {
      key: '1',
      code: 'Thep2',
      name: 'Thép 2',
      unit: 'Kg',
      request: 25,
      approver: 'Nam Phạm',
      approved: 25,
      price: '100.000đ/m',
      status: '25',
      nccduocduyet: 'TNHH Đức Thắng',
      note: 'Abcdzy',
      tick: 'approved',
    },
    {
      key: '2',
      code: 'Thep10',
      name: 'Thép 10',
      unit: 'Kg',
      request: 100,
      approver: 'Nam Phạm',
      approved: 0,
      price: '0',
      status: '0',
      nccduocduyet: '',
      note: '',
      tick: 'rejected',
    },
    {
      key: '3',
      code: 'Kem',
      name: 'Kẽm',
      unit: 'Kg',
      request: 100,
      approver: 'Nam Phạm',
      approved: 100,
      price: '150.000đ/m',
      status: '100',
      nccduocduyet: 'TNHH Đức Thắng',
      note: '',
      tick: 'approved',
    },
  ];
  
  const { t } = useTranslation('material');

  const renderEditableCell = (text: any, record: any, field: string) => {
    const editable = (field === 'price' && capDuyet === 1) || 
                    (field === 'approved' && capDuyet === 2) || 
                    (field === 'nccduocduyet' && capDuyet === 3) || 
                    (field === 'code' && capDuyet === 4) || 
                    field === 'note';

    if (editable) {
      return (
        <Input
          defaultValue={text}
          onChange={(e) => {
            record[field] = e.target.value;
          }}
        />
      );
    }
    return text;
  };
   const columns: ColumnType<(typeof dataSource)[0]>[] = [
    {
      title: <span>{t('Material code')}</span>,
      dataIndex: 'code',
      key: 'code',
      width: 150,
      render: (text, record) => renderEditableCell(text, record, 'code'),
      align: 'center',
    },
    {
      title: <span>{t('Material name')}</span>,
      dataIndex: 'name',
      key: 'name',
      width: 120,
      align: 'center',
    },
    {
      title: <span>{t('Unit')}</span>,
      dataIndex: 'unit',
      key: 'unit',
      width: 93,
      align: 'center',
    },
    {
      title: <span>{t('This time proposal')}</span>,
      dataIndex: 'request',
      key: 'request',
      width: 157,
      align: 'center',
    },
    {
      title: <span>{t('Approved by')}</span>,
      dataIndex: 'approver',
      key: 'approver',
      width: 136,
      align: 'center',
    },
    {
      title: <span>{t('Approved quantity')}</span>,
      dataIndex: 'approved',
      key: 'approved',
      width: 197,
      render: (text, record) => renderEditableCell(text, record, 'approved'),
      align: 'center',
    },
    {
      title: <span>{t('Approved price')}</span>,
      dataIndex: 'price',
      key: 'price',
      width: 157,
      render: (text, record) => renderEditableCell(text, record, 'price'),
      align: 'center',
    },
    {
      title: <span>{t('Into money')}</span>,
      dataIndex: 'status',
      key: 'status',
      width: 124,
      align: 'center',
    },
    {
      title: <span>{t('Approved Supplier')}</span>,
      dataIndex: 'nccduocduyet',
      key: 'nccduocduyet',
      width: 174,
      render: (text, record) => renderEditableCell(text, record, 'nccduocduyet'),
      align: 'center',
    },
    {
      title: <span>{t('Note')}</span>,
      dataIndex: 'note',
      key: 'note',
      width: 273,
      render: (text, record) => renderEditableCell(text, record, 'note'),
      align: 'center',
    },
    {
      title: '',
      dataIndex: 'tick',
      key: 'tick',
      render: (status: string) =>
        status === 'approved' ? (
          <CheckOutlined style={{ color: 'green' }} />
        ) : (
          <CloseOutlined style={{ color: 'red' }} />
        ),
      width: 68,
      fixed: 'right',
      align: 'center',
    },
  ];

  const handleImportButtonClick = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    setIsModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      <div id="div1">
        <Row>
          <Col span={24}>
            <Title level={3}>{t('MATERIAL PROPOSAL FORM')}</Title>
          </Col>
        </Row>
        <Form
          initialValues={{
            code: proposal.id,
            category: proposal.section,
          }}
          className={styles.formLayout}
        >
          <Row gutter={16}>
            
            <Col span={6} className={styles.formItemCol}>
              <Form.Item label={t('Material proposal code')} name="code" className={styles.formItem}>
                <Input defaultValue={proposal.id} className={styles.inputCode} /> 
              </Form.Item>
            </Col>
            <Col span={6} className={styles.formItemCol}>
              <Form.Item
                label={t('Belongs to category / Father job')}
                name="category"
                className={styles.formItem}
              ></Form.Item>
              <Select defaultValue={proposal.section} className={styles.inputOption}>
                <Option value="Phần thân">Phần thân</Option>
              </Select>
            </Col>
            <Col span={6} className={styles.formItemCol}>
              <Form.Item label={t('Date of creation of ticket')} className={styles.formItem}></Form.Item>
              <DatePicker format="DD/MM/YYYY" className={styles.inputDate01} />
            </Col>
            <Col span={6} className={styles.formItemCol}>
              <Form.Item label={t('Date of request for import')} className={styles.formItem}></Form.Item>
              <DatePicker format="DD/MM/YYYY" className={styles.inputDate02} />
            </Col>
          </Row>
        </Form>

        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: 'max-content', y: 700 }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={5}>
                Tổng
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5}>125</Table.Summary.Cell>
              <Table.Summary.Cell index={6}></Table.Summary.Cell>
              <Table.Summary.Cell index={7}>125</Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      </div>

      <div id="div2" className={styles.container}>
        <Button type="primary" onClick={handleImportButtonClick}>
          {t('Import to warehouse')}
        </Button>
        <div className={styles.buttonNhapkho}>
          <PrinterOutlined className={styles.printIcon} />
          <Button className={styles.buttonGuidexuat}>{t('Submit a proposal')}</Button>
        </div>
      </div>

      <Modal open={isModalVisible} onOk={handleModalOk} onCancel={handleModalCancel} footer={null} width={1250}>
        <ImportGoods />
      </Modal>
    </div>
  );
};

export default MachineryMaterialsForm;
