import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentNotice, PaymentReceipt } from '../../types';
import {
  CreditCard, CheckCircle2, AlertCircle, Clock, RotateCcw,
  Landmark, ArrowRight, ShieldCheck, History, X
} from 'lucide-react';

export const PaymentReceiptsView: React.FC = () => {
  const {
    paymentNotices,
    paymentReceipts,
    confirmPaymentReceipt08_2,
    revertPaymentReceipt08_2,
    activeBankAccount
  } = useApp();

  const [selectedNotice, setSelectedNotice] = useState<PaymentNotice | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [amountReceived, setAmountReceived] = useState(4350000);
  const [receivedDate, setReceivedDate] = useState('2026-10-16');
  const [txnCode, setTxnCode] = useState('FT261016' + Math.floor(Math.random() * 89999 + 10000));
  const [proofFile, setProofFile] = useState('anh_chuyen_khoan_mb.jpg');

  // Revert modal state
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [revertReason, setRevertReason] = useState('');

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice) return;

    const res = confirmPaymentReceipt08_2(
      selectedNotice.id,
      amountReceived,
      receivedDate,
      txnCode,
      activeBankAccount?.bankName + ' - ' + activeBankAccount?.accountNumber,
      proofFile
    );

    if (res.success) {
      setShowConfirmModal(false);
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  const handleRevertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceipt || !revertReason.trim()) {
      alert('Lý do sửa xác nhận thu nhầm là trường bắt buộc.');
      return;
    }

    const res = revertPaymentReceipt08_2(selectedReceipt.id, revertReason);
    if (res.success) {
      setShowRevertModal(false);
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 08</span>
            <h1 className="text-lg font-bold text-slate-900">Thu tiền & Xác nhận Chuyển khoản (UC08.1 → UC08.2)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi tình trạng thanh toán, đối chiếu giao dịch ngân hàng thực nhận và xác nhận 1 lần cho toàn bộ thông báo. Sửa xác nhận thu nhầm có lý do bắt buộc.
          </p>
        </div>
      </div>

      {/* Main Grid: Uncollected Notices & Confirmed Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Theo dõi thanh toán (UC08.1) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC08.1: Theo dõi các khoản thanh toán</h2>
              <p className="text-xs text-slate-500">2 trạng thái: Chưa thu / Đã thu. Quá hạn là nhãn cảnh báo riêng.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {paymentNotices.map((n) => {
              const isOverdue = n.paymentStatus === 'Chưa thu' && new Date(n.dueDate) < new Date();

              return (
                <div
                  key={n.id}
                  className="p-3.5 border border-slate-200 rounded-xl bg-slate-50 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{n.noticeCode}</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        Phòng {n.roomCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">({n.periodCode})</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Quá hạn
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${n.paymentStatus === 'Đã thu' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {n.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Hạn thanh toán: <strong className="font-mono text-slate-800">{n.dueDate}</strong></span>
                    <span>Tổng tiền QR: <strong className="font-mono text-blue-700">{n.totalAmount.toLocaleString('vi-VN')} đ</strong></span>
                  </div>

                  <div className="flex justify-end pt-1">
                    {n.paymentStatus === 'Chưa thu' && n.status === 'Đang hiệu lực' && (
                      <button
                        onClick={() => {
                          setSelectedNotice(n);
                          setAmountReceived(n.totalAmount);
                          setShowConfirmModal(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Xác nhận thu đủ (UC08.2)
                      </button>
                    )}
                    {n.paymentStatus === 'Đã thu' && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã xác nhận thu đủ vào tài khoản ngân hàng
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lịch sử xác nhận thu & Sửa xác nhận thu nhầm (UC08.2) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC08.2: Chứng từ thu tiền & Sửa nhầm</h2>
              <p className="text-xs text-slate-500">
                Cho phép sửa xác nhận thu nhầm có lý do bắt buộc, đưa thông báo về Chưa thu và tính lại công nợ/báo cáo.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {paymentReceipts.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có chứng từ xác nhận thu tiền nào.</p>
            ) : (
              paymentReceipts.map((r) => (
                <div
                  key={r.id}
                  className={`p-3.5 border rounded-xl text-xs space-y-2 ${r.status === 'Đang hiệu lực' ? 'bg-white border-slate-200' : 'bg-slate-100 border-slate-200 opacity-70'}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{r.transactionCode}</span>
                      <span className="font-semibold text-blue-700">Phòng {r.roomCode}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${r.status === 'Đang hiệu lực' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 line-through'}`}>
                      {r.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-slate-600 text-[11px]">
                    <div>Số tiền: <strong className="font-mono text-blue-700">{r.amountReceived.toLocaleString('vi-VN')} đ</strong></div>
                    <div>Ngày nhận: <span className="font-mono">{r.receivedDate}</span></div>
                    <div>Tài khoản nhận: <span className="font-mono">{r.bankAccountReceived}</span></div>
                    <div>Người xác nhận: <span>{r.confirmedBy}</span></div>
                  </div>

                  {r.status === 'Không còn hiệu lực' && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800">
                      <strong>Lý do sửa thu nhầm:</strong> {r.invalidatedReason} ({new Date(r.invalidatedAt || '').toLocaleDateString('vi-VN')})
                    </div>
                  )}

                  {r.status === 'Đang hiệu lực' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          setSelectedReceipt(r);
                          setRevertReason('');
                          setShowRevertModal(true);
                        }}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Sửa xác nhận thu nhầm (AF-03)
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ==================== MODAL: CONFIRM RECEIPT UC08.2 ==================== */}
      {showConfirmModal && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Xác nhận thu tiền chuyển khoản (UC08.2)</h3>
            <p className="text-slate-500">
              Kiểm tra giao dịch ngân hàng khớp đúng tổng tiền của thông báo. Xác nhận một lần cho toàn bộ thông báo.
            </p>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
              <div className="flex justify-between">
                <span>Thông báo:</span> <strong className="font-mono">{selectedNotice.noticeCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Phòng & Kỳ:</span> <strong>Phòng {selectedNotice.roomCode} - {selectedNotice.periodCode}</strong>
              </div>
              <div className="flex justify-between font-bold text-blue-900 text-sm pt-1 border-t border-blue-200">
                <span>Tổng tiền cần thu:</span> <span>{selectedNotice.totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Số tiền thực nhận (đ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
              />
              <span className="text-[11px] text-slate-400 block mt-0.5">
                BR-UC08.2-03: Không hỗ trợ chuyển thiếu/thừa hoặc thanh toán một phần. Phải thu đủ một lần.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày nhận tiền <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mã giao dịch ngân hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={txnCode}
                  onChange={(e) => setTxnCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận đã thu đủ (UC08.2)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: REVERT RECEIPT AF-03 ==================== */}
      {showRevertModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Sửa xác nhận thu nhầm (AF-03)</h3>
            <p className="text-slate-500">
              Hệ thống sẽ chuyển thông báo tương ứng về Chưa thu, giữ chứng từ cũ trong lịch sử và tính lại công nợ.
            </p>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
              <div>Giao dịch: <strong className="font-mono">{selectedReceipt.transactionCode}</strong></div>
              <div>Số tiền: <strong className="font-mono">{selectedReceipt.amountReceived.toLocaleString('vi-VN')} đ</strong> (Phòng {selectedReceipt.roomCode})</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Lý do sửa xác nhận thu nhầm <span className="text-red-500">*</span>
              </label>
              <textarea
                value={revertReason}
                onChange={(e) => setRevertReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do bắt buộc (Ví dụ: bấm nhầm nút xác nhận, kiểm tra lại ngân hàng chưa nhận được tiền...)"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowRevertModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRevertSubmit}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Xác nhận hủy hiệu lực chứng từ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
