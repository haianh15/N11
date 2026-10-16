import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MeterReading, PeriodBill } from '../../types';
import {
  Zap, Droplets, Plus, CheckCircle2, AlertCircle, Edit, Calculator,
  Calendar, ArrowRight, ShieldAlert, History, FileText, CheckSquare, X
} from 'lucide-react';

interface BillingViewProps {
  onNavigateToNotices?: () => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onNavigateToNotices }) => {
  const {
    rooms,
    meterReadings,
    periodBills,
    saveMeterReadingTT01,
    updateMeterReadingTT02,
    generatePeriodBillTT03,
    confirmPeriodBillTT03
  } = useApp();

  const [activeTab, setActiveTab] = useState<'readings' | 'bills'>('readings');

  // New reading modal (TT-01)
  const [showReadingModal, setShowReadingModal] = useState(false);
  const [readRoom, setReadRoom] = useState(rooms[0]?.roomCode || 'P.101');
  const [readPeriod, setReadPeriod] = useState('Kỳ 10/2026');
  const [readType, setReadType] = useState<'Theo kỳ chung' | 'Ngoài kỳ chung'>('Theo kỳ chung');
  const [initElec, setInitElec] = useState(1250);
  const [finalElec, setFinalElec] = useState(1370);
  const [initWater, setInitWater] = useState(45);
  const [finalWater, setFinalWater] = useState(51);
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [abnormalReason, setAbnormalReason] = useState<'Nhập sai' | 'Quay vòng' | 'Thay công tơ' | 'Công tơ hỏng' | 'Khác'>('Quay vòng');
  const [verifiedElec, setVerifiedElec] = useState(65);
  const [verifiedWater, setVerifiedWater] = useState(5);
  const [abnormalProof, setAbnormalProof] = useState('');

  // Edit reading modal (TT-02)
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReading, setSelectedReading] = useState<MeterReading | null>(null);
  const [editFinalElec, setEditFinalElec] = useState(0);
  const [editFinalWater, setEditFinalWater] = useState(0);
  const [editReason, setEditReason] = useState('');

  // Generate Bill Modal (TT-03)
  const [showGenBillModal, setShowGenBillModal] = useState(false);
  const [billRoom, setBillRoom] = useState('P.101');
  const [billPeriod, setBillPeriod] = useState('Kỳ 10/2026');

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    const newReading: MeterReading = {
      id: 'mr_' + readRoom.replace(/\D/g, '') + '_' + Date.now().toString().slice(-4),
      roomCode: readRoom,
      leaseId: 'THUE-' + readRoom.replace(/\D/g, '') + '-L1',
      periodCode: readPeriod,
      readingType: readType,
      readingDate: new Date().toISOString().split('T')[0],
      electricMeterCode: 'CT-D-' + readRoom.replace(/\D/g, ''),
      initialElectricKwh: initElec,
      finalElectricKwh: finalElec,
      waterMeterCode: 'CT-N-' + readRoom.replace(/\D/g, ''),
      initialWaterM3: initWater,
      finalWaterM3: finalWater,
      isAbnormal,
      abnormalReason: isAbnormal ? abnormalReason : undefined,
      verifiedElectricKwh: isAbnormal ? verifiedElec : undefined,
      verifiedWaterM3: isAbnormal ? verifiedWater : undefined,
      abnormalEvidence: isAbnormal ? abnormalProof : undefined,
      status: 'Đã xác nhận',
      pendingVerificationFlag: isAbnormal && !abnormalProof,
      needsRecalculateFlag: false
    };

    saveMeterReadingTT01(newReading);
    setShowReadingModal(false);
    alert('Ghi nhận chỉ số điện/nước thành công (UC-TT-01)!');
  };

  const handleUpdateReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReading || !editReason.trim()) {
      alert('Lý do sửa chỉ số là trường bắt buộc.');
      return;
    }

    updateMeterReadingTT02(selectedReading.id, {
      finalElectricKwh: editFinalElec,
      finalWaterM3: editFinalWater
    }, editReason);

    setShowEditModal(false);
    alert('Sửa chỉ số thành công (UC-TT-02)! Dòng đã chuyển sang Nháp – điều chỉnh, vui lòng tính lại tiền tại UC-TT-03.');
  };

  const handleGenerateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const res = generatePeriodBillTT03(billRoom, billPeriod);
    if (!res.success) {
      alert(res.message);
    } else {
      setShowGenBillModal(false);
      setActiveTab('bills');
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 06</span>
            <h1 className="text-lg font-bold text-slate-900">Quản lý Tính tiền theo kỳ (UC-TT-01 → UC-TT-03)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận & sửa chỉ số điện nước, xử lý công tơ bất thường và lập bảng tính tiền tách bạch kỳ thuê tiếp theo với kỳ dịch vụ vừa sử dụng.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setActiveTab('readings')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'readings' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Chỉ số điện nước (TT-01/02)
          </button>
          <button
            onClick={() => setActiveTab('bills')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'bills' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Bảng tính tiền kỳ (TT-03)
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: READINGS (TT-01, TT-02) ==================== */}
      {activeTab === 'readings' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <span className="text-xs text-slate-600">
              Công tơ bất thường (quay vòng, thay mới) phải nhập riêng Sản lượng sử dụng thực tế đã xác minh (kWh/m³) theo BR-UC.TT.01-04.
            </span>

            <button
              onClick={() => setShowReadingModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Ghi nhận chỉ số mới (UC-TT-01)
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Phòng</th>
                    <th className="py-2.5 px-3">Kỳ thu</th>
                    <th className="py-2.5 px-3">Loại chốt</th>
                    <th className="py-2.5 px-3">Ngày đọc</th>
                    <th className="py-2.5 px-3">Điện (Đầu → Cuối)</th>
                    <th className="py-2.5 px-3">Nước (Đầu → Cuối)</th>
                    <th className="py-2.5 px-3">Lượng dùng tính tiền</th>
                    <th className="py-2.5 px-3">Bất thường</th>
                    <th className="py-2.5 px-3">Trạng thái</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {meterReadings.map((m) => {
                    const elecDiff = m.verifiedElectricKwh !== undefined ? m.verifiedElectricKwh : Math.max(0, m.finalElectricKwh - m.initialElectricKwh);
                    const waterDiff = m.verifiedWaterM3 !== undefined ? m.verifiedWaterM3 : Math.max(0, m.finalWaterM3 - m.initialWaterM3);

                    return (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{m.roomCode}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-800">{m.periodCode}</td>
                        <td className="py-2.5 px-3 text-slate-600">{m.readingType}</td>
                        <td className="py-2.5 px-3 font-mono">{m.readingDate}</td>
                        <td className="py-2.5 px-3 font-mono">
                          {m.initialElectricKwh} → <strong className="text-amber-700">{m.finalElectricKwh}</strong>
                        </td>
                        <td className="py-2.5 px-3 font-mono">
                          {m.initialWaterM3} → <strong className="text-blue-700">{m.finalWaterM3}</strong>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                          {elecDiff} kWh · {waterDiff} m³
                        </td>
                        <td className="py-2.5 px-3">
                          {m.isAbnormal ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {m.abnormalReason} (Sản lượng đã xác minh)
                            </span>
                          ) : (
                            <span className="text-slate-400">Bình thường</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${m.status === 'Đã xác nhận' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedReading(m);
                              setEditFinalElec(m.finalElectricKwh);
                              setEditFinalWater(m.finalWaterM3);
                              setEditReason('');
                              setShowEditModal(true);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                          >
                            Sửa (TT-02)
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: PERIOD BILLS (TT-03) ==================== */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap justify-between items-center gap-3">
            <div className="text-xs text-slate-600">
              Công thức (BR-TT03-01): <strong>Kỳ tiền thuê tiếp theo trả trước</strong> + <strong>Điện/nước & phí dịch vụ kỳ vừa sử dụng</strong>. Tiền thuê tháng đầu đã thanh toán tại PH-07 không tính lại.
            </div>

            <button
              onClick={() => setShowGenBillModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Calculator className="w-4 h-4" />
              Tính tiền kỳ (UC-TT-03)
            </button>
          </div>

          <div className="space-y-4">
            {periodBills.map((bill) => (
              <div key={bill.id} className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm space-y-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Bảng tính tiền: {bill.roomCode}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      {bill.periodCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${bill.isConfirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {bill.isConfirmed ? 'Đã xác nhận bảng tính' : 'Nháp – Chờ xác nhận'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tổng tiền kỳ:</span>
                    <span className="font-mono font-bold text-base text-blue-700">
                      {bill.totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* 2 separate periods */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                      A. Kỳ tiền thuê tiếp theo (Trả trước)
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời gian:</span>
                      <span className="font-mono">{bill.nextRentPeriodFrom} → {bill.nextRentPeriodTo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền thuê tháng tiếp theo:</span>
                      <strong className="font-mono text-slate-900">{bill.nextMonthRentAmount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    {bill.isRentPeriodEnded && (
                      <span className="text-[11px] text-amber-700 italic block">Phòng đã kết thúc thuê thực tế, không sinh tiền thuê kỳ tiếp.</span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                    <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px]">
                      B. Kỳ điện, nước & dịch vụ (Vừa sử dụng)
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời gian sử dụng:</span>
                      <span className="font-mono">{bill.servicePeriodFrom} → {bill.servicePeriodTo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền điện ({bill.electricityUsage} kWh x {bill.electricityRate} đ):</span>
                      <strong className="font-mono text-amber-800">{bill.electricityAmount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tiền nước ({bill.waterUsage} m³ x {bill.waterRate} đ):</span>
                      <strong className="font-mono text-blue-800">{bill.waterAmount.toLocaleString('vi-VN')} đ</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-slate-500">Tổng các phí dịch vụ cố định:</span>
                      <strong className="font-mono text-slate-800">
                        {bill.serviceFees.reduce((s, f) => s + f.amount, 0).toLocaleString('vi-VN')} đ
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Confirm actions */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  {!bill.isConfirmed ? (
                    <button
                      onClick={() => {
                        confirmPeriodBillTT03(bill.id);
                        alert('Xác nhận bảng tính tiền thành công! Bạn có thể lập thông báo thu tiền và tạo mã QR tại Quy trình 07.');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Xác nhận bảng tính (UC-TT-03)
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Đã xác nhận chốt số tiền
                      </span>
                      {onNavigateToNotices && (
                        <button
                          onClick={onNavigateToNotices}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
                        >
                          Chuyển sang Lập thông báo thanh toán (UC07.2) →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD READING TT-01 ==================== */}
      {showReadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận chỉ số điện/nước (UC-TT-01)</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phòng cần chốt <span className="text-red-500">*</span></label>
                <select
                  value={readRoom}
                  onChange={(e) => setReadRoom(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.roomCode}>{r.roomCode} ({r.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kỳ chốt <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={readPeriod}
                  onChange={(e) => setReadPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <span className="font-bold text-slate-800 uppercase block text-[11px]">Chỉ số điện (kWh)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Chỉ số đầu kỳ</label>
                  <input
                    type="number"
                    value={initElec}
                    onChange={(e) => setInitElec(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chỉ số cuối kỳ <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={finalElec}
                    onChange={(e) => setFinalElec(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-amber-700"
                  />
                </div>
              </div>

              <span className="font-bold text-slate-800 uppercase block text-[11px] pt-2 border-t border-slate-200">Chỉ số nước (m³)</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 mb-1">Chỉ số đầu kỳ</label>
                  <input
                    type="number"
                    value={initWater}
                    onChange={(e) => setInitWater(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chỉ số cuối kỳ <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={finalWater}
                    onChange={(e) => setFinalWater(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                  />
                </div>
              </div>
            </div>

            {/* Công tơ bất thường (AF-02) */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-2">
              <label className="flex items-center gap-2 font-semibold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAbnormal}
                  onChange={(e) => setIsAbnormal(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Công tơ bất thường (quay vòng, thay mới, hỏng)</span>
              </label>

              {isAbnormal && (
                <div className="space-y-2 pt-2 border-t border-amber-200 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Lý do</label>
                      <select
                        value={abnormalReason}
                        onChange={(e) => setAbnormalReason(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="Quay vòng">Quay vòng qua 9999</option>
                        <option value="Thay công tơ">Thay công tơ mới</option>
                        <option value="Công tơ hỏng">Công tơ hỏng / không nhảy số</option>
                        <option value="Nhập sai">Nhập sai số trước đó</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Sản lượng điện đã xác minh (kWh)</label>
                      <input
                        type="number"
                        value={verifiedElec}
                        onChange={(e) => setVerifiedElec(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono font-bold text-amber-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Chứng cứ ảnh / biên bản xác minh <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={abnormalProof}
                      onChange={(e) => setAbnormalProof(e.target.value)}
                      placeholder="Tên tệp ảnh hoặc liên kết biên bản..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReadingModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                onClick={handleSaveReading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu chỉ số (UC-TT-01)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDIT READING TT-02 ==================== */}
      {showEditModal && selectedReading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Sửa chỉ số điện/nước (UC-TT-02)</h3>
            <p className="text-slate-500">
              Chỉ sửa kỳ chưa thu tiền. Sau khi sửa, bảng tính tiền cần được tính lại tại UC-TT-03.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chỉ số điện mới (kWh)</label>
                <input
                  type="number"
                  value={editFinalElec}
                  onChange={(e) => setEditFinalElec(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chỉ số nước mới (m³)</label>
                <input
                  type="number"
                  value={editFinalWater}
                  onChange={(e) => setEditFinalWater(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lý do sửa chỉ số <span className="text-red-500">*</span></label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                rows={2}
                placeholder="Ghi rõ lý do (nhập nhầm số, chốt lại...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpdateReading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu sửa chỉ số (TT-02)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: GENERATE BILL TT-03 ==================== */}
      {showGenBillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Tính tiền theo kỳ (UC-TT-03)</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phòng cần tính tiền</label>
              <select
                value={billRoom}
                onChange={(e) => setBillRoom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.roomCode}>{r.roomCode} ({r.status})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kỳ tính tiền</label>
              <input
                type="text"
                value={billPeriod}
                onChange={(e) => setBillPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowGenBillModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleGenerateBill}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Tính tiền kỳ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
