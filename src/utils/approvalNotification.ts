export type ApprovalNotificationMode = 'mine' | 'all';

export const APPROVAL_NOTIFICATION_MODE_KEY = 'cxmApprovalNotificationMode';
export const APPROVAL_NOTIFICATION_MODE_EVENT = 'cxmApprovalNotificationModeChanged';

export const getCurrentApprovalLevel = (proposal: any): number => {
  for (let i = 1; i <= 5; i += 1) {
    if (!String(proposal?.[`nguoiDuyet${i}`] ?? '').trim()) {
      return i - 1;
    }
  }

  return 5;
};

export const isPendingApprovalProposal = (proposal: any): boolean => {
  return getCurrentApprovalLevel(proposal) < Number(proposal?.capDuyet ?? 0);
};

export const canUserApproveProposal = (proposal: any, approvalLevel: number): boolean => {
  if (!approvalLevel) return false;
  if (!isPendingApprovalProposal(proposal)) return false;
  return getCurrentApprovalLevel(proposal) + 1 === approvalLevel;
};

export const getStoredApprovalNotificationMode = (): ApprovalNotificationMode => {
  if (typeof window === 'undefined') return 'mine';
  return localStorage.getItem(APPROVAL_NOTIFICATION_MODE_KEY) === 'all' ? 'all' : 'mine';
};

export const setStoredApprovalNotificationMode = (mode: ApprovalNotificationMode) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(APPROVAL_NOTIFICATION_MODE_KEY, mode);
  window.dispatchEvent(new Event(APPROVAL_NOTIFICATION_MODE_EVENT));
};
