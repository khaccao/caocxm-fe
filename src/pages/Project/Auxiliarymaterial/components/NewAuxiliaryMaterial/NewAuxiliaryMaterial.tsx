import React, { useState } from 'react';

import { PrinterOutlined } from '@ant-design/icons';
import { Table, Button, Select, DatePicker, Input, InputNumber } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import styles from './NewAuxiliaryMaterial.module.css';

const { Option } = Select;
interface DataType {
  key: string;
  mavattu: string | JSX.Element;
  tenvattu: string | JSX.Element;
  donvi: string | JSX.Element;
  klkehoach: string | JSX.Element;
  tonkho: string | JSX.Element;
  dexuat: string | JSX.Element;
  ghichu: string | JSX.Element;
}
const NewAuxiliaryMaterial: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
      key: '1',
      mavattu: 'BT1',
      tenvattu: 'Đinh kẽm 4cm',
      donvi: 'Kg',
      klkehoach: '500',
      tonkho: '500',
      dexuat: '15',
      ghichu: '',
    },
    {
      key: '2',
      mavattu: 'Thep1',
      tenvattu: 'Thép',
      donvi: 'Kg',
      klkehoach: '900',
      tonkho: '900',
      dexuat: '15',
      ghichu: '',
    },
    {
      key: '3',
      mavattu: 'Thep1',
      tenvattu: 'Que hàn',
      donvi: 'Kg',
      klkehoach: '900',
      tonkho: '900',
      dexuat: '15',
      ghichu: '',
    },
    {
      key: '4',
      mavattu: 'Thep1',
      tenvattu: 'Bút xóa',
      donvi: 'Kg',
      klkehoach: '900',
      tonkho: '900',
      dexuat: '15',
      ghichu: '',
    },
    {
      key: '5',
      mavattu: 'Thep1',
      tenvattu: 'Dây cước',
      donvi: 'Kg',
      klkehoach: '900',
      tonkho: '900',
      dexuat: '15',
      ghichu: '',
    },
    {
      key: '6',
      mavattu: 'Thep1',
      tenvattu: 'Dây cắt gỗ',
      donvi: 'Kg',
      klkehoach: '900',
      tonkho: '900',
      dexuat: '15',
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
      dexuat: <InputNumber className={styles.newRow} />,
      ghichu: <Input className={styles.newRow} />,
    };
    setDataSource([...dataSource, newRow]);
    setNewRows(new Set(newRows.add(newKey)));
  };

  const columns: ColumnType<DataType>[] = [
    {
      title: t('Material code'),
      dataIndex: 'mavattu',
      key: 'mavattu',
      width: 150,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && ['BT1', 'Thep1'].includes(text) ? styles.underlineText : ''}>
          {text}
        </span>
      ),
      align: 'center',
    },
    {
      title: t('Material name'),
      dataIndex: 'tenvattu',
      key: 'tenvattu',
      width: 150,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Unit'),
      dataIndex: 'donvi',
      key: 'donvi',
      width: 93,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Planned volume'),
      dataIndex: 'klkehoach',
      key: 'klkehoach',
      width: 170,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Actual inventory'),
      dataIndex: 'tonkho',
      key: 'tonkho',
      width: 160,
      className: styles.tablecell,
      render: (text: string | JSX.Element) => (
        <span className={typeof text === 'string' && ['500', '900'].includes(text) ? styles.blurText : ''}>{text}</span>
      ),
      align: 'center',
    },
    {
      title: t('This time proposal'),
      dataIndex: 'dexuat',
      key: 'dexuat',
      width: 160,
      className: styles.tablecell,
      align: 'center',
    },
    {
      title: t('Note'),
      dataIndex: 'ghichu',
      key: 'ghichu',
      width: 230,
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
    dexuat: '',
    ghichu: '',
  };

  const filteredDataSource = dataSource.filter(row => row.tenvattu !== 'Tổng' && row.dexuat !== '30');
  const updatedDataSource = [...filteredDataSource, addButtonRow];

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
          <span className={styles.labeltext}>{t('Date of request for import')}</span>
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
          <div className={styles.inputDate}>
            <DatePicker format="DD/MM/YYYY" className={styles.inputDate01} />
          </div>
        </div>
        <header className="NewAuxiliaryMaterial-header">
          <Table
            dataSource={updatedDataSource}
            columns={columns}
            pagination={false}
            bordered
            size="middle"
            scroll={{ y: 450 }}
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

export default NewAuxiliaryMaterial;
