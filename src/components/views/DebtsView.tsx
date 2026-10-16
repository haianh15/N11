import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentNotice, DebtHistoryReminder, DebtPromise } from '../../types';
import {
  AlertTriangle, Phone, MessageCircle, UserCheck, Calendar,
  Clock, Plus, Search, FileText, CheckCircle2, AlertCircle, X
} from 'lucide-react';

export const DebtsView: React.FC = () => {
  const {
    paymentNotices,
    debtReminders,
    debtPromises,
    recordDebtReminder09_2,
    recordDebtPromise09_3,
    contracts
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overdue_list' | 'reminders' | 'promises' | 'long_debt_cn04'>('overdue_list');

  // Filter overdue notices (UC-CN-01): Chưa thu, số dư > 0, ngày hiện tại > hạn thanh toán
  const now = new Date();
  const overdueNotices = paymentNotices.filter(n => {
    return n.status === 'Đang hiệu lực' &&
      n.paymentStatus === 'Chưa thu' &&
      new Date(n.dueDate) < now;
  });

  const [selectedNotice, setSelectedNotice] = useState<PaymentNotice | null>(overdueNotices[0] || null);

  // Reminder Modal (UC-CN-02)
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [remDate, setRemDate] = useState(new Date().toISOString().split('T')[0]);
  const [remChannel, setRemChannel] = useState<'Zalo' | 'Điện thoại' | 'Gặp trực tiếp'>('Zalo');
  const [remResult, setRemResult] = useState('');
  const [remNotes, setRemNotes] = useState('');

  // Promise Modal (UC-CN-03)
  const [showPromiseModal, setShowPromiseModal] = useState(false);
  const [promContent, setPromContent] = useState('');
  const [promDate, setPromDate] = useState('2026-10-25');
  const [promChannel, setPromChannel] = useState<'Zalo' | 'Điện thoại' | 'Gặp trực tiếp'>('Điện thoại');

  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice || !remResult.trim()) {
      alert('Kết quả trao đổi là trường bắt buộc.');
      return;
    }

    recordDebtReminder09_2({
      noticeId: selectedNotice.id,
      roomCode: selectedNotice.roomCode,
      leaseId: selectedNotice.leaseId,
      contactDate: remDate,
      channel: remChannel,
      result: remResult.trim(),
      notes: remNotes.trim() || undefined
    });

    setShowReminderModal(false);
    setRemResult('');
    setRemNotes('');
    alert('Ghi nhận lịch sử nhắc thanh toán thành công (UC-CN-02)!');
  };

  const handleSavePromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNotice || !promContent.trim()) {
      alert('Nội dung phản hồi là trường bắt buộc.');
      return;
    }

    recordDebtPromise09_3({
      noticeId: selectedNotice.id,
      roomCode: selectedNotice.roomCode,
      contactTime: new Date().toISOString(),
      channel: promChannel,
      content: promContent.trim(),
      hasPromiseDate: true,
      promisedDate: promDate
    });

    setShowPromiseModal(false);
    setPromContent('');
    alert('Ghi nhận phản hồi và ngày hẹn thanh toán thành công (UC-CN-03)! Lưu ý: Ngày hẹn không làm thay đổi hạn gốc.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 09</span>
            <h1 className="text-lg font-bold text-slate-900">Quản lý Công nợ (UC-CN-01 → UC-CN-04)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi số dư nợ quá hạn, ghi lịch sử nhắc nợ thủ công (sau hạn), ghi nhận hẹn thanh toán và tra cứu căn cứ nợ kéo dài.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs shrink-0">
          <button
            onClick={() => setActiveTab('overdue_list')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'overdue_list' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Nợ quá hạn (CN-01)
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'reminders' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Lịch sử nhắc nợ (CN-02)
          </button>
          <button
            onClick={() => setActiveTab('promises')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'promises' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Hẹn thanh toán (CN-03)
          </button>
          <button
            onClick={() => setActiveTab('long_debt_cn04')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === 'long_debt_cn04' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Căn cứ nợ kéo dài (CN-04)
          </button>
        </div>
      </div>

      {/* ==================== TAB 1: OVERDUE LIST (UC-CN-01) ==================== */}
      {activeTab === 'overdue_list' && (
        <div className="space-y-4">
          <div className="p-4 bg-red-50/60 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Nguyên tắc hiển thị công nợ (BR-UC.CN.01-01):</strong>
              <p className="mt-0.5 text-slate-700">
                Chỉ hiển thị các khoản Chưa thu có số dư lớn hơn 0 và đã quá hạn thanh toán đã lưu ở UC07.2. Khoản chưa đến hạn được theo dõi tại UC08.1.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <th className="py-2.5 px-3">Phòng</th>
                    <th className="py-2.5 px-3">Mã thông báo</th>
                    <th className="py-2.5 px-3">Kỳ thuê</th>
                    <th className="py-2.5 px-3">Hạn thanh toán gốc</th>
                    <th className="py-2.5 px-3">Số ngày quá hạn</th>
                    <th className="py-2.5 px-3">Số dư nợ chưa thu</th>
                    <th className="py-2.5 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueNotices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tuyệt vời! Hiện tại không có khoản nợ quá hạn nào.
                      </td>
                    </tr>
                  ) : (
                    overdueNotices.map((n) => {
                      const diffDays = Math.ceil((now.getTime() - new Date(n.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <tr key={n.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{n.roomCode}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{n.noticeCode}</td>
                          <td className="py-2.5 px-3">{n.periodCode}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-800">{n.dueDate}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-red-600">+{diffDays} ngày</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-red-700">
                            {n.totalAmount.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedNotice(n);
                                setShowReminderModal(true);
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Ghi nhắc nợ (CN-02)
                            </button>
                            <button
                              onClick={() => {
                                setSelectedNotice(n);
                                setShowPromiseModal(true);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              Ghi hẹn trả (CN-03)
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: REMINDERS (UC-CN-02) ==================== */}
      {activeTab === 'reminders' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC-CN-02: Lịch sử nhắc nợ thủ công</h2>
              <p className="text-xs text-slate-500">
                User tự liên hệ qua Zalo, điện thoại hoặc gặp trực tiếp và ghi lại kết quả. Không tự động gửi tin nhắn.
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {debtReminders.map((r) => (
              <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span className="font-bold text-slate-900">Phòng {r.roomCode} · Kênh: {r.channel}</span>
                  <span className="font-mono">{r.contactDate}</span>
                </div>
                <div className="text-slate-800 font-medium">Kết quả: {r.result}</div>
                {r.notes && <div className="text-slate-500 text-[11px]">{r.notes}</div>}
                <div className="text-[10px] text-slate-400 text-right">Người ghi: {r.loggedBy}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: PROMISES (UC-CN-03) ==================== */}
      {activeTab === 'promises' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC-CN-03: Ghi nhận phản hồi và ngày hẹn thanh toán</h2>
              <p className="text-xs text-slate-500">
                Ghi nhận cam kết ngày trả tiền của khách. Hạn thanh toán gốc của khoản nợ vẫn giữ nguyên (BR-CN03-01).
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {debtPromises.map((p) => (
              <div key={p.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-500 text-[11px]">
                  <span className="font-bold text-slate-900">Phòng {p.roomCode} · Kênh: {p.channel}</span>
                  <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                    Hẹn thanh toán vào: {p.promisedDate}
                  </span>
                </div>
                <p className="text-slate-700">{p.content}</p>
                <div className="text-[10px] text-slate-400 text-right">Người ghi: {p.loggedBy}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: LONG-TERM DEBT GROUND (UC-CN-04) ==================== */}
      {activeTab === 'long_debt_cn04' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC-CN-04: Tra cứu căn cứ xử lý nợ kéo dài</h2>
              <p className="text-xs text-slate-500">
                Hệ thống chỉ hỗ trợ tra cứu điều khoản hợp đồng và lịch sử nhắc/hẹn; không tự phạt, thu hồi nợ hoặc chấm dứt hợp đồng (BR-CN04-01).
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="font-semibold text-slate-800">Hồ sơ nợ quá hạn: Phòng P.302 (Kỳ 09/2026 - 4.150.000 đ)</div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg">
              <div>
                <span className="text-slate-400 block text-[11px]">Hợp đồng liên quan:</span>
                <span className="font-mono font-bold text-slate-900">HD-302-2026</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hạn thanh toán gốc:</span>
                <span className="font-mono text-red-600 font-bold">05/09/2026 (Quá hạn 41 ngày)</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
              <span className="font-bold text-slate-700 uppercase tracking-wider block text-[11px]">
                Điều khoản xử lý vi phạm trong hợp đồng:
              </span>
              <p className="text-slate-600 italic">
                "Khoản 5 Điều 4: Trường hợp Bên B chậm thanh toán tiền thuê hoặc chi phí dịch vụ quá 15 ngày kể từ ngày đến hạn thanh toán mà không có sự đồng ý bằng văn bản của Bên A, Bên A có quyền đơn phương chấm dứt hợp đồng và khấu trừ tiền cọc."
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-medium">
              Trạng thái căn cứ: <strong>Đủ tài liệu để xem xét</strong> (Đã có 2 lần nhắc và 1 lần hẹn thất hứa). Chủ nhà tự quyết định biện pháp trao đổi ngoài hệ thống.
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD REMINDER UC-CN-02 ==================== */}
      {showReminderModal && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận lịch sử nhắc nợ (UC-CN-02)</h3>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
              <div>Phòng: <strong>{selectedNotice.roomCode}</strong> (Thông báo: {selectedNotice.noticeCode})</div>
              <div>Số tiền nợ quá hạn: <strong className="font-mono text-red-700">{selectedNotice.totalAmount.toLocaleString('vi-VN')} đ</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ngày liên hệ <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={remDate}
                  onChange={(e) => setRemDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kênh liên hệ</label>
                <select
                  value={remChannel}
                  onChange={(e) => setRemChannel(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Zalo">Zalo</option>
                  <option value="Điện thoại">Điện thoại</option>
                  <option value="Gặp trực tiếp">Gặp trực tiếp</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Kết quả trao đổi <span className="text-red-500">*</span></label>
              <textarea
                value={remResult}
                onChange={(e) => setRemResult(e.target.value)}
                rows={2}
                placeholder="Ghi nhận phản hồi của khách..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowReminderModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveReminder}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu lịch sử nhắc nợ (CN-02)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD PROMISE UC-CN-03 ==================== */}
      {showPromiseModal && selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">Ghi nhận hẹn thanh toán (UC-CN-03)</h3>
            <p className="text-slate-500">
              Ngày hẹn trả tiền chỉ để theo dõi tiến độ, không làm thay đổi hạn thanh toán gốc của khoản nợ.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ngày khách hẹn thanh toán <span className="text-red-500">*</span></label>
              <input
                type="date"
                value={promDate}
                onChange={(e) => setPromDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nội dung cam kết của khách <span className="text-red-500">*</span></label>
              <textarea
                value={promContent}
                onChange={(e) => setPromContent(e.target.value)}
                rows={2}
                placeholder="Ví dụ: Khách hẹn 25/10 nhận lương sẽ chuyển khoản đầy đủ..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPromiseModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePromise}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu ngày hẹn (CN-03)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
