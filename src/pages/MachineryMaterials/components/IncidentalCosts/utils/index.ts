import dayjs from 'dayjs';

import { FormatDate, FormatDateAPI } from '@/common/define';
import { CostDataCreate, IncidentalData } from '@/services/AccountingInvoiceService';
import { accountingInvoiceActions } from '@/store/accountingInvoice';

// ----------------------------------------------------------------------

interface DayDataType {
  date: string;
  incidentals: IncidentalData[];
  badgeCount?: any;
  totalDayMoney?: any;
}

const getStatusWeight = (i: IncidentalData) => {
  if (!i.isConfirmByRank1 && !i.isConfirmByRank2) return 0;
  if (i.isConfirmByRank1 && !i.isConfirmByRank2) return 1;
  return 2;
};

// chưa duyệt → đã duyệt cấp 1 → đã duyệt cấp 2,  mới → cũ
const compareIncidental = (a: IncidentalData, b: IncidentalData) => {
  const diffStatus = getStatusWeight(a) - getStatusWeight(b);
  if (diffStatus !== 0) return diffStatus;
  return dayjs(b.createDate).diff(dayjs(a.createDate));
};

export const groupAndSortByDate = (data: IncidentalData[]): DayDataType[] => {
  const map: Record<string, IncidentalData[]> = {};

  for (const item of data) {
    const key = dayjs(item.createDate).format(FormatDate);
    (map[key] ??= []).push(item);
  }

  return Object.keys(map)
    .sort((d1, d2) => dayjs(d2, FormatDate).diff(dayjs(d1, FormatDate)))
    .map(date => {
      const incidentals = map[date].sort(compareIncidental);
      return {
        date,
        incidentals,
        badgeCount: incidentals.filter(i => !(i.isConfirmByRank1 && i.isConfirmByRank2)).length,
        totalDayMoney: incidentals.reduce((s, i) => s + (i.totalAmount as unknown as number), 0),
      };
    });
};

export const getColorBaseOnStatus = (incidental: IncidentalData) => {
  if (incidental.isSynchronized) {
    return 'magenta';
  }
  if (!incidental.isConfirmByRank1 && !incidental.isConfirmByRank2) {
    return 'red';
  } else if (incidental.isConfirmByRank1 && !incidental.isConfirmByRank2) {
    return 'orange';
  } else if (incidental.isConfirmByRank2) {
    return 'blue';
  } else {
    return 'magenta';
  }
};

export const getConfirmLevel = (incidental: IncidentalData) => {
  if (incidental.isSynchronized) {
    return 3;
  }
  if (!incidental.isConfirmByRank1 && !incidental.isConfirmByRank2) {
    return 0;
  } else if (incidental.isConfirmByRank1 && !incidental.isConfirmByRank2) {
    return 1;
  } else if (incidental.isConfirmByRank2) {
    return 2;
  } else {
    return 3;
  }
};

export type ConfirmField = 'isConfirmByRank1' | 'isConfirmByRank2';

interface CurrentUserData {
  Id: string;
  UserName: string;
}

export function handleConfirm(
  data: IncidentalData,
  confirm: boolean,
  type: ConfirmField,
  user: CurrentUserData,
): CostDataCreate {
  const common = { ...data, projectCode: data.projectCode };

  if (type === 'isConfirmByRank1') {
    return confirm
      ? {
          ...common,
          isConfirmByRank1: true,
          dateConfirmByRank1: dayjs().format(FormatDateAPI),
          userIdRank1: user.Id,
          userNameRank1: user.UserName,
        }
      : {
          ...common,
          isConfirmByRank1: false,
          dateConfirmByRank1: undefined,
          userIdRank1: '',
          userNameRank1: '',
        };
  }

  return confirm
    ? {
        ...common,
        isConfirmByRank2: true,
        dateConfirmByRank2: dayjs().format(FormatDateAPI),
        userIdRank2: user.Id,
        userNameRank2: user.UserName,
      }
    : {
        ...common,
        isConfirmByRank2: false,
        dateConfirmByRank2: undefined,
        userIdRank2: '',
        userNameRank2: '',
      };
}

export function mergeByGroupId<
  T extends {
    id: number;
    groupId?: string;
    totalAmount: number;
  },
>(list: T[]) {
  const map = new Map<string, { header: T; items: T[] }>();

  list.forEach(item => {
    const gid = item.groupId ?? item.id.toString();

    if (!map.has(gid)) {
      map.set(gid, { header: { ...item }, items: [item] });
    } else {
      const agg = map.get(gid)!;
      agg.items.push(item);

      agg.header.totalAmount += item.totalAmount;
    }
  });

  return Array.from(map.values());
}

export function getGroupsNeedSync(groupedData: DayDataType[]) {
  return groupedData.filter(group => {
    const items = group.incidentals || [];
    if (!items.length) return false;
    const last = items[items.length - 1];
    return last.isConfirmByRank1 || last.isConfirmByRank2;
  });
}

export function syncAllGroups(groupedData: DayDataType[], companyId: any, dispatch: any) {
  const groups = getGroupsNeedSync(groupedData);

  if (!groups.length) {
    return;
  }

  groups.forEach(group => {
    const items = group.incidentals || [];
    const last = items[items.length - 1];
    const updatedItems = items.map(item => ({
      ...item,
      isConfirmByRank1: last.isConfirmByRank1,
      userNameRank1: last.userNameRank1,
      userIdRank1: last.userIdRank1,
      dateConfirmByRank1: last.dateConfirmByRank1,
      isConfirmByRank2: last.isConfirmByRank2,
      userNameRank2: last.userNameRank2,
      userIdRank2: last.userIdRank2,
      dateConfirmByRank2: last.dateConfirmByRank2,
    }));

    dispatch(
      accountingInvoiceActions.UpdateAdditionalCosts({
        dataCreates: updatedItems,
        companyId
      })
    );
  });
}