import React, { useState } from 'react';

import { PrinterOutlined } from '@ant-design/icons';
import { Table, Button, Select, DatePicker, Input, InputNumber } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './NewMaterialList.module.css';

const { Option } = Select;

interface DataType {
  key: string;
  mavattu: string | JSX.Element;
  tenvattu: string | JSX.Element;
  donvi: string | JSX.Element;
  klkehoach: string | JSX.Element;
  tonkho: string | JSX.Element;
  klconlai: string | JSX.Element;
  dexuat: string | JSX.Element;
  ngaynhap: string | JSX.Element;
  ghichu: string | JSX.Element;
}

const NewMaterialList: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
      key: '1',
      mavattu: 'BT1',
      tenvattu: 'Bê tông',
      donvi: 'Kg',
      klkehoach: '500',
      tonkho: '500',
      klconlai: '500',
      dexuat: '15',
      ngaynhap: '01/01/2023',
      ghichu: '',
    },
    {
      key: '2',
      mavattu: 'Thep1',
      tenvattu: 'Thép',
      donvi: 'Kg',
      klkehoach: '900',
      tonkho: '900',
      klconlai: '900',
      dexuat: '15',
      ngaynhap: '01/01/2023',
      ghichu: '',
    },
    {
      key: '3',
      mavattu: '',
      tenvattu: 'Tổng',
      donvi: '',
      klkehoach: '',
      tonkho: '',
      klconlai: '',
      dexuat: '30',
      ngaynhap: '',
      ghichu: '',
    },
  ]);

  const [newRows, setNewRows] = useState<Set<string>>(new Set());
  const { t } = useTranslation('material');

  const handleAddRow = () => {
    const newKey = (dataSource.length + 1).toString();
    const newRow: DataType = {
      key: newKey,
      mavattu: <Input className={styles.newRow} />,
      tenvattu: <Input className={styles.newRow} />,
      donvi: <Input className={styles.newRow} />,
      klkehoach: <InputNumber className={styles.newRow} />,
      tonkho: <InputNumber className={styles.newRow} />,
      klconlai: <InputNumber className={styles.newRow} />,
      dexuat: <InputNumber className={styles.newRow} />,
      ngaynhap: <DatePicker className={styles.newRow} />,
      ghichu: <Input className={styles.newRow} />,
    };
    setDataSource([...dataSource, newRow]);
    setNewRows(new Set(newRows.add(newKey)));
  };

  const columns: ColumnType<DataType>[] = [
    {
      title: <span className={styles.tableHeader}>{t('Material code')}</span>,
      dataIndex: 'mavattu',
      key: 'mavattu',
      width: 116,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && ['BT1', 'Thep1'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Material name')}</span>,
      dataIndex: 'tenvattu',
      key: 'tenvattu',
      width: 116,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && text === 'Tổng' ? styles.boldText : ''}>{text}</span>
      ),
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Unit')}</span>,
      dataIndex: 'donvi',
      key: 'donvi',
      width: 100,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Planned volume')}</span>,
      dataIndex: 'klkehoach',
      key: 'klkehoach',
      width: 120,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Actual inventory')}</span>,
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 175,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Remaining mass')}</span>,
      dataIndex: 'klconlai',
      key: 'klconlai',
      width: 137,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('This time proposal')}</span>,
      dataIndex: 'dexuat',
      key: 'dexuat',
      width: 175,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Date of entry required')}</span>,
      dataIndex: 'ngaynhap',
      key: 'ngaynhap',
      width: 160,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: <span className={styles.tableHeader}>{t('Note')}</span>,
      dataIndex: 'ghichu',
      key: 'ghichu',
      width: 300,
      render: (text: string | JSX.Element) => text,
      className: styles.tablecell,
      align: 'center',
    },
  ];

  const addButtonRow: DataType = {
    key: (dataSource.length + 1).toString(),
    mavattu: (
      <Button className={styles.addButton} onClick={handleAddRow}>
        +
      </Button>
    ),
    tenvattu: '',
    donvi: '',
    klkehoach: '',
    tonkho: '',
    klconlai: '',
    dexuat: '',
    ngaynhap: '',
    ghichu: '',
  };

  const tongIndex = dataSource.findIndex(row => row.tenvattu === 'Tổng');
  const updatedDataSource = [
    ...dataSource.slice(0, tongIndex),
    ...dataSource.slice(tongIndex + 1),
    dataSource[tongIndex],
    addButtonRow,
  ];

  return (
    <div className={styles.container}>
      <div className={styles.formcontainer}>
        <h1 className={styles.formtitle}>{t('CREATE NEW MATERIAL PROPOSAL FORM')}</h1>
        <div className={styles.subsection}>
          <span className={styles.labeltext}>{t('Form code')}</span>
          <span className={styles.labeltext}>
            {t('Belongs to category / Father job')}
            <span className="fadedText">{t('(Optional)')}</span>
          </span>
          <span className={styles.labeltext}>{t('Date of creation of ticket')}</span>
        </div>
        <div className={styles.inputsection}>
          <div className={styles.inputwrapper}>
            <input type="text" className={styles.inputfield} defaultValue="DX2509_2" />
          </div>
          <div className={styles.selectdatesection}>
            <Select defaultValue="select" className={styles.selectfield}>
              <Option value="select">Phần thân</Option>
            </Select>
          </div>
          <div className={styles.datewrapper}>
            <DatePicker className={styles.datepicker} />
          </div>
        </div>
        <header className="MaterialList-header">
          <Table
            dataSource={updatedDataSource}
            columns={columns}
            pagination={false}
            bordered
            size="middle"
            scroll={{ x: 700, y: 450 }}
            rowClassName={record => (newRows.has(record.key) ? `${styles.newRow} ${styles.tableRow}` : styles.tableRow)}
          />
        </header>
      </div>
      <div className={styles.buttonsection}>
        <Button type="primary" className={styles.button}>
          {t('Import to warehouse')}
        </Button>
        <PrinterOutlined className={styles.PrinterOutlined} />
        <Button type="primary" className={styles.button}>
          {t('Submit a proposal')}
        </Button>
      </div>
    </div>
  );
};

export default NewMaterialList;
