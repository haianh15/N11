import React from 'react';
import {
  Settings,
  Home,
  PackageCheck,
  Users,
  FileText,
  Scale,
  Calculator,
  QrCode,
  CreditCard,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

export type NavTabKey =
  | 'config'
  | 'rooms'
  | 'handover'
  | 'tenants'
  | 'contracts'
  | 'settlement'
  | 'billing'
  | 'notices'
  | 'receipts'
  | 'debts'
  | 'reports';

interface SidebarProps {
  currentTab: NavTabKey;
  onSelectTab: (tab: NavTabKey) => void;
}

interface NavItem {
  key: NavTabKey;
  label: string;
  stepCode: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'config',
    stepCode: 'MỤC 0',
    label: 'Cấu hình thu tiền',
    icon: Settings,
    description: 'Đơn giá điện nước, phí dịch vụ & tài khoản ngân hàng (UC-CH-01/02)'
  },
  {
    key: 'rooms',
    stepCode: 'QUY TRÌNH 01',
    label: 'Quản lý tình trạng phòng',
    icon: Home,
    description: 'Trạng thái phòng, điều kiện nhận/trả & kế hoạch trả (UC-PH-01..15)'
  },
  {
    key: 'handover',
    stepCode: 'QUY TRÌNH 02',
    label: 'Bàn giao & Tài sản',
    icon: PackageCheck,
    description: 'Kiểm kê, hiện trạng, biên bản nhận/trả & sự cố (UC-BG01..11)'
  },
  {
    key: 'tenants',
    stepCode: 'QUY TRÌNH 03',
    label: 'Hồ sơ khách thuê',
    icon: Users,
    description: 'Hồ sơ khách, người ở cùng, đối chiếu & cập nhật (UC-HSKT-01..05)'
  },
  {
    key: 'contracts',
    stepCode: 'QUY TRÌNH 04',
    label: 'Hợp đồng thuê',
    icon: FileText,
    description: 'Lập hợp đồng lần đầu, hạn hợp đồng & gia hạn cọc gốc (UC-HDT-01..07)'
  },
  {
    key: 'settlement',
    stepCode: 'QUY TRÌNH 05',
    label: 'Quyết toán cọc',
    icon: Scale,
    description: 'Tính khấu trừ cọc gốc, phản hồi & chứng từ 5.8 (UC-QTC-01..03)'
  },
  {
    key: 'billing',
    stepCode: 'QUY TRÌNH 06',
    label: 'Tính tiền theo kỳ',
    icon: Calculator,
    description: 'Ghi/sửa chỉ số & bảng tính tách bạch 2 khoảng thời gian (UC-TT-01..03)'
  },
  {
    key: 'notices',
    stepCode: 'QUY TRÌNH 07',
    label: 'Thông báo thu tiền & QR',
    icon: QrCode,
    description: 'Đối chiếu khoản thu, lập thông báo & mã QR cố định (UC07.1..07.3)'
  },
  {
    key: 'receipts',
    stepCode: 'QUY TRÌNH 08',
    label: 'Thu tiền & Chuyển khoản',
    icon: CreditCard,
    description: 'Theo dõi thanh toán, xác nhận thu đủ & sửa nhầm (UC08.1..08.2)'
  },
  {
    key: 'debts',
    stepCode: 'QUY TRÌNH 09',
    label: 'Quản lý công nợ',
    icon: AlertTriangle,
    description: 'Nợ quá hạn, ghi lịch sử nhắc nợ, hẹn trả & nợ kéo dài (UC-CN-01..04)'
  },
  {
    key: 'reports',
    stepCode: 'QUY TRÌNH 10',
    label: 'Báo cáo thống kê',
    icon: BarChart3,
    description: 'Tỷ lệ lấp đầy, thu tiền/công nợ, đối soát & xuất Excel (UC-BC-01..04)'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-57px)] sticky top-[57px]">
      <div className="p-3 border-b border-slate-100 bg-slate-50">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          Danh mục 11 Quy trình nghiệp vụ
        </span>
      </div>

      <nav className="p-2 space-y-1 overflow-y-auto flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'hover:bg-slate-100 text-slate-700'}`}
            >
              <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[10px] font-mono uppercase font-bold block ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                    {item.stepCode}
                  </span>
                </div>
                <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                  {item.label}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 space-y-0.5">
        <div className="font-semibold text-slate-700">Chung cư mini An Bình</div>
        <div>25 Ngõ 198 Xã Đàn, Hà Nội</div>
        <div className="text-[10px] text-slate-400">Đầy đủ 63 Use Case Mục 0 & QT01-10</div>
      </div>
    </aside>
  );
};
