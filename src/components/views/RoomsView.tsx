import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Room, ContractExpiryBadge, TenantFeedbackBadge } from '../../types';
import {
  Home, Plus, Search, Filter, CheckCircle2, AlertCircle, Clock,
  Calendar, Eye, Edit3, ArrowRight, ShieldCheck, Key, FileText, CheckSquare, X
} from 'lucide-react';

export const RoomsView: React.FC = () => {
  const {
    rooms,
    roomHistory,
    returnPlans,
    contactLogs,
    contracts,
    handoverReports,
    returnInspections,
    addRoom,
    updateRoom,
    recordInitialPaymentPH07,
    confirmCheckInPH05,
    updateExpectedReturnDatePH11_12,
    recordTenantContactPH13,
    confirmReturnStep305AndVacantPH08,
    activeBankAccount
  } = useApp();

  // Active sub-tab
  const [subTab, setSubTab] = useState<'list' | 'expiry' | 'plans' | 'feedback'>('list');

  // Search & Filter
  const [searchCode, setSearchCode] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | 'Trống' | 'Đang thuê' | 'Sắp trả'>('Tất cả');

  // Selected Room for Details
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showPayment07Modal, setShowPayment07Modal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showExpectedDateModal, setShowExpectedDateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showCheckRentableModal, setShowCheckRentableModal] = useState(false);

  // Form states
  const [newCode, setNewCode] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newArea, setNewArea] = useState(25);
  const [newNote, setNewNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Payment 07 Form
  const [pay07Amount, setPay07Amount] = useState(7000000);
  const [pay07Txn, setPay07Txn] = useState('FT261016' + Math.floor(Math.random() * 89999 + 10000));
  const [pay07Date, setPay07Date] = useState('2026-10-16');

  // Expected date 11/12 Form
  const [expDateInput, setExpDateInput] = useState('');
  const [expSource, setExpSource] = useState<'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác'>('tin nhắn');
  const [expTime, setExpTime] = useState(new Date().toISOString().substring(0, 16));
  const [expContent, setExpContent] = useState('');
  const [expReason, setExpReason] = useState('');

  // Contact 13 Form
  const [contactTime, setContactTime] = useState(new Date().toISOString().substring(0, 16));
  const [contactSource, setContactSource] = useState<'trực tiếp' | 'điện thoại' | 'tin nhắn' | 'khác'>('tin nhắn');
  const [contactResult, setContactResult] = useState<'Chưa phản hồi' | 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả' | 'Chờ đối chiếu' | 'Đồng ý tiếp tục thuê'>('Chưa phản hồi');
  const [contactContent, setContactContent] = useState('');
  const [contactNextDate, setContactNextDate] = useState('');

  // Helper: compute contract expiry badge (BR-UC.PH.01-06)
  const getExpiryBadge = (contractEndDate?: string): ContractExpiryBadge => {
    if (!contractEndDate) return 'Chưa có dữ liệu';
    const end = new Date(contractEndDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 30) return 'Còn hạn';
    if (diff >= 1 && diff <= 30) return 'Sắp hết hạn hợp đồng';
    if (diff === 0) return 'Đến hạn hôm nay';
    return 'Đã hết hạn hợp đồng';
  };

  // Helper: compute feedback badge (BR-UC.PH.01-08 / BR-UC.PH.13-06)
  const getFeedbackBadge = (room: Room): TenantFeedbackBadge => {
    const logs = contactLogs.filter(c => c.roomCode === room.roomCode);
    if (room.expectedReturnDate) {
      return 'Đã phản hồi – Đã xác nhận ngày trả';
    }
    if (room.returnPlanCancelled) {
      return 'Đã phản hồi – Tiếp tục thuê';
    }
    if (logs.length === 0) {
      return 'Chưa có ghi nhận liên hệ';
    }
    const last = logs[0];
    if (last.contactResult === 'Không tiếp tục thuê – Chưa xác nhận ngày dự kiến trả') {
      return 'Đã phản hồi – Chưa xác nhận ngày trả';
    }
    if (last.contactResult === 'Đồng ý tiếp tục thuê') {
      return 'Đã phản hồi – Tiếp tục thuê';
    }
    return 'Chưa phản hồi';
  };

  // Filtered rooms
  const filteredRooms = rooms.filter(r => {
    const matchCode = !searchCode || r.roomCode.toLowerCase().includes(searchCode.toLowerCase());
    const matchStatus = statusFilter === 'Tất cả' || r.status === statusFilter;
    return matchCode && matchStatus;
  });

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const res = addRoom(newCode, newFloor, newArea, newNote);
    if (!res.success) {
      setFormError(res.message);
    } else {
      setShowAddModal(false);
      setNewCode('');
      setNewFloor(1);
      setNewArea(25);
      setNewNote('');
    }
  };

  const handleEditRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    setFormError(null);
    const res = updateRoom(selectedRoom.roomCode, newFloor, newArea, newNote);
    if (!res.success) {
      setFormError(res.message);
    } else {
      setShowEditModal(false);
      setSelectedRoom(rooms.find(r => r.roomCode === selectedRoom.roomCode) || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">Quy trình 01</span>
            <h1 className="text-lg font-bold text-slate-900">Quản lý Tình trạng Phòng (UC-PH-01 → UC-PH-15)</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý danh sách phòng, trạng thái sử dụng (Trống, Đang thuê, Sắp trả), điều kiện nhận/trả phòng và kế hoạch trả phòng.
          </p>
        </div>

        {/* Sub tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setSubTab('list')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${subTab === 'list' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Danh sách phòng
          </button>
          <button
            onClick={() => setSubTab('expiry')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${subTab === 'expiry' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Thời hạn thuê (PH-10)
          </button>
          <button
            onClick={() => setSubTab('plans')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${subTab === 'plans' ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Kế hoạch trả (PH-13)
          </button>
        </div>
      </div>

      {/* ==================== SUB-TAB 1: ROOMS LIST (UC-PH-01, 02, 03, 04) ==================== */}
      {subTab === 'list' && (
        <div className="space-y-4">
          {/* Controls: Search, Filter & Add */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Lọc theo mã phòng (VD: P.101, P.202)..."
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Trống">Trống</option>
                <option value="Đang thuê">Đang thuê</option>
                <option value="Sắp trả">Sắp trả (≤15 ngày)</option>
              </select>

              {(searchCode || statusFilter !== 'Tất cả') && (
                <button
                  onClick={() => { setSearchCode(''); setStatusFilter('Tất cả'); }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setFormError(null);
                setNewCode('');
                setNewFloor(1);
                setNewArea(25);
                setNewNote('');
                setShowAddModal(true);
              }}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm phòng (UC-PH-02)
            </button>
          </div>

          {/* Rooms Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">STT</th>
                    <th className="py-3 px-3">Mã phòng</th>
                    <th className="py-3 px-3">Tầng</th>
                    <th className="py-3 px-3">Diện tích</th>
                    <th className="py-3 px-3">Trạng thái phòng</th>
                    <th className="py-3 px-3">Đã cọc</th>
                    <th className="py-3 px-3">Đã thu thuê đầu</th>
                    <th className="py-3 px-3">Khách thuê hiện tại</th>
                    <th className="py-3 px-3">Hạn hợp đồng</th>
                    <th className="py-3 px-3">Ngày dự kiến trả</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredRooms.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        Không tìm thấy phòng phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredRooms.map((room, idx) => {
                      const expBadge = getExpiryBadge(room.contractEndDate);
                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{room.roomCode}</td>
                          <td className="py-3 px-3">{room.floor}</td>
                          <td className="py-3 px-3 font-mono">{room.area} m²</td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${room.status === 'Trống' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : room.status === 'Sắp trả' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                              {room.status}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[11px] font-medium ${room.hasDeposit ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {room.hasDeposit ? 'Đã cọc' : 'Chưa'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[11px] font-medium ${room.firstMonthRentPaid ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {room.firstMonthRentPaid ? 'Đã thanh toán' : 'Chưa'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">
                            {room.currentTenantName || <span className="text-slate-400 italic">Chưa ghi nhận</span>}
                          </td>
                          <td className="py-3 px-3">
                            {room.contractEndDate ? (
                              <div className="space-y-0.5">
                                <div className="font-mono text-slate-700">{room.contractEndDate}</div>
                                <span className={`text-[10px] block font-semibold ${expBadge === 'Sắp hết hạn hợp đồng' ? 'text-amber-600' : expBadge === 'Đã hết hạn hợp đồng' ? 'text-red-600' : 'text-slate-500'}`}>
                                  {expBadge}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Chưa có dữ liệu</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {room.expectedReturnDate ? (
                              <span className="font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                {room.expectedReturnDate}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => setSelectedRoom(room)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Xem chi tiết
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

      {/* ==================== SUB-TAB 2: CONTRACT EXPIRY TRACKING (UC-PH-10) ==================== */}
      {subTab === 'expiry' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC-PH-10: Theo dõi thời hạn thuê</h2>
              <p className="text-xs text-slate-500">Phân loại nhãn độc lập dựa trên khoảng ngày còn lại: Còn hạn (&gt;30d), Sắp hết hạn (1-30d), Đến hạn hôm nay, Đã hết hạn.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Mã phòng</th>
                  <th className="py-2.5 px-3">Khách thuê</th>
                  <th className="py-2.5 px-3">Hợp đồng</th>
                  <th className="py-2.5 px-3">Bắt đầu</th>
                  <th className="py-2.5 px-3">Hết hạn</th>
                  <th className="py-2.5 px-3">Nhãn thời hạn</th>
                  <th className="py-2.5 px-3">Nhãn phản hồi</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rooms.filter(r => r.contractEndDate).map(r => {
                  const badge = getExpiryBadge(r.contractEndDate);
                  const fbBadge = getFeedbackBadge(r);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{r.roomCode}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{r.currentTenantName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{r.currentContractId}</td>
                      <td className="py-2.5 px-3 font-mono">{r.contractStartDate}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold">{r.contractEndDate}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${badge === 'Sắp hết hạn hợp đồng' ? 'bg-amber-100 text-amber-800' : badge === 'Đã hết hạn hợp đồng' ? 'bg-red-100 text-red-800' : 'bg-emerald-50 text-emerald-700'}`}>
                          {badge}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[11px] text-slate-600">{fbBadge}</td>
                      <td className="py-2.5 px-3 text-right space-x-1.5">
                        <button
                          onClick={() => { setSelectedRoom(r); setShowExpectedDateModal(true); }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium cursor-pointer"
                        >
                          Ghi ngày trả (PH-11)
                        </button>
                        <button
                          onClick={() => { setSelectedRoom(r); setShowContactModal(true); }}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-medium cursor-pointer"
                        >
                          Ghi liên hệ (PH-13)
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== SUB-TAB 3: RETURN PLANS & FEEDBACK (UC-PH-13) ==================== */}
      {subTab === 'plans' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">UC-PH-13: Theo dõi kế hoạch và phản hồi trả phòng</h2>
              <p className="text-xs text-slate-500">Quản lý 2 thẻ: Kế hoạch trả và Nhật ký phản hồi liên hệ khách thuê.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Kế hoạch trả đang theo dõi */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                1. Kế hoạch trả phòng đang theo dõi
              </h3>
              <div className="space-y-2">
                {rooms.filter(r => r.expectedReturnDate).map(r => (
                  <div key={r.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between items-center font-semibold">
                      <span className="font-bold text-slate-900">{r.roomCode} - {r.currentTenantName}</span>
                      <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Ngày trả: {r.expectedReturnDate}
                      </span>
                    </div>
                    <div className="text-slate-600 flex justify-between">
                      <span>Trạng thái phòng: <strong>{r.status}</strong></span>
                      <button
                        onClick={() => { setSelectedRoom(r); setShowExpectedDateModal(true); }}
                        className="text-blue-600 underline font-medium cursor-pointer"
                      >
                        Cập nhật ngày trả (PH-12)
                      </button>
                    </div>
                  </div>
                ))}
                {rooms.filter(r => r.expectedReturnDate).length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">Không có phòng nào có kế hoạch trả đang theo dõi.</p>
                )}
              </div>
            </div>

            {/* Nhật ký liên hệ (Phản hồi) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                2. Nhật ký liên hệ & phản hồi thực tế
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {contactLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>{log.roomCode} · Kênh: {log.contactSource}</span>
                      <span className="font-mono">{log.contactTimeActual}</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      Kết quả: {log.contactResult}
                    </div>
                    <p className="text-slate-600 text-[11px]">{log.content}</p>
                    {log.nextContactDate && (
                      <span className="text-[10px] text-blue-600 font-medium">Hẹn liên hệ lại: {log.nextContactDate}</span>
                    )}
                  </div>
                ))}
                {contactLogs.length === 0 && (
                  <p className="text-xs text-slate-400 py-4 text-center">Chưa có ghi nhận liên hệ nào.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SELECTED ROOM DETAIL DRAWER/MODAL ==================== */}
      {selectedRoom && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Chi tiết phòng: {selectedRoom.roomCode}</h3>
              </div>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tầng</span>
                  <span className="font-bold text-slate-800">{selectedRoom.floor}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Diện tích</span>
                  <span className="font-bold text-slate-800">{selectedRoom.area} m²</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Trạng thái phòng</span>
                  <span className={`inline-block font-bold px-1.5 py-0.5 rounded ${selectedRoom.status === 'Trống' ? 'text-emerald-700 bg-emerald-100' : selectedRoom.status === 'Sắp trả' ? 'text-amber-800 bg-amber-100' : 'text-blue-700 bg-blue-100'}`}>
                    {selectedRoom.status}
                  </span>
                </div>
              </div>

              {/* Badges Overview */}
              <div className="space-y-1.5 p-3 rounded-xl border border-slate-200 bg-white">
                <div className="font-semibold text-slate-700 mb-1">Các nhóm nhãn độc lập (BR-UC.PH.01-08):</div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500">Đã cọc:</span>{' '}
                    <strong className={selectedRoom.hasDeposit ? 'text-emerald-600' : 'text-slate-400'}>
                      {selectedRoom.hasDeposit ? 'Đã cọc' : 'Chưa'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Tiền thuê kỳ đầu:</span>{' '}
                    <strong className={selectedRoom.firstMonthRentPaid ? 'text-emerald-600' : 'text-slate-400'}>
                      {selectedRoom.firstMonthRentPaid ? 'Đã thanh toán (PH-07)' : 'Chưa'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Hạn hợp đồng:</span>{' '}
                    <strong className="text-blue-700">{getExpiryBadge(selectedRoom.contractEndDate)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Phản hồi khách:</span>{' '}
                    <strong className="text-slate-800">{getFeedbackBadge(selectedRoom)}</strong>
                  </div>
                </div>
              </div>

              {/* Action buttons mapped to Use Cases */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Các chức năng nghiệp vụ liên quan (UC-PH)
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewFloor(selectedRoom.floor);
                      setNewArea(selectedRoom.area);
                      setNewNote(selectedRoom.note || '');
                      setShowEditModal(true);
                    }}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer"
                  >
                    Chỉnh sửa thông tin phòng (UC-PH-02)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCheckRentableModal(true)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer"
                  >
                    Kiểm tra khả năng cho thuê (UC-PH-03)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPayment07Modal(true)}
                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer"
                  >
                    Thu tiền cọc & thuê đầu (UC-PH-07)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCheckInModal(true)}
                    className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer"
                  >
                    Kiểm tra điều kiện nhận phòng (UC-PH-05)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowExpectedDateModal(true)}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer"
                  >
                    Ghi/Cập nhật ngày dự kiến trả (PH-11/12)
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReturnModal(true)}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer"
                  >
                    Kiểm tra kết quả trả phòng (UC-PH-08)
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedRoom(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD ROOM MODAL (UC-PH-02) ==================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6">
            <h3 className="font-bold text-slate-900 text-base mb-3">Thêm phòng mới (UC-PH-02)</h3>
            <form onSubmit={handleAddRoomSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã phòng (duy nhất) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="Ví dụ: P.501"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tầng (≥ 0) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Diện tích m² (&gt; 0) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú (tối đa 500 ký tự)
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  maxLength={500}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  placeholder="Ghi chú về tiện ích, ban công..."
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Lưu phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CHECK RENTABLE MODAL (UC-PH-03) ==================== */}
      {showCheckRentableModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Kiểm tra khả năng cho thuê (UC-PH-03)</h3>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Phòng:</span>
                <span className="font-bold">{selectedRoom.roomCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái hiện tại:</span>
                <span className="font-semibold">{selectedRoom.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hợp đồng liên quan:</span>
                <span>{selectedRoom.currentContractId || 'Không có'}</span>
              </div>
            </div>

            {/* Evaluation Result */}
            {selectedRoom.status === 'Trống' ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Có thể giới thiệu</strong>
                  Phòng đang Trống và không có cam kết giao phòng cho khách khác. Đủ điều kiện giới thiệu cho khách thuê mới.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Chưa phù hợp</strong>
                  Phòng đang ở trạng thái {selectedRoom.status}. Kể cả có ngày dự kiến trả hoặc sắp hết hạn hợp đồng, không thay thế kết quả nhận lại phòng thực tế (BR-UC.PH.03-01/02).
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setShowCheckRentableModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PH-07 INITIAL PAYMENT MODAL ==================== */}
      {showPayment07Modal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Ghi nhận hoàn tất 1 tháng tiền cọc và 1 tháng tiền thuê đầu (UC-PH-07)
            </h3>
            <p className="text-xs text-slate-500">
              Đối chiếu số tiền khách đã chuyển khoản khi ký hợp đồng lần đầu. Hệ thống ghi riêng 2 khoản cọc gốc 1 tháng và tiền thuê kỳ đầu.
            </p>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Phòng:</span> <strong>{selectedRoom.roomCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Tiền cọc (1 tháng):</span> <strong>3.500.000 đ</strong>
              </div>
              <div className="flex justify-between">
                <span>Tiền thuê kỳ đầu (1 tháng):</span> <strong>3.500.000 đ</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-blue-200 text-blue-900 font-bold">
                <span>Tổng cần chuyển khoản:</span> <span>7.000.000 đ</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phương thức thanh toán <span className="text-slate-400 font-normal">(Cố định theo quy định)</span>
                </label>
                <div className="px-3 py-2 bg-slate-100 rounded-lg text-slate-700 font-medium">
                  Chuyển khoản ngân hàng (Không tích hợp tiền mặt)
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số tiền thực nhận (đ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={pay07Amount}
                  onChange={(e) => setPay07Amount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold text-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ngày nhận tiền <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={pay07Date}
                    onChange={(e) => setPay07Date(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mã giao dịch ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pay07Txn}
                    onChange={(e) => setPay07Txn(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowPayment07Modal(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const res = recordInitialPaymentPH07({
                    roomCode: selectedRoom.roomCode,
                    leaseId: selectedRoom.currentLeaseId || 'THUE-' + selectedRoom.roomCode,
                    contractId: selectedRoom.currentContractId || 'HD-' + selectedRoom.roomCode,
                    depositAmount: 3500000,
                    firstMonthRentAmount: 3500000,
                    actualAmount: pay07Amount,
                    receivedDate: pay07Date,
                    transactionCode: pay07Txn,
                    bankAccountReceived: activeBankAccount?.bankName + ' - ' + activeBankAccount?.accountNumber
                  });
                  if (res.success) {
                    setShowPayment07Modal(false);
                    alert(res.message);
                  } else {
                    alert(res.message);
                  }
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Xác nhận đã thu đủ (UC-PH-07)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PH-05 CHECK IN VERIFICATION MODAL ==================== */}
      {showCheckInModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              Kiểm tra điều kiện nhận phòng (UC-PH-05)
            </h3>
            <p className="text-xs text-slate-500">
              Đối chiếu 4 tiêu chí bắt buộc theo thứ tự trước khi chuyển phòng sang trạng thái Đang thuê.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>1. Hợp đồng đã ký & có hiệu lực</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đạt
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>2. Tiền cọc 1 tháng (xác nhận tại PH-07)</span>
                <span className={`font-bold flex items-center gap-1 ${selectedRoom.hasDeposit ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedRoom.hasDeposit ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {selectedRoom.hasDeposit ? 'Đạt' : 'Chưa đạt'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>3. Tiền thuê tháng đầu 1 tháng (xác nhận tại PH-07)</span>
                <span className={`font-bold flex items-center gap-1 ${selectedRoom.firstMonthRentPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {selectedRoom.firstMonthRentPaid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {selectedRoom.firstMonthRentPaid ? 'Đạt' : 'Chưa đạt'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <span>4. Biên bản nhận phòng UC-BG03 Đã xác nhận (hai bên đã ký giấy)</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đạt
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowCheckInModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const res = confirmCheckInPH05(selectedRoom.roomCode, selectedRoom.currentLeaseId || 'THUE-303-L1', '2026-10-16');
                  alert(res.message);
                  if (res.success) setShowCheckInModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Xác nhận nhận phòng hoàn tất (UC-PH-05)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PH-11/12 EXPECTED RETURN DATE MODAL ==================== */}
      {showExpectedDateModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-3.5 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              {selectedRoom.expectedReturnDate ? 'Cập nhật ngày dự kiến trả (UC-PH-12)' : 'Ghi nhận ngày dự kiến trả lần đầu (UC-PH-11)'}
            </h3>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ngày dự kiến trả phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expDateInput}
                onChange={(e) => setExpDateInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[11px] text-slate-500 block mt-1">
                Ngưỡng 15 ngày: Nếu còn &le; 15 ngày, hệ thống tự chuyển phòng sang Sắp trả; nếu &gt; 15 ngày giữ Đang thuê.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nguồn khách xác nhận <span className="text-red-500">*</span>
              </label>
              <select
                value={expSource}
                onChange={(e) => setExpSource(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              >
                <option value="tin nhắn">Tin nhắn Zalo/SMS</option>
                <option value="điện thoại">Điện thoại</option>
                <option value="trực tiếp">Gặp trực tiếp</option>
                <option value="khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Thời điểm xác nhận thực tế (không ở tương lai) <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={expTime}
                onChange={(e) => setExpTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nội dung trao đổi xác minh được <span className="text-red-500">*</span>
              </label>
              <textarea
                value={expContent}
                onChange={(e) => setExpContent(e.target.value)}
                rows={2}
                placeholder="Ghi rõ lý do và ngày khách hẹn trả chìa khóa..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowExpectedDateModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!expDateInput || !expContent) {
                    alert('Vui lòng nhập ngày dự kiến và nội dung trao đổi.');
                    return;
                  }
                  const res = updateExpectedReturnDatePH11_12({
                    roomCode: selectedRoom.roomCode,
                    leaseId: selectedRoom.currentLeaseId || 'THUE-' + selectedRoom.roomCode,
                    expectedDate: expDateInput,
                    confirmSource: expSource,
                    confirmedAt: expTime,
                    exchangeContent: expContent,
                    reason: expReason
                  });
                  alert(res.message);
                  setShowExpectedDateModal(false);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Lưu ngày dự kiến trả
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PH-08 RETURN CHECK MODAL ==================== */}
      {showReturnModal && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base">
              Kiểm tra kết quả trả phòng (UC-PH-08)
            </h3>
            <p className="text-slate-500">
              Hệ thống lấy kết quả nhận lại thực tế và xác nhận của Chủ nhà ở bước 3.04 và 3.05 của quy trình bàn giao tài sản.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span>Phòng:</span> <strong>{selectedRoom.roomCode}</strong>
              </div>
              <div className="flex justify-between">
                <span>Kết quả 3.04:</span> <strong className="text-emerald-700">Đã nhận lại thực tế</strong>
              </div>
              <div className="flex justify-between">
                <span>Xác nhận 3.05:</span> <strong className="text-emerald-700">Chủ nhà đã xác nhận độc lập</strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const res = confirmReturnStep305AndVacantPH08(selectedRoom.roomCode, selectedRoom.currentLeaseId || 'THUE-' + selectedRoom.roomCode);
                  alert(res.message);
                  if (res.success) setShowReturnModal(false);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold cursor-pointer"
              >
                Cập nhật trạng thái Trống (UC-PH-08)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
