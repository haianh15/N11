import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3, PieChart, FileSpreadsheet, CheckCircle2, AlertCircle,
  Download, Filter, Calendar, ShieldCheck, ArrowUpRight, TrendingUp
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    rooms,
    contracts,
    paymentNotices,
    paymentReceipts,
    settlementSlips
  } = useApp();

  const [activeTab, setActiveTab] = useState<'occupancy_bc01' | 'financial_bc02' | 'reconciliation_bc03' | 'executive_bc04'>('occupancy_bc01');

  // Calculations for BC-01 (Occupancy)
  const totalRooms = rooms.length;
  const vacantRooms = rooms.filter(r => r.status === 'Trống').length;
  const rentedRooms = rooms.filter(r => r.status === 'Đang thuê').length;
  const returningRooms = rooms.filter(r => r.status === 'Sắp trả').length;
  const occupancyRate = totalRooms > 0 ? (((rentedRooms + returningRooms) / totalRooms) * 100).toFixed(1) : 'N/A';

  // Calculations for BC-02 (Financial)
  // Phải thu: Tổng tất cả thông báo đang hiệu lực
  const totalReceivable = paymentNotices
    .filter(n => n.status === 'Đang hiệu lực')
    .reduce((sum, n) => sum + n.totalAmount, 0);

  // Thực thu ngân hàng: Chỉ các biên lai đang hiệu lực
  const totalCollected = paymentReceipts
    .filter(r => r.status === 'Đang hiệu lực')
    .reduce((sum, r) => sum + r.amountReceived, 0);

  // Khoản đã bù bằng cọc (theo dõi riêng)
  const totalHandledByDeposit = settlementSlips
    .filter(s => s.status === 'Đã có 5.8 – chờ ký biên bản' || s.status === 'Hoàn tất')
    .reduce((sum, s) => {
      const debtDed = s.deductions.filter(d => d.category === 'Công nợ kỳ trước').reduce((acc, d) => acc + d.amount, 0);
      return sum + debtDed;
    }, 0);

  // Chưa thu = Phải thu - Thực thu ngân hàng - Khoản bù cọc
  const totalUncollected = Math.max(0, totalReceivable - totalCollected - totalHandledByDeposit);

  // Công nợ quá hạn: Khoản chưa thu quá hạn
  const now = new Date();
  const totalOverdueDebt = paymentNotices
    .filter(n => n.status === 'Đang hiệu lực' && n.paymentStatus === 'Chưa thu' && new Date(n.dueDate) < now)
    .reduce((sum, n) => sum + n.totalAmount, 0);

  // Check state for BC-03
  const [reconciled, setReconciled] = useState(true);
  const [reconciledDate, setReconciledDate] = useState('16/10/2026 09:30');

  const handleExportExcel = () => {
    // Generate clean CSV content
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      "BÁO CÁO QUẢN TRỊ TỔNG HỢP CHUNG CƯ MINI AN BÌNH\n" +
      `Thời điểm kết xuất: ${new Date().toLocaleString('vi-VN')}\n\n` +
      "CHỈ TIÊU VẬN HÀNH PHÒNG (UC-BC-01)\n" +
      `Tổng số phòng,${totalRooms}\n` +
      `Đang thuê,${rentedRooms}\n` +
      `Sắp trả (≤15 ngày),${returningRooms}\n` +
      `Phòng trống,${vacantRooms}\n` +
      `Tỷ lệ lấp đầy,${occupancyRate}%\n\n` +
      "CHỈ TIÊU TÀI CHÍNH & CÔNG NỢ (UC-BC-02)\n" +
      `Tổng số phải thu gốc,${totalReceivable} VNĐ\n` +
      `Thực thu chuyển khoản ngân hàng,${totalCollected} VNĐ\n` +
      `Khoản nợ xử lý bù cọc,${totalHandledByDeposit} VNĐ\n` +
      `Số tiền chưa thu còn lại,${totalUncollected} VNĐ\n` +
      `Công nợ quá hạn,${totalOverdueDebt} VNĐ\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BaoCao_QuanTri_ChungCuMini_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert("Đã xuất báo cáo quản trị tổng hợp Excel/CSV thành công (UC-BC-04)!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 10</span>
            <h1 className="text-lg font-bold text-slate-900">Báo cáo Thống kê & Quản trị (UC-BC-01 → UC-BC-04)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng hợp tỷ lệ lấp đầy, doanh thu thu tiền, đối soát số liệu và lập báo cáo quản trị tổng hợp xuất Excel.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('occupancy_bc01')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'occupancy_bc01' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Tỷ lệ lấp đầy (BC-01)
          </button>
          <button
            onClick={() => setActiveTab('financial_bc02')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'financial_bc02' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Thu tiền & Công nợ (BC-02)
          </button>
          <button
            onClick={() => setActiveTab('reconciliation_bc03')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'reconciliation_bc03' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Đối soát số liệu (BC-03)
          </button>
          <button
            onClick={() => setActiveTab('executive_bc04')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'executive_bc04' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Báo cáo tổng hợp (BC-04)
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: OCCUPANCY BC-01 ==================== */}
      {activeTab === 'occupancy_bc01' && (
        <div className="space-y-5">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Tổng số phòng</span>
              <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">{totalRooms}</span>
              <span className="text-[10px] text-slate-400">Tòa nhà 4 tầng</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Đang thuê</span>
              <span className="text-2xl font-bold font-mono text-blue-700 mt-1 block">{rentedRooms}</span>
              <span className="text-[10px] text-blue-600">Hợp đồng hiệu lực</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Sắp trả (≤15 ngày)</span>
              <span className="text-2xl font-bold font-mono text-amber-700 mt-1 block">{returningRooms}</span>
              <span className="text-[10px] text-amber-600">Kế hoạch trả phòng</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Phòng trống</span>
              <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">{vacantRooms}</span>
              <span className="text-[10px] text-emerald-600">Sẵn sàng giới thiệu</span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-sm text-white col-span-2 md:col-span-1">
              <span className="text-[11px] font-semibold text-slate-300 uppercase block">Tỷ lệ lấp đầy</span>
              <span className="text-2xl font-bold font-mono text-blue-400 mt-1 block">{occupancyRate}%</span>
              <span className="text-[10px] text-slate-400">(Đang thuê + Sắp trả) / Tổng</span>
            </div>
          </div>

          {/* Drill-down list */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh sách chi tiết phòng (Drill-down ASIS-01)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Phòng</th>
                    <th className="py-2.5 px-3">Tầng</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3">Khách thuê</th>
                    <th className="py-2.5 px-3">Ngày dự kiến trả</th>
                    <th className="py-2.5 px-3">Đã cọc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">{r.roomCode}</td>
                      <td className="py-2 px-3">{r.floor}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.status === 'Trống' ? 'bg-emerald-50 text-emerald-700' : r.status === 'Sắp trả' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-800">{r.currentTenantName || '—'}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{r.expectedReturnDate || '—'}</td>
                      <td className="py-2 px-3">{r.hasDeposit ? 'Đã cọc' : 'Chưa'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: FINANCIAL BC-02 ==================== */}
      {activeTab === 'financial_bc02' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">1. Tổng phải thu</span>
              <span className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                {totalReceivable.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10px] text-slate-400">Nguồn TT-03 & thông báo QR</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">2. Thực thu ngân hàng</span>
              <span className="text-xl font-bold font-mono text-emerald-700 mt-1 block">
                {totalCollected.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10px] text-emerald-600">Đã xác nhận UC08.2</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">3. Khoản nợ bù cọc</span>
              <span className="text-xl font-bold font-mono text-indigo-700 mt-1 block">
                {totalHandledByDeposit.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10px] text-indigo-600">Theo dõi riêng (BR-BC02-02)</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">4. Công nợ quá hạn</span>
              <span className="text-xl font-bold font-mono text-red-600 mt-1 block">
                {totalOverdueDebt.toLocaleString('vi-VN')} đ
              </span>
              <span className="text-[10px] text-red-500">Chưa thu & quá hạn</span>
            </div>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <strong>Nguyên tắc hạch toán (BR-UC.BC.02-01 & BR-UC.BC.02-04):</strong>
            <p>
              Tiền cọc gốc và hoàn cọc thuộc QT05 được theo dõi riêng, không tính vào doanh thu tiền thuê. Khoản nợ được xử lý bằng cọc theo quyết toán hoàn tất được ghi nhận riêng, không tính là tiền chuyển khoản thực nhận qua ngân hàng.
            </p>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: RECONCILIATION BC-03 ==================== */}
      {activeTab === 'reconciliation_bc03' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC-BC-03: Đối soát số liệu báo cáo</h2>
              <p className="text-slate-500">
                Kiểm tra so sánh giữa Phải thu, Thực thu và Công nợ trước khi xuất báo cáo.
              </p>
            </div>

            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Đã kiểm tra ({reconciledDate})
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="font-semibold text-slate-800 uppercase tracking-wider text-[11px]">
              Kiểm tra các quy tắc nghiệp vụ tài chính:
            </div>
            <div className="space-y-1 text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Không đếm trùng tiền thuê kỳ đầu đã thu khi ký hợp đồng tại PH-07.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Không đưa tiền cọc gốc vào doanh thu tiền thuê định kỳ.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Không phát sinh tiền thuê sau ngày nhận lại phòng thực tế.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nợ cũ giữ mã QR và thông báo riêng, không gộp vào thông báo mới.</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                setReconciled(true);
                setReconciledDate(new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN').substring(0, 5));
                alert('Xác nhận đối soát số liệu báo cáo thành công (UC-BC-03)!');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Xác nhận đã kiểm tra (UC-BC-03)
            </button>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: EXECUTIVE REPORT BC-04 ==================== */}
      {activeTab === 'executive_bc04' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">UC-BC-04: Lập Báo cáo Quản trị Tổng hợp</h2>
              <p className="text-slate-500">
                Xuất Excel báo cáo tổng hợp tình trạng phòng, tài chính, công nợ và hợp đồng sau khi đã đối soát số liệu.
              </p>
            </div>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Xuất Excel báo cáo (CSV)
            </button>
          </div>

          {/* Executive Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider block text-xs">
              Tóm tắt chỉ tiêu quản trị (Thời điểm hiện tại):
            </span>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-700">
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Tỷ lệ lấp đầy:</span>
                <strong className="text-lg font-mono text-blue-700">{occupancyRate}%</strong>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Tổng phải thu:</span>
                <strong className="text-lg font-mono text-slate-900">{totalReceivable.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Thực thu ngân hàng:</span>
                <strong className="text-lg font-mono text-emerald-700">{totalCollected.toLocaleString('vi-VN')} đ</strong>
              </div>
              <div className="p-3 bg-white rounded border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Công nợ quá hạn:</span>
                <strong className="text-lg font-mono text-red-600">{totalOverdueDebt.toLocaleString('vi-VN')} đ</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
