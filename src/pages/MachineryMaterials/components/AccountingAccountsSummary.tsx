import React, { useEffect, useMemo, useState } from 'react';

import { eTypeVatTuMayMoc } from '@/common/define';
import { AccountingInvoiceService, AccountingMappingDTO } from '@/services/AccountingInvoiceService';
import { Tag, Tooltip, Typography } from 'antd';
import { firstValueFrom } from 'rxjs';

const { Text } = Typography;

const mappingCache = new Map<number, Promise<AccountingMappingDTO[]>>();

const accountRows = [
  { key: 'cash', label: 'Tiền mặt', debit: 'cashDebitAccount', credit: 'cashCreditAccount' },
  { key: 'bank', label: 'Chuyển khoản', debit: 'bankDebitAccount', credit: 'bankCreditAccount' },
  {
    key: 'service',
    label: 'Công nợ/HĐ dịch vụ',
    debit: 'serviceInvoiceDebitAccount',
    credit: 'serviceInvoiceCreditAccount',
  },
  {
    key: 'vat',
    label: 'VAT',
    debit: 'serviceInvoiceVatDebitAccount',
    credit: 'serviceInvoiceVatCreditAccount',
  },
] as const;

type AccountRow = {
  key: string;
  label: string;
  debit: string;
  credit: string;
};

type Props = {
  businessType: number;
  compact?: boolean;
  detailCode?: string;
};

export function getMaterialAccountingBusinessType(type: eTypeVatTuMayMoc): number {
  switch (type) {
    case eTypeVatTuMayMoc.VatTuChinh:
      return 0;
    case eTypeVatTuMayMoc.VatTuPhu:
      return 1;
    case eTypeVatTuMayMoc.MayMoc:
      return 2;
    default:
      return 0;
  }
}

function fetchAccountingMappings(businessType: number): Promise<AccountingMappingDTO[]> {
  const cached = mappingCache.get(businessType);
  if (cached) {
    return cached;
  }

  const request = firstValueFrom(AccountingInvoiceService.Get.GetAccountingMapping(businessType)).catch(error => {
    mappingCache.delete(businessType);
    throw error;
  });
  mappingCache.set(businessType, request);
  return request;
}

function pickMapping(mappings: AccountingMappingDTO[], detailCode?: string): AccountingMappingDTO | undefined {
  const activeMappings = mappings.filter(item => item.isActive !== false && item.status === 0);
  if (detailCode) {
    const normalizedCode = detailCode.trim().toLowerCase();
    const byCode = activeMappings.find(
      item => item.businessContentDetailCode?.trim().toLowerCase() === normalizedCode,
    );
    if (byCode) {
      return byCode;
    }
  }

  return activeMappings[0] ?? mappings[0];
}

function buildRows(mapping?: AccountingMappingDTO): AccountRow[] {
  if (!mapping) {
    return [];
  }

  return accountRows
    .map(row => ({
      key: row.key,
      label: row.label,
      debit: String(mapping[row.debit] ?? '').trim(),
      credit: String(mapping[row.credit] ?? '').trim(),
    }))
    .filter(row => row.debit || row.credit);
}

export default function AccountingAccountsSummary({ businessType, compact = true, detailCode }: Props): React.JSX.Element {
  const [mappings, setMappings] = useState<AccountingMappingDTO[]>([]);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setHasError(false);

    fetchAccountingMappings(businessType)
      .then(data => {
        if (mounted) {
          setMappings(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (mounted) {
          setHasError(true);
          setMappings([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [businessType]);

  const selectedMapping = useMemo(() => pickMapping(mappings, detailCode), [mappings, detailCode]);
  const rows = useMemo(() => buildRows(selectedMapping), [selectedMapping]);

  if (hasError) {
    return (
      <div style={{ marginTop: 8 }}>
        <Tag color="red">Không tải được tài khoản hạch toán</Tag>
      </div>
    );
  }

  if (!selectedMapping || rows.length === 0) {
    return (
      <div style={{ marginTop: 8 }}>
        <Tag color="gold">Chưa cấu hình tài khoản hạch toán</Tag>
      </div>
    );
  }

  const hiddenRows = rows.slice(2);
  const hiddenContent = (
    <div style={{ maxWidth: 360 }}>
      {hiddenRows.map(row => (
        <div key={row.key}>
          {row.label}: Nợ {row.debit || '-'} / Có {row.credit || '-'}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ marginTop: 8 }}>
      <Text strong style={{ color: compact ? '#fff' : undefined, display: 'block', marginBottom: 4 }}>
        Tài khoản hạch toán
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {rows.slice(0, compact ? 2 : rows.length).map(row => (
          <Tag key={row.key} color="blue" style={{ marginInlineEnd: 0 }}>
            {row.label}: Nợ {row.debit || '-'} / Có {row.credit || '-'}
          </Tag>
        ))}
        {compact && hiddenRows.length > 0 && (
          <Tooltip title={hiddenContent}>
            <Tag color="default" style={{ marginInlineEnd: 0 }}>
              +{hiddenRows.length}
            </Tag>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
