import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentNotice } from '../../types';
import {
  QrCode, Share2, Download, CheckCircle2, AlertCircle, RefreshCw,
  Landmark, Calendar, Plus, Eye, Copy, ArrowRight, X
} from 'lucide-react';

interface PaymentNoticesViewProps {
  onNavigateToReceipts?: () => void;
}

export const PaymentNoticesView: React.FC<PaymentNoticesViewProps> = ({ onNavigateToReceipts }) => {
  const {
    paymentNotices,
    periodBills,
    activeBankAccount,
    generatePaymentNotice07_2,
    replacePaymentNotice07_2
  } = useApp();

  const [selectedNotice, setSelectedNotice] = useState<PaymentNotice | null>(paymentNotices[0] || null);

  // Modal create notice (07.2)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(periodBills.find(b => b.isConfirmed)?.id || '');
  const [dueDate, setDueDate] = useState('2026-10-25');

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillId) return;

    const res = generatePaymentNotice07_2(selectedBillId, dueDate);
    if (!res.success) {
      alert(res.message);
    } else {
      setShowCreateModal(false);
      const newNot = paymentNotices.find(n => n.id === res.noticeId);
      if (newNot) setSelectedNotice(newNot);
      alert(res.message);
    }
  };

  const handleReplaceNotice = (oldNoticeId: string) => {
    const res = replacePaymentNotice07_2(oldNoticeId);
    if (!res.success) {
      alert(res.message);
    } else {
      alert(res.message);
      const rep = paymentNotices.find(n => n.id === res.noticeId);
      if (rep) setSelectedNotice(rep);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 07</span>
            <h1 className="text-lg font-bold text-slate-900">Thông báo Thu tiền & Mã QR (UC07.1 → UC07.3)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập thông báo tổng kèm mã QR cố định số tiền & nội dung chuyển khoản, quản lý bản thay thế và chia sẻ thủ công qua Zalo.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Lập thông báo thanh toán (UC07.2)
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Notices List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Danh sách thông báo
            </span>
            <span className="text-xs font-mono text-slate-400">({paymentNotices.length})</span>
          </div>

          <div className="space-y-2">
            {paymentNotices.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNotice(n)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${selectedNotice?.id === n.id ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-slate-900">{n.noticeCode}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${n.status === 'Đang hiệu lực' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600 line-through'}`}>
                    {n.status}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Phòng: <strong className="text-blue-700">{n.roomCode}</strong></span>
                  <span className="font-mono">{n.periodCode}</span>
                </div>

                <div className="flex justify-between font-mono pt-1 border-t border-slate-100">
                  <span className="text-slate-500">Số tiền QR:</span>
                  <strong className="text-blue-700">{n.totalAmount.toLocaleString('vi-VN')} đ</strong>
                </div>

                <div className="flex justify-between text-[11px] pt-0.5">
                  <span className="text-slate-400">Hạn: {n.dueDate}</span>
                  <span className={`font-semibold ${n.paymentStatus === 'Đã thu' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {n.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Notice Preview & QR Code (UC07.2, UC07.3) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          {selectedNotice ? (
            <div className="space-y-5 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-slate-900">{selectedNotice.noticeCode}</h2>
                    <span className="font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">
                      Phòng {selectedNotice.roomCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Kỳ thanh toán: <strong>{selectedNotice.periodCode}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${selectedNotice.status === 'Đang hiệu lực' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                    {selectedNotice.status}
                  </span>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold ${selectedNotice.paymentStatus === 'Đã thu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {selectedNotice.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Notice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-800 uppercase tracking-wider block text-xs">
                    Chi tiết các kỳ tính toán
                  </span>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kỳ dịch vụ vừa ở:</span>
                      <span className="font-mono">{selectedNotice.servicePeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kỳ tiền thuê tiếp theo:</span>
                      <span className="font-mono">{selectedNotice.nextRentPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Hạn thanh toán:</span>
                      <span className="font-mono font-bold text-slate-900">{selectedNotice.dueDate}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated QR Code Canvas */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-40 h-40 bg-white border-2 border-slate-900 rounded-xl p-2 flex flex-col items-center justify-center shadow-sm">
                    {/* QR Code visual simulation */}
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white rounded p-1">
                      <QrCode className="w-24 h-24 text-white" />
                      <span className="text-[9px] font-mono tracking-tighter">VIETQR · {selectedNotice.totalAmount.toLocaleString('vi-VN')} Đ</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <span className="font-bold text-slate-900 block">{selectedNotice.qrBankSnapshot.bankName}</span>
                    <span className="font-mono font-bold text-blue-700">{selectedNotice.qrBankSnapshot.accountNumber}</span>
                    <span className="block uppercase text-[10px]">{selectedNotice.qrBankSnapshot.accountHolder}</span>
                    <span className="font-mono text-[10px] text-slate-500 block">Nội dung: {selectedNotice.qrBankSnapshot.transferContent}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for UC07.2 and UC07.3 */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <div>
                  {selectedNotice.status === 'Đang hiệu lực' && selectedNotice.paymentStatus === 'Chưa thu' && (
                    <button
                      onClick={() => handleReplaceNotice(selectedNotice.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Phát hành thông báo thay thế (UC07.2)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      alert(`Đã tải ảnh Thông báo thanh toán có mã QR (${selectedNotice.noticeCode}.png) về máy để chuẩn bị gửi Zalo.`);
                    }}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Tải ảnh thông báo (UC07.3)
                  </button>

                  <button
                    onClick={() => {
                      alert(`Đã chuẩn bị ảnh thông báo QR của phòng ${selectedNotice.roomCode}. Bạn có thể gửi thủ công qua ứng dụng Zalo tới khách thuê.`);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Chia sẻ qua Zalo thủ công (UC07.3)
                  </button>

                  {onNavigateToReceipts && selectedNotice.paymentStatus === 'Chưa thu' && (
                    <button
                      onClick={onNavigateToReceipts}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      Xác nhận thu tiền (UC08.2) →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">Chọn một thông báo ở cột bên trái để xem chi tiết mã QR.</p>
          )}
        </div>
      </div>

      {/* ==================== MODAL: CREATE NOTICE UC07.2 ==================== */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Lập thông báo thanh toán (UC07.2)</h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Chọn bảng tính tiền kỳ đã xác nhận (UC-TT-03)</label>
              <select
                value={selectedBillId}
                onChange={(e) => setSelectedBillId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              >
                {periodBills.filter(b => b.isConfirmed).map(b => (
                  <option key={b.id} value={b.id}>
                    {b.roomCode} · {b.periodCode} ({b.totalAmount.toLocaleString('vi-VN')} đ)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hạn thanh toán (≥ ngày phát hành) <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                BR-UC07.2-05: Hạn thanh toán không được trước ngày phát hành. Khi lập QR thay thế, giữ nguyên hạn gốc.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tài khoản nhận tiền</label>
              <div className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
                <span className="font-bold">{activeBankAccount?.bankName}</span>
                <div className="font-mono text-blue-700 font-bold">{activeBankAccount?.accountNumber}</div>
                <div className="uppercase text-[11px]">{activeBankAccount?.accountHolder}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateNotice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Tạo thông báo & mã QR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
