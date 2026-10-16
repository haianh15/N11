import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  AuthSession,
  PasswordResetToken,
  SecurityAuditLog,
  ServiceFeeConfig,
  UtilityPriceHistory,
  BankAccountConfig,
  BatchSchedule,
  Room,
  RoomHistoryLog,
  ReturnPlanLog,
  TenantContactLog,
  InventoryRecord,
  HandoverCondition,
  HandoverReport,
  AssetIncident,
  ReturnInspection,
  AssetComparisonResult,
  HandoverReturnReport,
  Tenant,
  CoTenant,
  TenantChangeProposal,
  TenantHistoryEntry,
  Contract,
  DepositSettlementSlip,
  MeterReading,
  PeriodBill,
  PaymentNotice,
  PaymentReceipt,
  DebtHistoryReminder,
  DebtPromise,
  Asset
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_SERVICES,
  INITIAL_PRICE_HISTORY,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_BATCH_SCHEDULES,
  INITIAL_STANDARD_ASSETS,
  INITIAL_ROOMS,
  INITIAL_TENANTS,
  INITIAL_CO_TENANTS,
  INITIAL_CONTRACTS,
  INITIAL_INVENTORY_RECORDS,
  INITIAL_HANDOVER_REPORTS,
  INITIAL_INCIDENTS,
  INITIAL_METER_READINGS,
  INITIAL_PERIOD_BILLS,
  INITIAL_PAYMENT_NOTICES,
  INITIAL_PAYMENT_RECEIPTS,
  INITIAL_DEBT_REMINDERS,
  INITIAL_DEBT_PROMISES,
  INITIAL_RETURN_INSPECTIONS,
  INITIAL_SETTLEMENT_SLIPS
} from '../data/seedData';

interface AppContextType {
  // Auth
  currentUser: UserAccount | null;
  currentSession: AuthSession | null;
  authNotification: string | null;
  setAuthNotification: (msg: string | null) => void;
  login: (username: string, password: string) => { success: boolean; message?: string; requireChangePass?: boolean };
  changePasswordFirstLogin: (currentPass: string, newPass: string, confirmPass: string) => { success: boolean; message: string };
  logout: () => { success: boolean; message: string };
  changePasswordFromProfile: (currentPass: string, newPass: string, confirmPass: string) => { success: boolean; message: string };
  requestPasswordResetEmail: (email: string) => { success: boolean; message: string; generatedToken?: string };
  resetPasswordWithToken: (token: string, newPass: string, confirmPass: string) => { success: boolean; message: string };
  resetTokens: PasswordResetToken[];

  // Config (Mục 0.2)
  services: ServiceFeeConfig[];
  priceHistory: UtilityPriceHistory[];
  bankAccounts: BankAccountConfig[];
  activeBankAccount: BankAccountConfig | undefined;
  updateUtilityPrices: (electricPrice: number, waterPrice: number, serviceItems: ServiceFeeConfig[], effectivePeriod: string) => boolean;
  updateBankAccount: (bankName: string, accountNumber: string, accountHolder: string) => boolean;

  // Rooms (QT01)
  rooms: Room[];
  roomHistory: RoomHistoryLog[];
  returnPlans: ReturnPlanLog[];
  contactLogs: TenantContactLog[];
  addRoom: (roomCode: string, floor: number, area: number, note?: string) => { success: boolean; message: string };
  updateRoom: (roomCode: string, floor: number, area: number, note?: string) => { success: boolean; message: string };
  recordInitialPaymentPH07: (params: {
    roomCode: string;
    leaseId: string;
    contractId: string;
    depositAmount: number;
    firstMonthRentAmount: number;
    actualAmount: number;
    receivedDate: string;
    transactionCode: string;
    bankAccountReceived: string;
    proofFile?: string;
  }) => { success: boolean; message: string };
  confirmCheckInPH05: (roomCode: string, leaseId: string, actualCheckInDate: string) => { success: boolean; message: string };
  updateExpectedReturnDatePH11_12: (params: {
    roomCode: string;
    leaseId: string;
    expectedDate: string;
    confirmSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    confirmedAt: string;
    exchangeContent: string;
    reason?: string;
  }) => { success: boolean; message: string };
  recordTenantContactPH13: (params: {
    roomCode: string;
    leaseId: string;
    contactTimeActual: string;
    contactSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    contactResult: 'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê';
    content: string;
    nextContactDate?: string;
  }) => { success: boolean; message: string };
  confirmReturnStep305AndVacantPH08: (roomCode: string, leaseId: string) => { success: boolean; message: string };

  // Handover & Assets (QT02)
  standardAssets: Asset[];
  inventoryRecords: InventoryRecord[];
  handoverReports: HandoverReport[];
  incidents: AssetIncident[];
  returnInspections: ReturnInspection[];
  assetComparisonResults: AssetComparisonResult[];
  handoverReturnReports: HandoverReturnReport[];
  saveInventoryBG01: (record: InventoryRecord) => void;
  saveHandoverReportBG03: (report: HandoverReport) => void;
  confirmHandoverSignaturesBG03: (reportId: string, tenantSigned: boolean, ownerSigned: boolean, paperLocation?: string) => void;
  recordIncidentBG04: (incident: AssetIncident) => void;
  recordReturnInspectionBG09: (inspection: ReturnInspection) => void;
  confirmReturnInspectionStep305: (roomCode: string, leaseId: string, evidence: string) => void;
  saveAssetComparisonResultBG07: (result: AssetComparisonResult) => void;
  saveHandoverReturnReportBG11: (report: HandoverReturnReport) => void;
  confirmFinalReturnReportBG11: (reportId: string, tenantSignedStatus: 'Khách đã ký' | 'Khách không ký', notSignReason?: string) => void;

  // Tenants (QT03)
  tenants: Tenant[];
  coTenants: CoTenant[];
  tenantProposals: TenantChangeProposal[];
  tenantHistory: TenantHistoryEntry[];
  addTenantHSKT01: (tenant: Omit<Tenant, 'id' | 'createdAt' | 'createdBy'>) => { success: boolean; tenantId?: string; message: string };
  addCoTenantHSKT02: (coTenant: Omit<CoTenant, 'id'>) => void;
  updateCoTenantStatusHSKT02: (coTenantId: string, status: 'Đang cư trú' | 'Đã kết thúc', actualDate?: string, evidence?: string) => void;
  verifyTenantProposalHSKT03: (proposal: TenantChangeProposal) => void;
  applyTenantUpdateHSKT04: (tenantId: string, updatedFields: Partial<Tenant>) => void;

  // Contracts (QT04)
  contracts: Contract[];
  batchSchedules: BatchSchedule[];
  addBatchSchedule: (batch: BatchSchedule) => void;
  createContractDraftHDT02: (contract: Omit<Contract, 'id' | 'status' | 'isSignedPaper' | 'version'>) => { success: boolean; contractId?: string; message: string };
  confirmContractSignedHDT04: (contractId: string, signedDate: string, proofFiles: string[]) => { success: boolean; message: string };
  createRenewalContractHDT06: (params: {
    previousContractId: string;
    roomCode: string;
    tenantId: string;
    tenantName: string;
    batchCode: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    terms: string;
  }) => { success: boolean; contractId?: string; message: string };
  activateRenewalContractHDT07: (contractId: string, signedDate: string, proofFiles: string[]) => { success: boolean; message: string };

  // Deposit Settlement (QT05)
  settlementSlips: DepositSettlementSlip[];
  saveSettlementSlipQTC01: (slip: DepositSettlementSlip) => void;
  updateSettlementFeedbackQTC02: (slipId: string, feedback: 'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được', reason?: string, deductionUpdates?: { id: string; amount: number }[]) => void;
  confirmSettlementTransferReceiptQTC03: (slipId: string, receipt: DepositSettlementSlip['transferReceipt']) => { success: boolean; message: string };

  // Billing (QT06)
  meterReadings: MeterReading[];
  periodBills: PeriodBill[];
  saveMeterReadingTT01: (reading: MeterReading) => void;
  updateMeterReadingTT02: (readingId: string, updates: Partial<MeterReading>, reason: string) => void;
  generatePeriodBillTT03: (roomCode: string, periodCode: string) => { success: boolean; billId?: string; message: string };
  confirmPeriodBillTT03: (billId: string) => void;

  // Payment Notices (QT07)
  paymentNotices: PaymentNotice[];
  generatePaymentNotice07_2: (billId: string, dueDate: string) => { success: boolean; noticeId?: string; message: string };
  replacePaymentNotice07_2: (oldNoticeId: string) => { success: boolean; noticeId?: string; message: string };

  // Payment Receipts (QT08)
  paymentReceipts: PaymentReceipt[];
  confirmPaymentReceipt08_2: (noticeId: string, amount: number, receivedDate: string, transactionCode: string, bankAccountReceived: string, proofFile?: string) => { success: boolean; message: string };
  revertPaymentReceipt08_2: (receiptId: string, reason: string) => { success: boolean; message: string };

  // Debts (QT09)
  debtReminders: DebtHistoryReminder[];
  debtPromises: DebtPromise[];
  recordDebtReminder09_2: (reminder: Omit<DebtHistoryReminder, 'id' | 'loggedAt' | 'loggedBy'>) => void;
  recordDebtPromise09_3: (promise: Omit<DebtPromise, 'id' | 'loggedAt' | 'loggedBy'>) => void;

  // Security Audit Log
  securityLogs: SecurityAuditLog[];
  logSecurity: (action: string, details: string) => void;

  // Quick reset for demo/testing
  resetAllToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Storage helpers
  const getStored = <T,>(key: string, defaultVal: T): T => {
    try {
      const item = localStorage.getItem(`mini_apt_${key}`);
      return item ? JSON.parse(item) : defaultVal;
    } catch {
      return defaultVal;
    }
  };

  const setStored = <T,>(key: string, val: T) => {
    try {
      localStorage.setItem(`mini_apt_${key}`, JSON.stringify(val));
    } catch (e) {
      console.error('LocalStorage write error', e);
    }
  };

  // State Declarations
  const [users, setUsers] = useState<UserAccount[]>(() => getStored('users', INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getStored('currentUser', INITIAL_USERS[0]));
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(() => {
    return {
      sessionId: 'sess_init_' + Date.now(),
      userId: INITIAL_USERS[0].id,
      username: INITIAL_USERS[0].username,
      role: INITIAL_USERS[0].role,
      type: 'admin',
      expiresAt: Date.now() + 30 * 60 * 1000,
      createdAt: Date.now()
    };
  });
  const [resetTokens, setResetTokens] = useState<PasswordResetToken[]>(() => getStored('resetTokens', []));
  const [authNotification, setAuthNotification] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceFeeConfig[]>(() => getStored('services', INITIAL_SERVICES));
  const [priceHistory, setPriceHistory] = useState<UtilityPriceHistory[]>(() => getStored('priceHistory', INITIAL_PRICE_HISTORY));
  const [bankAccounts, setBankAccounts] = useState<BankAccountConfig[]>(() => getStored('bankAccounts', INITIAL_BANK_ACCOUNTS));

  const [batchSchedules, setBatchSchedules] = useState<BatchSchedule[]>(() => getStored('batchSchedules', INITIAL_BATCH_SCHEDULES));
  const [standardAssets] = useState<Asset[]>(INITIAL_STANDARD_ASSETS);
  const [rooms, setRooms] = useState<Room[]>(() => getStored('rooms', INITIAL_ROOMS));
  const [roomHistory, setRoomHistory] = useState<RoomHistoryLog[]>(() => getStored('roomHistory', []));
  const [returnPlans, setReturnPlans] = useState<ReturnPlanLog[]>(() => getStored('returnPlans', []));
  const [contactLogs, setContactLogs] = useState<TenantContactLog[]>(() => getStored('contactLogs', []));

  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>(() => getStored('inventoryRecords', INITIAL_INVENTORY_RECORDS));
  const [handoverReports, setHandoverReports] = useState<HandoverReport[]>(() => getStored('handoverReports', INITIAL_HANDOVER_REPORTS));
  const [incidents, setIncidents] = useState<AssetIncident[]>(() => getStored('incidents', INITIAL_INCIDENTS));
  const [returnInspections, setReturnInspections] = useState<ReturnInspection[]>(() => getStored('returnInspections', INITIAL_RETURN_INSPECTIONS));
  const [assetComparisonResults, setAssetComparisonResults] = useState<AssetComparisonResult[]>(() => getStored('assetComparisonResults', []));
  const [handoverReturnReports, setHandoverReturnReports] = useState<HandoverReturnReport[]>(() => getStored('handoverReturnReports', []));

  const [tenants, setTenants] = useState<Tenant[]>(() => getStored('tenants', INITIAL_TENANTS));
  const [coTenants, setCoTenants] = useState<CoTenant[]>(() => getStored('coTenants', INITIAL_CO_TENANTS));
  const [tenantProposals, setTenantProposals] = useState<TenantChangeProposal[]>(() => getStored('tenantProposals', []));
  const [tenantHistory, setTenantHistory] = useState<TenantHistoryEntry[]>(() => getStored('tenantHistory', []));

  const [contracts, setContracts] = useState<Contract[]>(() => getStored('contracts', INITIAL_CONTRACTS));
  const [settlementSlips, setSettlementSlips] = useState<DepositSettlementSlip[]>(() => getStored('settlementSlips', INITIAL_SETTLEMENT_SLIPS));

  const [meterReadings, setMeterReadings] = useState<MeterReading[]>(() => getStored('meterReadings', INITIAL_METER_READINGS));
  const [periodBills, setPeriodBills] = useState<PeriodBill[]>(() => getStored('periodBills', INITIAL_PERIOD_BILLS));
  const [paymentNotices, setPaymentNotices] = useState<PaymentNotice[]>(() => getStored('paymentNotices', INITIAL_PAYMENT_NOTICES));
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>(() => getStored('paymentReceipts', INITIAL_PAYMENT_RECEIPTS));
  const [debtReminders, setDebtReminders] = useState<DebtHistoryReminder[]>(() => getStored('debtReminders', INITIAL_DEBT_REMINDERS));
  const [debtPromises, setDebtPromises] = useState<DebtPromise[]>(() => getStored('debtPromises', INITIAL_DEBT_PROMISES));
  const [securityLogs, setSecurityLogs] = useState<SecurityAuditLog[]>(() => getStored('securityLogs', []));

  // Sync state to local storage on changes
  useEffect(() => { setStored('users', users); }, [users]);
  useEffect(() => { setStored('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { setStored('services', services); }, [services]);
  useEffect(() => { setStored('priceHistory', priceHistory); }, [priceHistory]);
  useEffect(() => { setStored('bankAccounts', bankAccounts); }, [bankAccounts]);
  useEffect(() => { setStored('rooms', rooms); }, [rooms]);
  useEffect(() => { setStored('roomHistory', roomHistory); }, [roomHistory]);
  useEffect(() => { setStored('returnPlans', returnPlans); }, [returnPlans]);
  useEffect(() => { setStored('contactLogs', contactLogs); }, [contactLogs]);
  useEffect(() => { setStored('inventoryRecords', inventoryRecords); }, [inventoryRecords]);
  useEffect(() => { setStored('handoverReports', handoverReports); }, [handoverReports]);
  useEffect(() => { setStored('incidents', incidents); }, [incidents]);
  useEffect(() => { setStored('returnInspections', returnInspections); }, [returnInspections]);
  useEffect(() => { setStored('assetComparisonResults', assetComparisonResults); }, [assetComparisonResults]);
  useEffect(() => { setStored('handoverReturnReports', handoverReturnReports); }, [handoverReturnReports]);
  useEffect(() => { setStored('tenants', tenants); }, [tenants]);
  useEffect(() => { setStored('coTenants', coTenants); }, [coTenants]);
  useEffect(() => { setStored('tenantProposals', tenantProposals); }, [tenantProposals]);
  useEffect(() => { setStored('tenantHistory', tenantHistory); }, [tenantHistory]);
  useEffect(() => { setStored('contracts', contracts); }, [contracts]);
  useEffect(() => { setStored('batchSchedules', batchSchedules); }, [batchSchedules]);
  useEffect(() => { setStored('settlementSlips', settlementSlips); }, [settlementSlips]);
  useEffect(() => { setStored('meterReadings', meterReadings); }, [meterReadings]);
  useEffect(() => { setStored('periodBills', periodBills); }, [periodBills]);
  useEffect(() => { setStored('paymentNotices', paymentNotices); }, [paymentNotices]);
  useEffect(() => { setStored('paymentReceipts', paymentReceipts); }, [paymentReceipts]);
  useEffect(() => { setStored('debtReminders', debtReminders); }, [debtReminders]);
  useEffect(() => { setStored('debtPromises', debtPromises); }, [debtPromises]);
  useEffect(() => { setStored('securityLogs', securityLogs); }, [securityLogs]);

  const logSecurity = (action: string, details: string) => {
    const newLog: SecurityAuditLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'anonymous',
      action,
      details
    };
    setSecurityLogs(prev => [newLog, ...prev]);
  };

  // ==================== AUTH METHODS (UC-TK-01 -> 04) ====================
  const login = (username: string, password: string) => {
    const trimmedUser = username.trim();
    if (!trimmedUser && !password) {
      return { success: false, message: 'Tên đăng nhập là trường bắt buộc và Mật khẩu là trường bắt buộc' };
    }
    if (!trimmedUser) {
      return { success: false, message: 'Tên đăng nhập là trường bắt buộc' };
    }
    if (!password) {
      return { success: false, message: 'Mật khẩu là trường bắt buộc' };
    }

    const user = users.find(u => u.username === trimmedUser);
    const now = Date.now();

    if (!user) {
      logSecurity('LOGIN_FAILED', `User not found: ${trimmedUser}`);
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.' };
    }

    // Check lock
    if (user.lockUntil && user.lockUntil > now) {
      const minsLeft = Math.ceil((user.lockUntil - now) / 60000);
      return { success: false, message: `Tài khoản tạm thời bị khóa do sai quá 5 lần. Vui lòng thử lại sau ${minsLeft} phút.` };
    }

    if (user.passwordHash !== password) {
      const newFails = user.failedLoginAttempts + 1;
      let newLock: number | null = null;
      let lockMsg = '';
      if (newFails >= 5) {
        newLock = now + 15 * 60 * 1000;
        lockMsg = ' Bạn đã nhập sai 5 lần liên tiếp. Tài khoản tạm khóa 15 phút.';
      }

      setUsers(prev => prev.map(u => u.id === user.id ? {
        ...u,
        failedLoginAttempts: newFails,
        lockUntil: newLock
      } : u));

      logSecurity('LOGIN_FAILED', `User ${trimmedUser} password mismatch. Tries: ${newFails}`);
      return { success: false, message: `Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng thử lại.${lockMsg}` };
    }

    // Login successful
    const updatedUser = { ...user, failedLoginAttempts: 0, lockUntil: null };
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    if (updatedUser.mustChangePasswordFirstLogin) {
      const tempSession: AuthSession = {
        sessionId: 'sess_temp_' + now,
        userId: user.id,
        username: user.username,
        role: user.role,
        type: 'temp_change_password',
        expiresAt: now + 15 * 60 * 1000,
        createdAt: now
      };
      setCurrentSession(tempSession);
      logSecurity('LOGIN_FIRST_TIME', `Temp session for mandatory password change: ${user.username}`);
      return { success: true, requireChangePass: true, message: 'Đăng nhập thành công! Vui lòng đổi mật khẩu lần đầu.' };
    }

    const adminSession: AuthSession = {
      sessionId: 'sess_adm_' + now,
      userId: user.id,
      username: user.username,
      role: user.role,
      type: 'admin',
      expiresAt: now + 30 * 60 * 1000,
      createdAt: now
    };
    setCurrentSession(adminSession);
    logSecurity('LOGIN_SUCCESS', `Admin session established for ${user.username}`);
    return { success: true, requireChangePass: false };
  };

  const changePasswordFirstLogin = (currentPass: string, newPass: string, confirmPass: string) => {
    if (!currentUser || !currentSession) {
      return { success: false, message: 'Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại.' };
    }

    if (!currentPass) return { success: false, message: 'Mật khẩu hiện tại là trường bắt buộc' };
    if (!newPass) return { success: false, message: 'Mật khẩu mới là trường bắt buộc' };
    if (!confirmPass) return { success: false, message: 'Xác nhận mật khẩu mới là trường bắt buộc' };

    if (currentUser.passwordHash !== currentPass) {
      return { success: false, message: 'Mật khẩu hiện tại không chính xác.' };
    }

    if (newPass === currentPass) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    if (newPass.length < 12) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 12 ký tự theo chính sách bảo mật.' };
    }

    if (newPass !== confirmPass) {
      return { success: false, message: 'Xác nhận mật khẩu không khớp.' };
    }

    const now = Date.now();
    const updatedUser: UserAccount = {
      ...currentUser,
      passwordHash: newPass,
      mustChangePasswordFirstLogin: false,
      authVersion: currentUser.authVersion + 1,
      failedLoginAttempts: 0,
      lockUntil: null
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    // Create new admin session
    const adminSession: AuthSession = {
      sessionId: 'sess_adm_' + now,
      userId: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      type: 'admin',
      expiresAt: now + 30 * 60 * 1000,
      createdAt: now
    };
    setCurrentSession(adminSession);
    logSecurity('PASSWORD_CHANGED_FIRST_LOGIN', `First login password change succeeded for ${updatedUser.username}`);

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const logout = () => {
    const isTemp = currentSession?.type === 'temp_change_password';
    logSecurity('LOGOUT', `Session revoked: ${currentSession?.sessionId}`);
    setCurrentSession(null);
    setCurrentUser(null);
    if (isTemp) {
      return { success: true, message: 'Đã thoát khỏi bước đổi mật khẩu. Vui lòng đăng nhập lại.' };
    }
    return { success: true, message: 'Đăng xuất thành công!' };
  };

  const changePasswordFromProfile = (currentPass: string, newPass: string, confirmPass: string) => {
    if (!currentUser || !currentSession || currentSession.type !== 'admin') {
      return { success: false, message: 'Phiên làm việc đã kết thúc. Vui lòng đăng nhập lại.' };
    }

    const now = Date.now();
    if (currentUser.changePasswordLockUntil && currentUser.changePasswordLockUntil > now) {
      return { success: false, message: 'Tạm thời chưa thể đổi mật khẩu. Vui lòng thử lại sau.' };
    }

    if (!currentPass) return { success: false, message: 'Mật khẩu hiện tại là trường bắt buộc' };
    if (!newPass) return { success: false, message: 'Mật khẩu mới là trường bắt buộc' };
    if (!confirmPass) return { success: false, message: 'Xác nhận mật khẩu mới là trường bắt buộc' };

    if (newPass !== confirmPass) {
      return { success: false, message: 'Xác nhận mật khẩu không khớp.' };
    }

    if (newPass.length < 12) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 12 ký tự.' };
    }

    if (currentUser.passwordHash !== currentPass) {
      const fails = currentUser.failedChangePasswordAttempts + 1;
      let newLock: number | null = null;
      let msg = 'Mật khẩu hiện tại không chính xác.';
      if (fails >= 5) {
        newLock = now + 15 * 60 * 1000;
        msg = 'Nhập sai 5 lần liên tiếp. Tạm thời ngừng chức năng đổi mật khẩu trong 15 phút.';
      }
      const updatedUser = { ...currentUser, failedChangePasswordAttempts: fails, changePasswordLockUntil: newLock };
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      setCurrentUser(updatedUser);
      return { success: false, message: msg };
    }

    if (newPass === currentPass) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      passwordHash: newPass,
      authVersion: currentUser.authVersion + 1,
      failedChangePasswordAttempts: 0,
      changePasswordLockUntil: null
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    logSecurity('PASSWORD_CHANGED_PROFILE', `Password changed successfully for ${currentUser.username}`);
    return { success: true, message: 'Đổi mật khẩu thành công!' };
  };

  const requestPasswordResetEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, message: 'Email là trường bắt buộc' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { success: false, message: 'Email không đúng định dạng.' };
    }

    const user = users.find(u => u.email.toLowerCase() === trimmed.toLowerCase());
    let generatedToken: string | undefined = undefined;

    if (user) {
      const token = 'rst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
      const resetObj: PasswordResetToken = {
        token,
        email: user.email,
        authVersionAtIssue: user.authVersion,
        expiresAt: Date.now() + 15 * 60 * 1000,
        used: false,
        createdAt: Date.now()
      };
      setResetTokens(prev => [resetObj, ...prev]);
      generatedToken = token;
      logSecurity('PASSWORD_RESET_REQUESTED', `Reset link generated for verified email of ${user.username}`);
    }

    // Always return safe identical message (BR-UC.TK.04-02)
    return {
      success: true,
      message: 'Nếu email đã được liên kết với tài khoản hợp lệ, liên kết đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư đến hoặc thư rác.',
      generatedToken
    };
  };

  const resetPasswordWithToken = (token: string, newPass: string, confirmPass: string) => {
    const tokenObj = resetTokens.find(t => t.token === token);
    const now = Date.now();

    if (!tokenObj || tokenObj.used) {
      return { success: false, message: 'Liên kết không còn hiệu lực. Vui lòng yêu cầu liên kết mới.' };
    }

    if (tokenObj.expiresAt < now) {
      return { success: false, message: 'Liên kết đã hết hạn. Vui lòng yêu cầu liên kết mới.' };
    }

    const user = users.find(u => u.email.toLowerCase() === tokenObj.email.toLowerCase());
    if (!user || user.authVersion !== tokenObj.authVersionAtIssue) {
      return { success: false, message: 'Liên kết không còn hiệu lực do thông tin xác thực đã thay đổi.' };
    }

    if (!newPass) return { success: false, message: 'Mật khẩu mới là trường bắt buộc' };
    if (!confirmPass) return { success: false, message: 'Xác nhận mật khẩu mới là trường bắt buộc' };

    if (newPass !== confirmPass) {
      return { success: false, message: 'Xác nhận mật khẩu không khớp.' };
    }

    if (newPass.length < 12) {
      return { success: false, message: 'Mật khẩu mới có ít nhất 12 ký tự.' };
    }

    if (newPass === user.passwordHash) {
      return { success: false, message: 'Mật khẩu mới phải khác mật khẩu hiện tại.' };
    }

    // Update password
    const updatedUser: UserAccount = {
      ...user,
      passwordHash: newPass,
      authVersion: user.authVersion + 1,
      mustChangePasswordFirstLogin: false,
      failedLoginAttempts: 0,
      lockUntil: null
    };

    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setResetTokens(prev => prev.map(t => t.token === token ? { ...t, used: true } : t));
    logSecurity('PASSWORD_RESET_SUCCESS', `Password reset successful for ${user.username}`);

    return { success: true, message: 'Đặt lại mật khẩu thành công!' };
  };

  // ==================== CONFIG METHODS (UC-CH-01, UC-CH-02) ====================
  const activeBankAccount = bankAccounts.find(b => b.status === 'Đang sử dụng') || bankAccounts[0];

  const updateUtilityPrices = (
    electricPrice: number,
    waterPrice: number,
    serviceItems: ServiceFeeConfig[],
    effectivePeriod: string
  ) => {
    if (electricPrice <= 0 || waterPrice <= 0) return false;
    const historyItem: UtilityPriceHistory = {
      id: 'uph_' + Date.now(),
      changedAt: new Date().toISOString(),
      changedBy: currentUser?.fullName || 'Chủ nhà',
      effectivePeriod,
      electricityPrice: electricPrice,
      waterPrice: waterPrice,
      services: serviceItems
    };
    setServices(serviceItems);
    setPriceHistory(prev => [historyItem, ...prev]);
    logSecurity('CONFIG_PRICE_UPDATED', `Updated prices: Điện ${electricPrice}đ, Nước ${waterPrice}đ for ${effectivePeriod}`);
    return true;
  };

  const updateBankAccount = (bankName: string, accountNumber: string, accountHolder: string) => {
    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) return false;
    const newAccount: BankAccountConfig = {
      id: 'bank_' + Date.now(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim().toUpperCase(),
      status: 'Đang sử dụng',
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser?.fullName || 'Chủ nhà'
    };
    setBankAccounts(prev => [
      newAccount,
      ...prev.map(b => ({ ...b, status: 'Lịch sử' as const }))
    ]);
    logSecurity('CONFIG_BANK_UPDATED', `New active bank account: ${bankName} - ${accountNumber}`);
    return true;
  };

  // ==================== ROOM METHODS (QT01) ====================
  const addRoom = (roomCode: string, floor: number, area: number, note?: string) => {
    const code = roomCode.trim();
    if (!code) return { success: false, message: 'Mã phòng là trường bắt buộc.' };
    if (rooms.some(r => r.roomCode.toLowerCase() === code.toLowerCase())) {
      return { success: false, message: 'Mã phòng không hợp lệ hoặc đã tồn tại' };
    }
    if (floor < 0 || !Number.isInteger(floor)) {
      return { success: false, message: 'Tầng phải là số nguyên từ 0 trở lên.' };
    }
    if (area <= 0) {
      return { success: false, message: 'Diện tích phải là số dương lớn hơn 0.' };
    }
    if (note && note.length > 500) {
      return { success: false, message: 'Ghi chú không được vượt quá 500 ký tự.' };
    }

    const newRoom: Room = {
      id: 'rm_' + Date.now(),
      roomCode: code,
      floor,
      area,
      status: 'Trống',
      hasDeposit: false,
      firstMonthRentPaid: false,
      firstMonthPeriod: '',
      totalOccupants: 0,
      note: note || ''
    };

    setRooms(prev => [...prev, newRoom]);
    logSecurity('ROOM_CREATED', `Created room ${code}`);
    return { success: true, message: 'Thêm phòng thành công' };
  };

  const updateRoom = (roomCode: string, floor: number, area: number, note?: string) => {
    const room = rooms.find(r => r.roomCode === roomCode);
    if (!room) return { success: false, message: 'Không tìm thấy phòng.' };
    if (floor < 0 || !Number.isInteger(floor)) {
      return { success: false, message: 'Tầng phải là số nguyên từ 0 trở lên.' };
    }
    if (area <= 0) {
      return { success: false, message: 'Diện tích phải là số dương lớn hơn 0.' };
    }
    if (note && note.length > 500) {
      return { success: false, message: 'Ghi chú không được vượt quá 500 ký tự.' };
    }

    const logs: RoomHistoryLog[] = [];
    const now = new Date().toISOString();
    const user = currentUser?.fullName || 'Chủ nhà';

    if (room.floor !== floor) {
      logs.push({ id: 'rl_' + Math.random(), roomCode, field: 'Tầng', oldValue: String(room.floor), newValue: String(floor), changedBy: user, changedAt: now });
    }
    if (room.area !== area) {
      logs.push({ id: 'rl_' + Math.random(), roomCode, field: 'Diện tích', oldValue: String(room.area), newValue: String(area), changedBy: user, changedAt: now });
    }
    if (room.note !== note) {
      logs.push({ id: 'rl_' + Math.random(), roomCode, field: 'Ghi chú', oldValue: room.note || '', newValue: note || '', changedBy: user, changedAt: now });
    }

    setRooms(prev => prev.map(r => r.roomCode === roomCode ? { ...r, floor, area, note: note || '' } : r));
    if (logs.length > 0) setRoomHistory(prev => [...logs, ...prev]);

    return { success: true, message: 'Cập nhật thông tin phòng thành công' };
  };

  const recordInitialPaymentPH07 = (params: {
    roomCode: string;
    leaseId: string;
    contractId: string;
    depositAmount: number;
    firstMonthRentAmount: number;
    actualAmount: number;
    receivedDate: string;
    transactionCode: string;
    bankAccountReceived: string;
    proofFile?: string;
  }) => {
    const totalRequired = params.depositAmount + params.firstMonthRentAmount;
    if (params.actualAmount !== totalRequired) {
      return { success: false, message: `Số tiền thực nhận (${params.actualAmount.toLocaleString('vi-VN')} đ) không khớp tổng 1 tháng cọc + 1 tháng tiền thuê (${totalRequired.toLocaleString('vi-VN')} đ).` };
    }

    setContracts(prev => prev.map(c => c.id === params.contractId ? {
      ...c,
      firstMonthRentPaid: true
    } : c));

    setRooms(prev => prev.map(r => r.roomCode === params.roomCode ? {
      ...r,
      hasDeposit: true,
      firstMonthRentPaid: true
    } : r));

    logSecurity('PH07_PAYMENT_RECORDED', `Room ${params.roomCode} recorded deposit & 1st month rent via txn ${params.transactionCode}`);
    return { success: true, message: 'Ghi nhận hoàn tất một tháng tiền cọc và một tháng tiền thuê đầu thành công!' };
  };

  const confirmCheckInPH05 = (roomCode: string, leaseId: string, actualCheckInDate: string) => {
    const room = rooms.find(r => r.roomCode === roomCode);
    const contract = contracts.find(c => c.leaseId === leaseId);
    const report = handoverReports.find(h => h.leaseId === leaseId && h.status === 'Đã xác nhận');

    if (!contract || contract.status !== 'Hiệu lực' && contract.status !== 'Đã ký') {
      return { success: false, message: 'Hợp đồng chưa ký hoặc chưa có hiệu lực.' };
    }
    if (!contract.firstMonthRentPaid || !room?.firstMonthRentPaid) {
      return { success: false, message: 'Chưa thu đủ 1 tháng tiền cọc và 1 tháng tiền thuê đầu tại UC-PH-07.' };
    }
    if (!report) {
      return { success: false, message: 'Biên bản nhận phòng UC-BG03 chưa ở trạng thái Đã xác nhận (chưa có chữ ký tay hai bên).' };
    }

    setRooms(prev => prev.map(r => r.roomCode === roomCode ? {
      ...r,
      status: 'Đang thuê',
      currentTenantId: contract.tenantId,
      currentTenantName: contract.tenantName,
      contractStartDate: contract.startDate,
      contractEndDate: contract.endDate,
      currentContractId: contract.id,
      currentLeaseId: contract.leaseId,
      totalOccupants: Math.max(1, r.totalOccupants)
    } : r));

    setContracts(prev => prev.map(c => c.id === contract.id ? {
      ...c,
      status: 'Hiệu lực',
      actualCheckInDate
    } : c));

    logSecurity('PH05_CHECKIN_CONFIRMED', `Room ${roomCode} checked in successfully. Status -> Đang thuê`);
    return { success: true, message: 'Xác nhận nhận phòng hoàn tất! Phòng đã chuyển sang trạng thái Đang thuê.' };
  };

  const updateExpectedReturnDatePH11_12 = (params: {
    roomCode: string;
    leaseId: string;
    expectedDate: string;
    confirmSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    confirmedAt: string;
    exchangeContent: string;
    reason?: string;
  }) => {
    const room = rooms.find(r => r.roomCode === params.roomCode);
    if (!room) return { success: false, message: 'Không tìm thấy phòng.' };

    const expDate = new Date(params.expectedDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Threshold 15 days rule (BR-UC.PH.04-05, BR-UC.PH.11-03)
    const newStatus = diffDays <= 15 ? 'Sắp trả' : 'Đang thuê';

    setRooms(prev => prev.map(r => r.roomCode === params.roomCode ? {
      ...r,
      expectedReturnDate: params.expectedDate,
      status: newStatus
    } : r));

    const newLog: ReturnPlanLog = {
      id: 'rp_' + Date.now(),
      roomCode: params.roomCode,
      leaseId: params.leaseId,
      expectedDate: params.expectedDate,
      oldDate: room.expectedReturnDate,
      reason: params.reason,
      confirmSource: params.confirmSource,
      confirmedAt: params.confirmedAt,
      exchangeContent: params.exchangeContent,
      loggedBy: currentUser?.fullName || 'Chủ nhà',
      loggedAt: new Date().toISOString(),
      status: 'Còn theo dõi'
    };

    setReturnPlans(prev => [newLog, ...prev]);
    logSecurity('RETURN_DATE_RECORDED', `Room ${params.roomCode} return date: ${params.expectedDate} (diff: ${diffDays}d -> ${newStatus})`);
    return { success: true, message: `Đã lưu ngày dự kiến trả phòng. Trạng thái phòng hiện tại: ${newStatus}` };
  };

  const recordTenantContactPH13 = (params: {
    roomCode: string;
    leaseId: string;
    contactTimeActual: string;
    contactSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
    contactResult: 'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê';
    content: string;
    nextContactDate?: string;
  }) => {
    const newLog: TenantContactLog = {
      id: 'tc_' + Date.now(),
      roomCode: params.roomCode,
      leaseId: params.leaseId,
      contactTimeActual: params.contactTimeActual,
      systemInputTime: new Date().toISOString(),
      contactSource: params.contactSource,
      contactResult: params.contactResult,
      content: params.content,
      nextContactDate: params.nextContactDate,
      loggedBy: currentUser?.fullName || 'Chủ nhà'
    };
    setContactLogs(prev => [newLog, ...prev]);
    return { success: true, message: 'Đã lưu ghi nhận liên hệ khách thuê.' };
  };

  const confirmReturnStep305AndVacantPH08 = (roomCode: string, leaseId: string) => {
    const inspection = returnInspections.find(i => i.roomCode === roomCode && i.leaseId === leaseId);
    if (!inspection || inspection.step304Status !== 'Đã nhận lại' || !inspection.step305Confirmed) {
      return { success: false, message: 'Chưa có kết quả nhận lại thực tế được Chủ nhà xác nhận độc lập tại ASIS-02 bước 3.05.' };
    }

    setRooms(prev => prev.map(r => r.roomCode === roomCode ? {
      ...r,
      status: 'Trống',
      hasDeposit: false,
      firstMonthRentPaid: false,
      firstMonthPeriod: '',
      currentTenantId: undefined,
      currentTenantName: undefined,
      contractStartDate: undefined,
      contractEndDate: undefined,
      currentContractId: undefined,
      currentLeaseId: undefined,
      expectedReturnDate: undefined,
      totalOccupants: 0
    } : r));

    logSecurity('PH08_ROOM_VACATED', `Room ${roomCode} marked Trống following 3.05 handover confirmation.`);
    return { success: true, message: 'Cập nhật trạng thái Trống thành công! Ngày kết thúc thuê thực tế đã được lưu.' };
  };

  // ==================== HANDOVER & ASSETS METHODS (QT02) ====================
  const saveInventoryBG01 = (record: InventoryRecord) => {
    setInventoryRecords(prev => {
      const idx = prev.findIndex(r => r.roomCode === record.roomCode && r.expectedBatchCode === record.expectedBatchCode);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });
    logSecurity('INVENTORY_SAVED', `Room ${record.roomCode} inventory saved. Status: ${record.inventoryStatus}`);
  };

  const saveHandoverReportBG03 = (report: HandoverReport) => {
    setHandoverReports(prev => {
      const idx = prev.findIndex(r => r.id === report.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = report;
        return updated;
      }
      return [report, ...prev];
    });
  };

  const confirmHandoverSignaturesBG03 = (reportId: string, tenantSigned: boolean, ownerSigned: boolean, paperLocation?: string) => {
    setHandoverReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      const bothSigned = tenantSigned && ownerSigned;
      return {
        ...r,
        tenantSignedPaper: tenantSigned ? 'Đã ký giấy' : 'Chưa ký',
        ownerSignedPaper: ownerSigned ? 'Đã ký giấy' : 'Chưa ký',
        status: bothSigned ? 'Đã xác nhận' : r.status,
        paperLocation: paperLocation || r.paperLocation,
        confirmedAt: bothSigned ? new Date().toISOString() : r.confirmedAt
      };
    }));
  };

  const recordIncidentBG04 = (incident: AssetIncident) => {
    setIncidents(prev => {
      const idx = prev.findIndex(i => i.id === incident.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = incident;
        return updated;
      }
      return [incident, ...prev];
    });
  };

  const recordReturnInspectionBG09 = (inspection: ReturnInspection) => {
    setReturnInspections(prev => {
      const idx = prev.findIndex(i => i.id === inspection.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = inspection;
        return updated;
      }
      return [inspection, ...prev];
    });
  };

  const confirmReturnInspectionStep305 = (roomCode: string, leaseId: string, evidence: string) => {
    setReturnInspections(prev => prev.map(i => {
      if (i.roomCode === roomCode && i.leaseId === leaseId) {
        return {
          ...i,
          step304Status: 'Đã nhận lại',
          step305Confirmed: true,
          step305ConfirmedAt: new Date().toISOString(),
          step305ConfirmedBy: currentUser?.fullName || 'Chủ nhà',
          step305Evidence: evidence
        };
      }
      return i;
    }));
    logSecurity('BG09_STEP305_CONFIRMED', `Handover return confirmed 3.05 for room ${roomCode}`);
  };

  const saveAssetComparisonResultBG07 = (result: AssetComparisonResult) => {
    setAssetComparisonResults(prev => {
      const idx = prev.findIndex(r => r.id === result.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = result;
        return updated;
      }
      return [result, ...prev];
    });
  };

  const saveHandoverReturnReportBG11 = (report: HandoverReturnReport) => {
    setHandoverReturnReports(prev => {
      const idx = prev.findIndex(r => r.id === report.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = report;
        return updated;
      }
      return [report, ...prev];
    });
  };

  const confirmFinalReturnReportBG11 = (reportId: string, tenantSignedStatus: 'Khách đã ký' | 'Khách không ký', notSignReason?: string) => {
    setHandoverReturnReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        tenantSignedPaper: tenantSignedStatus,
        tenantNotSignReason: notSignReason,
        ownerSignedPaper: 'Đã ký',
        status: 'Đã xác nhận',
        confirmedAt: new Date().toISOString()
      };
    }));
  };

  // ==================== TENANTS METHODS (QT03) ====================
  const addTenantHSKT01 = (tenantData: Omit<Tenant, 'id' | 'createdAt' | 'createdBy'>) => {
    // Check duplicates
    if (tenantData.idNumber && tenants.some(t => t.idNumber && t.idNumber === tenantData.idNumber)) {
      return { success: false, message: 'Số định danh CCCD đã tồn tại trong hệ thống.' };
    }
    const newTenant: Tenant = {
      ...tenantData,
      id: 'ten_' + Date.now(),
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.fullName || 'Chủ nhà'
    };
    setTenants(prev => [...prev, newTenant]);
    logSecurity('TENANT_CREATED', `Created tenant ${newTenant.fullName}`);
    return { success: true, tenantId: newTenant.id, message: 'Tạo hồ sơ khách thuê thành công!' };
  };

  const addCoTenantHSKT02 = (coTenant: Omit<CoTenant, 'id'>) => {
    const newCoTenant: CoTenant = {
      ...coTenant,
      id: 'coten_' + Date.now()
    };
    setCoTenants(prev => [...prev, newCoTenant]);
  };

  const updateCoTenantStatusHSKT02 = (coTenantId: string, status: 'Đang cư trú' | 'Đã kết thúc', actualDate?: string, evidence?: string) => {
    setCoTenants(prev => prev.map(c => {
      if (c.id !== coTenantId) return c;
      if (status === 'Đang cư trú') {
        return {
          ...c,
          status,
          actualArrivalDate: actualDate || new Date().toISOString().split('T')[0],
          arrivalVerificationEvidence: evidence || c.arrivalVerificationEvidence
        };
      }
      return {
        ...c,
        status,
        departureDate: actualDate || new Date().toISOString().split('T')[0]
      };
    }));
  };

  const verifyTenantProposalHSKT03 = (proposal: TenantChangeProposal) => {
    setTenantProposals(prev => [proposal, ...prev]);
  };

  const applyTenantUpdateHSKT04 = (tenantId: string, updatedFields: Partial<Tenant>) => {
    setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, ...updatedFields } : t));
    setTenantHistory(prev => [{
      id: 'th_' + Date.now(),
      tenantId,
      action: 'Cập nhật thông tin khách thuê',
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.fullName || 'Chủ nhà',
      newValues: JSON.stringify(updatedFields)
    }, ...prev]);
  };

  // ==================== CONTRACTS (QT04) ====================
  const addBatchSchedule = (batch: BatchSchedule) => {
    setBatchSchedules(prev => {
      const idx = prev.findIndex(b => b.batchCode === batch.batchCode);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = batch;
        return u;
      }
      return [...prev, batch];
    });
  };

  const createContractDraftHDT02 = (contractData: Omit<Contract, 'id' | 'status' | 'isSignedPaper' | 'version'>) => {
    const contractId = 'HD-' + contractData.roomCode.replace(/\D/g, '') + '-' + Date.now().toString().slice(-4);
    const newContract: Contract = {
      ...contractData,
      id: contractId,
      status: 'Nháp',
      isSignedPaper: false,
      version: 1
    };
    setContracts(prev => [...prev, newContract]);
    logSecurity('CONTRACT_DRAFT_CREATED', `Contract draft ${contractId} created for room ${contractData.roomCode}`);
    return { success: true, contractId, message: 'Lập hợp đồng dự thảo thành công!' };
  };

  const confirmContractSignedHDT04 = (contractId: string, signedDate: string, proofFiles: string[]) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract) return { success: false, message: 'Không tìm thấy hợp đồng.' };

    const startDate = new Date(contract.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const hasEffective = now >= startDate;

    setContracts(prev => prev.map(c => c.id === contractId ? {
      ...c,
      status: hasEffective ? 'Hiệu lực' : 'Chờ hiệu lực',
      isSignedPaper: true,
      signedDate,
      signedProofFiles: proofFiles
    } : c));

    logSecurity('CONTRACT_SIGNED_HDT04', `Contract ${contractId} signed. Effective: ${hasEffective}`);
    return { success: true, message: 'Ghi nhận hợp đồng đã ký thành công!' };
  };

  const createRenewalContractHDT06 = (params: {
    previousContractId: string;
    roomCode: string;
    tenantId: string;
    tenantName: string;
    batchCode: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    terms: string;
  }) => {
    const prevContract = contracts.find(c => c.id === params.previousContractId);
    if (!prevContract) return { success: false, message: 'Không tìm thấy hợp đồng cũ.' };

    const newId = 'HD-' + params.roomCode.replace(/\D/g, '') + '-GIAHAN-' + Date.now().toString().slice(-4);
    const renewalContract: Contract = {
      id: newId,
      contractType: 'Hợp đồng nối tiếp',
      leaseId: prevContract.leaseId, // Cùng chuỗi lần thuê
      roomCode: params.roomCode,
      tenantId: params.tenantId,
      tenantName: params.tenantName,
      batchCode: params.batchCode,
      startDate: params.startDate,
      endDate: params.endDate,
      monthlyRent: params.monthlyRent,
      depositAmount: prevContract.depositAmount, // Kế thừa cọc gốc
      firstMonthRentAmount: params.monthlyRent,
      firstMonthRentPaid: true, // Không thu lại cọc hay tiền thuê kỳ đầu
      paymentMethod: 'Chuyển khoản',
      terms: params.terms,
      status: 'Nháp',
      isSignedPaper: false,
      previousContractId: prevContract.id,
      initialDepositCode: prevContract.initialDepositCode || 'COC-' + params.roomCode,
      version: 1
    };

    setContracts(prev => [...prev, renewalContract]);
    logSecurity('RENEWAL_CONTRACT_CREATED', `Renewal contract ${newId} created for room ${params.roomCode}`);
    return { success: true, contractId: newId, message: 'Lập hợp đồng nối tiếp thành công (kế thừa cọc gốc)!' };
  };

  const activateRenewalContractHDT07 = (contractId: string, signedDate: string, proofFiles: string[]) => {
    const contract = contracts.find(c => c.id === contractId);
    if (!contract || !contract.previousContractId) {
      return { success: false, message: 'Hợp đồng không hợp lệ.' };
    }

    // Terminate old contract
    setContracts(prev => prev.map(c => {
      if (c.id === contract.previousContractId) {
        return { ...c, status: 'Kết thúc' };
      }
      if (c.id === contractId) {
        return {
          ...c,
          status: 'Hiệu lực',
          isSignedPaper: true,
          signedDate,
          signedProofFiles: proofFiles
        };
      }
      return c;
    }));

    // Auto-cancel old return plan (BR-UC.PH.14-01)
    setRooms(prev => prev.map(r => r.roomCode === contract.roomCode ? {
      ...r,
      status: 'Đang thuê',
      expectedReturnDate: undefined,
      returnPlanCancelled: true,
      returnPlanCancelReason: 'Đã hủy do gia hạn'
    } : r));

    logSecurity('RENEWAL_ACTIVATED_HDT07', `Renewal contract ${contractId} activated. Old contract closed, return plan cancelled.`);
    return { success: true, message: 'Kích hoạt hợp đồng nối tiếp thành công! Kế hoạch trả cũ đã tự hủy do gia hạn.' };
  };

  // ==================== DEPOSIT SETTLEMENT (QT05) ====================
  const saveSettlementSlipQTC01 = (slip: DepositSettlementSlip) => {
    setSettlementSlips(prev => {
      const idx = prev.findIndex(s => s.id === slip.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = slip;
        return u;
      }
      return [slip, ...prev];
    });
  };

  const updateSettlementFeedbackQTC02 = (
    slipId: string,
    feedback: 'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được',
    reason?: string,
    deductionUpdates?: { id: string; amount: number }[]
  ) => {
    setSettlementSlips(prev => prev.map(s => {
      if (s.id !== slipId) return s;

      let deductions = s.deductions;
      if (deductionUpdates) {
        deductions = deductions.map(d => {
          const upd = deductionUpdates.find(u => u.id === d.id);
          return upd ? { ...d, amount: upd.amount } : d;
        });
      }

      const totalDed = deductions.reduce((sum, d) => sum + d.amount, 0);
      const calculated = s.initialDepositAmount - totalDed;

      let newStatus: DepositSettlementSlip['status'] = s.status;
      if (feedback === 'Đồng ý') newStatus = 'Khách đồng ý';
      else if (feedback === 'Không đồng ý') newStatus = 'Không đồng ý';
      else if (feedback === 'Không liên hệ được') newStatus = 'Không liên hệ được';

      return {
        ...s,
        tenantFeedback: feedback,
        disputeReason: reason || s.disputeReason,
        deductions,
        calculatedResult: calculated,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const confirmSettlementTransferReceiptQTC03 = (
    slipId: string,
    receipt: DepositSettlementSlip['transferReceipt']
  ) => {
    const slip = settlementSlips.find(s => s.id === slipId);
    if (!slip) return { success: false, message: 'Không tìm thấy phiếu quyết toán.' };
    if (slip.status !== 'Khách đồng ý') {
      return { success: false, message: 'Chỉ ghi nhận kết quả khi khách đã đồng ý phương án quyết toán.' };
    }

    setSettlementSlips(prev => prev.map(s => s.id === slipId ? {
      ...s,
      transferReceipt: receipt,
      status: 'Đã có 5.8 – chờ ký biên bản',
      step58Published: true,
      step58PublishedAt: new Date().toISOString()
    } : s));

    logSecurity('SETTLEMENT_CONFIRMED_QTC03', `Settlement ${slipId} confirmed. Published 5.8.`);
    return { success: true, message: 'Ghi nhận kết quả quyết toán cọc thành công! Đã phát hành kết quả 5.8.' };
  };

  // ==================== BILLING (QT06) ====================
  const saveMeterReadingTT01 = (reading: MeterReading) => {
    setMeterReadings(prev => {
      const idx = prev.findIndex(m => m.id === reading.id);
      if (idx >= 0) {
        const u = [...prev];
        u[idx] = reading;
        return u;
      }
      return [reading, ...prev];
    });
  };

  const updateMeterReadingTT02 = (readingId: string, updates: Partial<MeterReading>, reason: string) => {
    setMeterReadings(prev => prev.map(m => m.id === readingId ? {
      ...m,
      ...updates,
      status: 'Nháp – điều chỉnh',
      needsRecalculateFlag: true
    } : m));
    logSecurity('METER_READING_UPDATED_TT02', `Reading ${readingId} updated: ${reason}`);
  };

  const generatePeriodBillTT03 = (roomCode: string, periodCode: string) => {
    const room = rooms.find(r => r.roomCode === roomCode);
    if (!room) return { success: false, message: 'Không tìm thấy phòng.' };

    const reading = meterReadings.find(m => m.roomCode === roomCode && m.periodCode === periodCode);
    if (!reading) {
      return { success: false, message: `Chưa có chỉ số điện nước cho ${periodCode}.` };
    }
    if (reading.pendingVerificationFlag) {
      return { success: false, message: 'Chỉ số điện nước đang chờ xác minh bất thường (UC-TT-01 AF-02). Chưa thể tính tiền.' };
    }

    const price = priceHistory[0] || INITIAL_PRICE_HISTORY[0];

    const elecUsage = reading.verifiedElectricKwh !== undefined ? reading.verifiedElectricKwh : Math.max(0, reading.finalElectricKwh - reading.initialElectricKwh);
    const waterUsage = reading.verifiedWaterM3 !== undefined ? reading.verifiedWaterM3 : Math.max(0, reading.finalWaterM3 - reading.initialWaterM3);

    const elecAmount = elecUsage * price.electricityPrice;
    const waterAmount = waterUsage * price.waterPrice;

    const srvFees = price.services.filter(s => s.status === 'Đang áp dụng').map(s => ({
      name: s.name,
      amount: s.amount
    }));

    const totalSrv = srvFees.reduce((sum, s) => sum + s.amount, 0);

    // Tiền thuê kỳ tiếp theo
    const contract = contracts.find(c => c.roomCode === roomCode && c.status === 'Hiệu lực');
    const nextRent = room.status === 'Trống' ? 0 : (contract?.monthlyRent || 3500000);

    const totalAmount = nextRent + elecAmount + waterAmount + totalSrv;

    const newBill: PeriodBill = {
      id: 'bill_' + roomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
      roomCode,
      leaseId: room.currentLeaseId || 'THUE-' + roomCode,
      periodCode,
      servicePeriodFrom: '2026-09-01',
      servicePeriodTo: '2026-09-30',
      nextRentPeriodFrom: '2026-10-01',
      nextRentPeriodTo: '2026-10-31',
      isRentPeriodEnded: room.status === 'Trống',
      nextMonthRentAmount: nextRent,
      electricityUsage: elecUsage,
      electricityRate: price.electricityPrice,
      electricityAmount: elecAmount,
      waterUsage: waterUsage,
      waterRate: price.waterPrice,
      waterAmount: waterAmount,
      serviceFees: srvFees,
      totalAmount,
      isConfirmed: false,
      version: 1
    };

    setPeriodBills(prev => [newBill, ...prev]);
    return { success: true, billId: newBill.id, message: 'Tính tiền kỳ thành công (Bản nháp)!' };
  };

  const confirmPeriodBillTT03 = (billId: string) => {
    setPeriodBills(prev => prev.map(b => b.id === billId ? {
      ...b,
      isConfirmed: true,
      confirmedAt: new Date().toISOString()
    } : b));
  };

  // ==================== PAYMENT NOTICES (QT07) ====================
  const generatePaymentNotice07_2 = (billId: string, dueDate: string) => {
    const bill = periodBills.find(b => b.id === billId);
    if (!bill || !bill.isConfirmed) {
      return { success: false, message: 'Bảng tính tiền chưa được xác nhận tại UC-TT-03.' };
    }

    const bank = activeBankAccount || INITIAL_BANK_ACCOUNTS[0];

    const noticeId = 'not_' + bill.roomCode.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4);
    const noticeCode = 'TB-' + bill.roomCode.replace(/\D/g, '') + '-' + bill.periodCode.replace(/\D/g, '');

    const notice: PaymentNotice = {
      id: noticeId,
      noticeCode,
      roomCode: bill.roomCode,
      leaseId: bill.leaseId,
      periodCode: bill.periodCode,
      servicePeriod: `${bill.servicePeriodFrom} - ${bill.servicePeriodTo}`,
      nextRentPeriod: `${bill.nextRentPeriodFrom} - ${bill.nextRentPeriodTo}`,
      dueDate,
      originalDueDate: dueDate,
      totalAmount: bill.totalAmount,
      status: 'Đang hiệu lực',
      paymentStatus: 'Chưa thu',
      qrBankSnapshot: {
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder,
        transferContent: `${bill.roomCode.replace(/\D/g, '')} ${bill.periodCode}`,
        amount: bill.totalAmount
      },
      createdAt: new Date().toISOString()
    };

    setPaymentNotices(prev => [notice, ...prev]);
    logSecurity('PAYMENT_NOTICE_CREATED', `Notice ${noticeCode} created with amount ${bill.totalAmount} đ`);
    return { success: true, noticeId, message: 'Lập thông báo thanh toán và mã QR thành công!' };
  };

  const replacePaymentNotice07_2 = (oldNoticeId: string) => {
    const oldNotice = paymentNotices.find(n => n.id === oldNoticeId);
    if (!oldNotice) return { success: false, message: 'Không tìm thấy thông báo cũ.' };
    if (oldNotice.paymentStatus === 'Đã thu') {
      return { success: false, message: 'Thông báo đã thanh toán, không được thay thế.' };
    }

    const bank = activeBankAccount || INITIAL_BANK_ACCOUNTS[0];
    const newId = 'not_' + Date.now();
    const newNotice: PaymentNotice = {
      ...oldNotice,
      id: newId,
      noticeCode: oldNotice.noticeCode + '-R',
      dueDate: oldNotice.originalDueDate, // Giữ nguyên hạn gốc
      qrBankSnapshot: {
        ...oldNotice.qrBankSnapshot,
        bankName: bank.bankName,
        accountNumber: bank.accountNumber,
        accountHolder: bank.accountHolder
      },
      status: 'Đang hiệu lực',
      createdAt: new Date().toISOString()
    };

    setPaymentNotices(prev => [
      newNotice,
      ...prev.map(n => n.id === oldNoticeId ? {
        ...n,
        status: 'Đã thay thế' as const,
        replacedByNoticeId: newId
      } : n)
    ]);

    logSecurity('PAYMENT_NOTICE_REPLACED', `Replaced notice ${oldNotice.noticeCode} with ${newNotice.noticeCode}`);
    return { success: true, noticeId: newId, message: 'Đã phát hành thông báo thay thế và vô hiệu hóa mã QR cũ!' };
  };

  // ==================== PAYMENT RECEIPTS (QT08) ====================
  const confirmPaymentReceipt08_2 = (
    noticeId: string,
    amount: number,
    receivedDate: string,
    transactionCode: string,
    bankAccountReceived: string,
    proofFile?: string
  ) => {
    const notice = paymentNotices.find(n => n.id === noticeId);
    if (!notice) return { success: false, message: 'Không tìm thấy thông báo thanh toán.' };

    if (amount !== notice.totalAmount) {
      return { success: false, message: `Số tiền thực nhận (${amount.toLocaleString('vi-VN')} đ) phải đúng đủ tổng tiền trên thông báo (${notice.totalAmount.toLocaleString('vi-VN')} đ). Không chấp nhận trả một phần.` };
    }

    const receiptId = 'rcp_' + Date.now();
    const receipt: PaymentReceipt = {
      id: receiptId,
      noticeId,
      roomCode: notice.roomCode,
      leaseId: notice.leaseId,
      periodCode: notice.periodCode,
      amountReceived: amount,
      receivedDate,
      transactionCode,
      bankAccountReceived,
      proofFile,
      status: 'Đang hiệu lực',
      confirmedBy: currentUser?.fullName || 'Chủ nhà',
      confirmedAt: new Date().toISOString()
    };

    setPaymentReceipts(prev => [receipt, ...prev]);
    setPaymentNotices(prev => prev.map(n => n.id === noticeId ? {
      ...n,
      paymentStatus: 'Đã thu'
    } : n));

    logSecurity('PAYMENT_CONFIRMED_08_2', `Notice ${notice.noticeCode} marked Đã thu via txn ${transactionCode}`);
    return { success: true, message: 'Xác nhận thu tiền thành công! Toàn bộ khoản đã chuyển sang Đã thu.' };
  };

  const revertPaymentReceipt08_2 = (receiptId: string, reason: string) => {
    const receipt = paymentReceipts.find(r => r.id === receiptId);
    if (!receipt) return { success: false, message: 'Không tìm thấy chứng từ thu tiền.' };
    if (!reason.trim()) return { success: false, message: 'Lý do sửa xác nhận thu nhầm là bắt buộc.' };

    setPaymentReceipts(prev => prev.map(r => r.id === receiptId ? {
      ...r,
      status: 'Không còn hiệu lực',
      invalidatedReason: reason,
      invalidatedAt: new Date().toISOString()
    } : r));

    setPaymentNotices(prev => prev.map(n => n.id === receipt.noticeId ? {
      ...n,
      paymentStatus: 'Chưa thu'
    } : n));

    logSecurity('PAYMENT_REVERTED_08_2', `Receipt ${receiptId} invalidated: ${reason}`);
    return { success: true, message: 'Đã sửa xác nhận thu nhầm. Thông báo đã quay lại trạng thái Chưa thu.' };
  };

  // ==================== DEBTS (QT09) ====================
  const recordDebtReminder09_2 = (reminder: Omit<DebtHistoryReminder, 'id' | 'loggedAt' | 'loggedBy'>) => {
    const newRem: DebtHistoryReminder = {
      ...reminder,
      id: 'drm_' + Date.now(),
      loggedAt: new Date().toISOString(),
      loggedBy: currentUser?.fullName || 'Chủ nhà'
    };
    setDebtReminders(prev => [newRem, ...prev]);
  };

  const recordDebtPromise09_3 = (promise: Omit<DebtPromise, 'id' | 'loggedAt' | 'loggedBy'>) => {
    const newProm: DebtPromise = {
      ...promise,
      id: 'dpr_' + Date.now(),
      loggedAt: new Date().toISOString(),
      loggedBy: currentUser?.fullName || 'Chủ nhà'
    };
    setDebtPromises(prev => [newProm, ...prev]);
  };

  const resetAllToSeedData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentSession({
      sessionId: 'sess_init_' + Date.now(),
      userId: INITIAL_USERS[0].id,
      username: INITIAL_USERS[0].username,
      role: INITIAL_USERS[0].role,
      type: 'admin',
      expiresAt: Date.now() + 30 * 60 * 1000,
      createdAt: Date.now()
    });
    setServices(INITIAL_SERVICES);
    setPriceHistory(INITIAL_PRICE_HISTORY);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setBatchSchedules(INITIAL_BATCH_SCHEDULES);
    setRooms(INITIAL_ROOMS);
    setRoomHistory([]);
    setReturnPlans([]);
    setContactLogs([]);
    setInventoryRecords(INITIAL_INVENTORY_RECORDS);
    setHandoverReports(INITIAL_HANDOVER_REPORTS);
    setIncidents(INITIAL_INCIDENTS);
    setReturnInspections(INITIAL_RETURN_INSPECTIONS);
    setAssetComparisonResults([]);
    setHandoverReturnReports([]);
    setTenants(INITIAL_TENANTS);
    setCoTenants(INITIAL_CO_TENANTS);
    setTenantProposals([]);
    setTenantHistory([]);
    setContracts(INITIAL_CONTRACTS);
    setSettlementSlips(INITIAL_SETTLEMENT_SLIPS);
    setMeterReadings(INITIAL_METER_READINGS);
    setPeriodBills(INITIAL_PERIOD_BILLS);
    setPaymentNotices(INITIAL_PAYMENT_NOTICES);
    setPaymentReceipts(INITIAL_PAYMENT_RECEIPTS);
    setDebtReminders(INITIAL_DEBT_REMINDERS);
    setDebtPromises(INITIAL_DEBT_PROMISES);
    setSecurityLogs([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      currentSession,
      authNotification,
      setAuthNotification,
      login,
      changePasswordFirstLogin,
      logout,
      changePasswordFromProfile,
      requestPasswordResetEmail,
      resetPasswordWithToken,
      resetTokens,

      services,
      priceHistory,
      bankAccounts,
      activeBankAccount,
      updateUtilityPrices,
      updateBankAccount,

      rooms,
      roomHistory,
      returnPlans,
      contactLogs,
      addRoom,
      updateRoom,
      recordInitialPaymentPH07,
      confirmCheckInPH05,
      updateExpectedReturnDatePH11_12,
      recordTenantContactPH13,
      confirmReturnStep305AndVacantPH08,

      standardAssets,
      inventoryRecords,
      handoverReports,
      incidents,
      returnInspections,
      assetComparisonResults,
      handoverReturnReports,
      saveInventoryBG01,
      saveHandoverReportBG03,
      confirmHandoverSignaturesBG03,
      recordIncidentBG04,
      recordReturnInspectionBG09,
      confirmReturnInspectionStep305,
      saveAssetComparisonResultBG07,
      saveHandoverReturnReportBG11,
      confirmFinalReturnReportBG11,

      tenants,
      coTenants,
      tenantProposals,
      tenantHistory,
      addTenantHSKT01,
      addCoTenantHSKT02,
      updateCoTenantStatusHSKT02,
      verifyTenantProposalHSKT03,
      applyTenantUpdateHSKT04,

      contracts,
      batchSchedules,
      addBatchSchedule,
      createContractDraftHDT02,
      confirmContractSignedHDT04,
      createRenewalContractHDT06,
      activateRenewalContractHDT07,

      settlementSlips,
      saveSettlementSlipQTC01,
      updateSettlementFeedbackQTC02,
      confirmSettlementTransferReceiptQTC03,

      meterReadings,
      periodBills,
      saveMeterReadingTT01,
      updateMeterReadingTT02,
      generatePeriodBillTT03,
      confirmPeriodBillTT03,

      paymentNotices,
      generatePaymentNotice07_2,
      replacePaymentNotice07_2,

      paymentReceipts,
      confirmPaymentReceipt08_2,
      revertPaymentReceipt08_2,

      debtReminders,
      debtPromises,
      recordDebtReminder09_2,
      recordDebtPromise09_3,

      securityLogs,
      logSecurity,
      resetAllToSeedData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
