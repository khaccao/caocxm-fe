
import { useTranslation } from 'react-i18next';

const ColumnTableForDays =() => {
  const { t } = useTranslation('timeKeeping'); // Sử dụng useTranslation
  const convertDate = (dateString: string) =>  {
    // Kiểm tra định dạng đầu vào
    if (!/^\d{8}$/.test(dateString)) {
        throw new Error("Định dạng ngày không hợp lệ. Sử dụng YYYYMMDD.");
    }
    // Tách năm, tháng, ngày
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);

    // Định dạng lại ngày
    return `${day}/${month}/${year}`;
}
  return [
    {
      title: t('Employee'),
      dataIndex: 'employee',
      key: 'employee',
      width: 160,
      align: 'center',
      fixed: 'left',
      render: (text: any) => <div style={{ color: 'blue', textDecoration: 'underline', textAlign: 'left' }}>{text}</div>,
    },
    {
      title: t('Ca sáng (7h-11h)'),
      dataIndex: 'casang',
      key: 'casang',
      align: 'center',
      width: 130,
      editable: true,
    },
    {
      title: t('Ca chiều (13h-17h)'),
      dataIndex: 'cachieu',
      key: 'cachieu',
      align: 'center',
      width: 130,
      editable: true,
    },
    {
      title: t('Tăng ca(11h-13h)'),
      dataIndex: 'tangca1',
      key: 'tangca1',
      align: 'center',
      width: 130,
      editable: true,
    },
    {
      title: t('Tăng ca (17h-24h)'),
      dataIndex: 'tangca2',
      key: 'tangca2',
      align: 'center',
      width: 130,
      editable: true,
    },
    {
      title: t('Tăng ca (0h-7h)'),
      dataIndex: 'tangca3',
      key: 'tangca3',
      align: 'center',
      width: 130,
      editable: true,
    },
    {
      title: t('Tổng giờ chốt ca chính'),
      dataIndex: 'totalApprovedMainShift',
      key: 'totalApprovedMainShift',
      align: 'center',
      width: 130,
    },
    {
      title: t('Tổng giờ chốt tăng ca'),
      dataIndex: 'totalApprovedOTShift',
      key: 'totalApprovedOTShift',
      align: 'center',
      width: 130,
    },
    {
      title: t('Ghi chú điểm danh'),
      dataIndex: 'checkin_Note',
      key: 'checkin_Note',
      align: 'center',
      width: 230,
      editable: false,
      // render: (record: any) => {
      //   console.log(record.checkin_Note);
      //   return (<span>{record.checkin_Note}</span>)
      // }
    },
    {
      title: t('Ghi chú'),
      dataIndex: 'approved_Note',
      key: 'approved_Note',
      align: 'center',
      width: 230,
      editable: true,
    },
  ]
}

export default ColumnTableForDays