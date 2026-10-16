/**
 * Bộ định nghĩa kiểu dữ liệu hoàn chỉnh cho Hệ thống Quản lý Chung cư Mini
 * Đáp ứng đầy đủ Mục 0 và Quy trình 01 đến 10 theo đặc tả
 */

// ==================== MỤC 0: TÀI KHOẢN & BẢO MẬT ====================
export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string; // Email khôi phục đã xác minh
  role: 'Chủ nhà' | 'Quản lý';
  mustChangePasswordFirstLogin: boolean;
  failedLoginAttempts: number;
  lockUntil: number | null; // Timestamp tạm khóa 15 phút sau 5 lần sai
  failedChangePasswordAttempts: number;
  changePasswordLockUntil: number | null; // Timestamp tạm ngừng đổi mật khẩu 15 phút sau 5 lần sai
  authVersion: number; // Phiên bản xác thực
  passwordHash: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  username: string;
  role: 'Chủ nhà' | 'Quản lý';
  type: 'temp_change_password' | 'admin';
  expiresAt: number; // 30 phút không hoạt động
  createdAt: number;
}

export interface PasswordResetToken {
  token: string;
  email: string;
  authVersionAtIssue: number;
  expiresAt: number; // 15 phút
  used: boolean;
  createdAt: number;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?: string;
}

// ==================== MỤC 0.2: CẤU HÌNH THU TIỀN ====================
export interface ServiceFeeConfig {
  id: string;
  name: string;
  unit: string;
  amount: number; // Phí cố định theo phòng/kỳ
  status: 'Đang áp dụng' | 'Ngừng áp dụng';
}

export interface UtilityPriceHistory {
  id: string;
  changedAt: string;
  changedBy: string;
  effectivePeriod: string;
  electricityPrice: number; // đồng/kWh
  waterPrice: number; // đồng/m3
  services: ServiceFeeConfig[];
}

export interface BankAccountConfig {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  status: 'Đang sử dụng' | 'Lịch sử';
  updatedAt: string;
  updatedBy: string;
}

// ==================== QUY TRÌNH 01: QUẢN LÝ PHÒNG ====================
export type RoomStatus = 'Trống' | 'Đang thuê' | 'Sắp trả';

export type ContractExpiryBadge = 
  | 'Còn hạn' // > 30 ngày
  | 'Sắp hết hạn hợp đồng' // 1-30 ngày
  | 'Đến hạn hôm nay' // 0 ngày
  | 'Đã hết hạn hợp đồng' // < 0 ngày
  | 'Chưa có dữ liệu';

export type TenantFeedbackBadge =
  | 'Chưa có ghi nhận liên hệ'
  | 'Chưa phản hồi'
  | 'Đã phản hồi – Chưa xác nhận ngày trả'
  | 'Đã phản hồi – Đã xác nhận ngày trả'
  | 'Đã phản hồi – Tiếp tục thuê';

export interface Room {
  id: string;
  roomCode: string; // Mã phòng (duy nhất, không đổi)
  floor: number; // Tầng >= 0
  area: number; // Diện tích m2 > 0
  status: RoomStatus;
  note?: string;
  hasDeposit: boolean; // Chỉ báo Đã cọc riêng theo hợp đồng
  firstMonthRentPaid: boolean; // Tiền thuê tháng đầu đã thanh toán (PH-07)
  firstMonthPeriod: string;
  currentTenantId?: string;
  currentTenantName?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  currentContractId?: string;
  currentLeaseId?: string; // Định danh lần thuê
  expectedReturnDate?: string; // Ngày dự kiến trả
  totalOccupants: number;
  returnPlanCancelled?: boolean;
  returnPlanCancelReason?: string;
}

export interface RoomHistoryLog {
  id: string;
  roomCode: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

export interface ReturnPlanLog {
  id: string;
  roomCode: string;
  leaseId: string;
  expectedDate: string;
  oldDate?: string;
  reason?: string;
  confirmSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
  confirmedAt: string;
  exchangeContent: string;
  evidenceFile?: string;
  loggedBy: string;
  loggedAt: string;
  status: 'Còn theo dõi' | 'Đã hủy' | 'Đã kết thúc';
}

export interface TenantContactLog {
  id: string;
  roomCode: string;
  leaseId: string;
  contactTimeActual: string; // Không ở tương lai
  systemInputTime: string;
  contactSource: 'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác';
  contactResult: 'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê';
  content: string;
  nextContactDate?: string;
  loggedBy: string;
  conflictFlag?: boolean;
}

// ==================== QUY TRÌNH 02: BÀN GIAO & TÀI SẢN ====================
export interface Asset {
  id: string;
  name: string;
  unit: string;
  standardQuantity: number;
}

export interface RoomAssetItem {
  id: string;
  assetId: string;
  name: string;
  unit: string;
  standardQuantity: number;
  actualQuantity: number; // Số nguyên >= 0
  quantityDiff: 'Đủ' | 'Thiếu' | 'Thừa';
  physicalCondition: 'Bình thường' | 'Hư hỏng' | 'Khác';
  notes?: string;
}

export interface InventoryRecord {
  id: string;
  roomCode: string;
  expectedBatchCode: string;
  version: number;
  inventoryStatus: 'Nháp' | 'Đã hoàn tất';
  linkStatus: 'Chưa liên kết' | 'Đã liên kết';
  linkedContractId?: string;
  linkedLeaseId?: string;
  items: RoomAssetItem[];
  completedAt?: string;
  completedBy?: string;
}

export interface HandoverCondition {
  id: string;
  roomCode: string;
  scope: 'Tài sản cụ thể' | 'Hiện trạng chung của phòng';
  assetName?: string;
  description: string;
  photos: string[]; // Tối đa 10 ảnh JPG/PNG/WEBP <= 5MB
  videoUrl?: string; // HTTP(S) URL
  initialElectricityKwh: number;
  initialWaterM3: number;
  meterPhotos: string[];
  tenantChecked: boolean;
  tenantCheckNote?: string;
  handoverDoneAt: string;
  loggedBy: string;
  version: number;
}

export interface HandoverReport {
  id: string;
  reportNumber: string;
  roomCode: string;
  contractId: string;
  leaseId: string;
  date: string;
  giverName: string;
  receiverName: string;
  status: 'Nháp' | 'Đã lập' | 'Đã xác nhận';
  tenantSignedPaper: 'Chưa ký' | 'Đã ký giấy';
  ownerSignedPaper: 'Chưa ký' | 'Đã ký giấy';
  paperLocation?: string;
  signedDocumentScanUrl?: string;
  version: number;
  createdAt: string;
  confirmedAt?: string;
  initialElectricityKwh: number;
  initialWaterM3: number;
}

export interface AssetIncident {
  id: string;
  roomCode: string;
  leaseId: string;
  scope: 'Tài sản cụ thể' | 'Hiện trạng chung';
  assetName?: string;
  occurredAt: string;
  description: string;
  cause?: string;
  responsibilityStatus: 'Chưa xác định' | 'Đã xác định';
  responsibilityNote?: string;
  processingStatus: 'Chưa xử lý' | 'Đang xử lý' | 'Đã xử lý';
  solutionPlan?: string;
  actualResult?: string;
  estimatedCompensation?: number; // Chỉ là tham khảo
  tenantPaidExternallyNote?: string; // Nhãn "Do User cung cấp – chưa xác minh độc lập"
  photos: string[];
  videoUrl?: string;
  loggedBy: string;
  loggedAt: string;
}

export interface ReturnInspection {
  id: string;
  roomCode: string;
  leaseId: string;
  inspectionDate: string;
  step304Status: 'Đã nhận lại' | 'Chưa nhận lại' | 'Chưa có kết quả';
  step305Confirmed: boolean; // Chủ nhà xác nhận độc lập tại 3.05
  step305ConfirmedAt?: string;
  step305ConfirmedBy?: string;
  step305Evidence?: string;
  finalElectricityKwh?: number;
  finalWaterM3?: number;
  assetsCheckedFully: boolean;
  incompleteReason?: string;
  items: {
    name: string;
    inspected: boolean;
    quantity: number;
    condition: string;
    reasonIfNotInspected?: string;
  }[];
}

export interface AssetComparison {
  id: string;
  roomCode: string;
  leaseId: string;
  hasDifference: boolean;
  details: {
    assetName: string;
    qtyReceive: number;
    qtyReturn: number;
    condReceive: string;
    condReturn: string;
    differenceNote: string;
  }[];
  concludedBy: string;
  concludedAt: string;
}

export interface AssetComparisonResult {
  id: string;
  roomCode: string;
  leaseId: string;
  hasDifference: boolean; // Từ BG06
  hasPendingWork: boolean; // Còn nội dung cần xử lý?
  pendingWorkNote?: string;
  solutionPlan?: string;
  ownerOpinion?: string;
  tenantOpinion?: string;
  tenantFeedbackStatus: 'Đã phản hồi' | 'Chưa phản hồi' | 'Không liên hệ được';
  unanimousStatus: 'Đã thống nhất' | 'Chưa thống nhất' | 'Chưa xác định';
  compensationAmount?: number;
  transferredToSettlement318: boolean;
  loggedAt: string;
}

export interface HandoverReturnReport {
  id: string;
  reportNumber: string;
  roomCode: string;
  leaseId: string;
  contractId: string;
  status: 'Nháp' | 'Đã lập' | 'Đã xác nhận';
  tenantSignedPaper: 'Khách đã ký' | 'Chưa ký' | 'Khách không ký';
  tenantNotSignReason?: string;
  ownerSignedPaper: 'Đã ký' | 'Chưa ký';
  reviewRequired: boolean;
  version: number;
  createdAt: string;
  confirmedAt?: string;
}

// ==================== QUY TRÌNH 03: HỒ SƠ KHÁCH THUÊ ====================
export interface Tenant {
  id: string; // Mã hồ sơ khách
  fullName: string;
  phoneNumber: string;
  idNumber?: string;
  address?: string;
  paperStatus: 'Đã cung cấp' | 'Chưa cung cấp';
  verificationStatus: 'Chưa xác minh' | 'Đã xác minh hợp lệ' | 'Không hợp lệ';
  requestAdmissionCode?: string; // Mã yêu cầu tiếp nhận
  notes?: string;
  createdAt: string;
  createdBy: string;
}

export interface CoTenant {
  id: string;
  tenantId: string;
  roomCode?: string;
  leaseId?: string;
  fullName: string;
  idNumber?: string;
  relationship: string;
  status: 'Nháp' | 'Dự kiến' | 'Đang cư trú' | 'Đã kết thúc';
  expectedArrivalDate?: string;
  actualArrivalDate?: string;
  departureDate?: string;
  arrivalVerificationEvidence?: string;
}

export interface TenantChangeProposal {
  id: string;
  tenantId: string;
  version: number;
  proposedData: Partial<Tenant>;
  evidenceNote: string;
  verificationResult: 'Đạt' | 'Chưa đạt' | 'Chưa xác minh';
  verifiedAt?: string;
  verifiedBy?: string;
  reason?: string;
}

export interface TenantHistoryEntry {
  id: string;
  tenantId: string;
  action: string;
  timestamp: string;
  performedBy: string;
  oldValues?: string;
  newValues?: string;
  relatedLeaseId?: string;
}

// ==================== QUY TRÌNH 04: HỢP ĐỒNG THUÊ ====================
export interface BatchSchedule {
  batchCode: string;
  startDate: string;
  endDate: string;
  billingCycleNote: string;
  isConfirmed: boolean;
}

export interface LeaseConditionDraft {
  id: string;
  requestCode: string; // Mã yêu cầu tiếp nhận duy nhất
  tenantId?: string;
  roomCode: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number; // Luôn = 1 tháng thuê
  billingCycle: string;
  paymentMethod: 'Chuyển khoản';
  termsNote: string;
  tenantAgreed44a1: boolean;
  version: number;
  updatedAt: string;
}

export interface Contract {
  id: string; // Mã hợp đồng
  contractType: 'Hợp đồng lần đầu' | 'Hợp đồng nối tiếp';
  requestCode?: string;
  leaseId: string; // Mã lần thuê
  roomCode: string;
  tenantId: string;
  tenantName: string;
  batchCode: string;
  startDate: string;
  endDate: string;
  signedDate?: string;
  actualCheckInDate?: string;
  monthlyRent: number;
  depositAmount: number; // Luôn = 1 tháng tiền thuê (kế thừa cọc gốc ở hợp đồng nối tiếp)
  firstMonthRentAmount: number; // 1 tháng tiền thuê
  firstMonthRentPaid: boolean;
  paymentMethod: 'Chuyển khoản';
  terms: string;
  status: 'Nháp' | 'Đã ký' | 'Chờ hiệu lực' | 'Hiệu lực' | 'Kết thúc';
  isSignedPaper: boolean;
  signedProofFiles?: string[];
  previousContractId?: string; // Hợp đồng cũ đối với hợp đồng nối tiếp
  initialDepositCode?: string; // Mã cọc gốc từ hợp đồng đầu
  version: number;
}

// ==================== QUY TRÌNH 05: QUYẾT TOÁN CỌC ====================
export type DepositSettlementStatus = 
  | 'Đang lập'
  | 'Không đồng ý'
  | 'Khách đồng ý'
  | 'Không liên hệ được'
  | 'Tranh chấp'
  | 'Đã có 5.8 – chờ ký biên bản'
  | 'Hoàn tất'
  | 'Đã hủy';

export interface DeductionItem {
  id: string;
  category: 'Công nợ kỳ trước' | 'Điện nước dịch vụ kỳ cuối' | 'Thiệt hại tài sản' | 'Khoản trừ theo điều khoản hợp đồng';
  description: string;
  amount: number;
  evidence?: string;
  clauseRef?: string; // Điều khoản hợp đồng
}

export interface DepositSettlementSlip {
  id: string; // Mã phiếu quyết toán
  roomCode: string;
  leaseId: string;
  initialDepositAmount: number; // Cọc gốc
  initialDepositCode: string;
  handoverReturnDate: string;
  deductions: DeductionItem[];
  calculatedResult: number; // Cọc gốc - Tổng khấu trừ (>0 hoàn cọc; <0 thu thêm; =0 đối trừ hết)
  status: DepositSettlementStatus;
  reviewRequired: boolean; // Cần rà soát khi kỳ cuối đổi
  tenantFeedback?: 'Đồng ý' | 'Không đồng ý' | 'Chưa phản hồi' | 'Không liên hệ được';
  disputeReason?: string;
  contactLogs: {
    contactTime: string;
    channel: string;
    contactPerson: string;
    result: string;
    evidence?: string;
  }[];
  // Chứng từ chuyển khoản duy nhất khi có tiền phải hoàn/thu thêm
  transferReceipt?: {
    receiptType: 'Hoàn cọc' | 'Thu thêm';
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferDate: string;
    transactionCode: string;
    verifiedBy: string;
  };
  step58Published: boolean;
  step58PublishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== QUY TRÌNH 06: TÍNH TIỀN THEO KỲ ====================
export interface MeterReading {
  id: string;
  roomCode: string;
  leaseId: string;
  periodCode: string; // Mã kỳ
  readingType: 'Theo kỳ chung' | 'Ngoài kỳ chung';
  readingDate: string;
  electricMeterCode: string;
  initialElectricKwh: number;
  finalElectricKwh: number;
  waterMeterCode: string;
  initialWaterM3: number;
  finalWaterM3: number;
  // Bất thường
  isAbnormal: boolean;
  abnormalReason?: 'Nhập sai' | 'Quay vòng' | 'Thay công tơ' | 'Công tơ hỏng' | 'Khác';
  verifiedElectricKwh?: number; // Sản lượng sử dụng thực tế đã xác minh
  verifiedWaterM3?: number;
  abnormalEvidence?: string;
  status: 'Nháp' | 'Nháp – điều chỉnh' | 'Đã xác nhận';
  pendingVerificationFlag: boolean; // Cờ Chờ xác minh
  needsRecalculateFlag: boolean; // Cờ Cần tính lại
  isFinalPeriodForLease?: boolean; // Dùng làm kỳ cuối
}

export interface PeriodBill {
  id: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  // Hai khoảng thời gian riêng biệt
  servicePeriodFrom: string;
  servicePeriodTo: string;
  nextRentPeriodFrom: string;
  nextRentPeriodTo: string;
  isRentPeriodEnded?: boolean; // Khách đã trả phòng, không tính thuê kỳ tiếp
  nextMonthRentAmount: number;
  electricityUsage: number;
  electricityRate: number;
  electricityAmount: number;
  waterUsage: number;
  waterRate: number;
  waterAmount: number;
  serviceFees: {
    name: string;
    amount: number;
  }[];
  adjustmentAmount?: number;
  adjustmentReason?: string;
  totalAmount: number;
  isConfirmed: boolean;
  confirmedAt?: string;
  version: number;
}

// ==================== QUY TRÌNH 07: THÔNG BÁO THU TIỀN ====================
export interface PaymentNotice {
  id: string;
  noticeCode: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  servicePeriod: string;
  nextRentPeriod: string;
  dueDate: string; // Hạn thanh toán (>= ngày phát hành)
  originalDueDate: string; // Giữ nguyên hạn gốc khi thay thế
  totalAmount: number;
  status: 'Đang hiệu lực' | 'Đã thay thế';
  paymentStatus: 'Chưa thu' | 'Đã thu';
  qrBankSnapshot: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferContent: string;
    amount: number;
  };
  replacedByNoticeId?: string;
  createdAt: string;
}

// ==================== QUY TRÌNH 08: THU TIỀN ====================
export interface PaymentReceipt {
  id: string;
  noticeId: string;
  roomCode: string;
  leaseId: string;
  periodCode: string;
  amountReceived: number;
  receivedDate: string;
  transactionCode: string;
  bankAccountReceived: string;
  proofFile?: string;
  status: 'Đang hiệu lực' | 'Không còn hiệu lực';
  invalidatedReason?: string;
  invalidatedAt?: string;
  confirmedBy: string;
  confirmedAt: string;
}

// ==================== QUY TRÌNH 09: CÔNG NỢ ====================
export interface DebtHistoryReminder {
  id: string;
  noticeId: string;
  roomCode: string;
  leaseId: string;
  contactDate: string;
  channel: 'Zalo' | 'Điện thoại' | 'Gặp trực tiếp';
  result: string;
  notes?: string;
  loggedBy: string;
  loggedAt: string;
}

export interface DebtPromise {
  id: string;
  noticeId: string;
  roomCode: string;
  contactTime: string;
  channel: 'Zalo' | 'Điện thoại' | 'Gặp trực tiếp';
  content: string;
  hasPromiseDate: boolean;
  promisedDate?: string;
  notes?: string;
  proofFile?: string;
  loggedBy: string;
  loggedAt: string;
}
