import React, { useState } from 'react';
import { Search, X, CheckSquare, ArrowRight, BookOpen, Layers } from 'lucide-react';

export interface UseCaseMeta {
  code: string;
  name: string;
  process: string;
  tabKey: string;
  priority: 'Must' | 'Should';
  description: string;
}

export const ALL_USE_CASES: UseCaseMeta[] = [
  // Mục 0
  { code: 'UC-TK-01', name: 'Đăng nhập', process: 'Mục 0.1 - Quản lý tài khoản', tabKey: 'auth_login', priority: 'Must', description: 'Đăng nhập bằng tên đăng nhập và mật khẩu, kiểm tra phiên, khóa sau 5 lần sai, AF-01 đổi mật khẩu lần đầu.' },
  { code: 'UC-TK-02', name: 'Đăng xuất', process: 'Mục 0.1 - Quản lý tài khoản', tabKey: 'auth_logout', priority: 'Must', description: 'Thu hồi phiên hiện tại trên máy chủ, xóa dữ liệu xác thực, thông báo Đăng xuất thành công!' },
  { code: 'UC-TK-03', name: 'Xem tài khoản và đổi mật khẩu', process: 'Mục 0.1 - Quản lý tài khoản', tabKey: 'auth_profile', priority: 'Must', description: 'Xem tên đăng nhập chỉ đọc, đổi mật khẩu >= 12 ký tự, khóa đổi mật khẩu 15 phút nếu sai 5 lần.' },
  { code: 'UC-TK-04', name: 'Quên mật khẩu (khôi phục qua email)', process: 'Mục 0.1 - Quản lý tài khoản', tabKey: 'auth_forgot', priority: 'Must', description: 'Nhận liên kết đặt lại mật khẩu qua email xác minh, hiệu lực 15 phút, đặt lại mật khẩu mới.' },
  { code: 'UC-CH-01', name: 'Thiết lập và cập nhật đơn giá điện, nước và phí dịch vụ', process: 'Mục 0.2 - Cấu hình thu tiền', tabKey: 'config', priority: 'Must', description: 'Đơn giá điện (đ/kWh), nước (đ/m3), phí dịch vụ cố định theo phòng/kỳ, kỳ hiệu lực và lịch sử.' },
  { code: 'UC-CH-02', name: 'Quản lý tài khoản ngân hàng nhận thanh toán', process: 'Mục 0.2 - Cấu hình thu tiền', tabKey: 'config', priority: 'Must', description: 'Thiết lập tài khoản ngân hàng nhận tiền chuyển khoản, tạo mã QR, cảnh báo thông báo cần thay thế QR.' },

  // QT01
  { code: 'UC-PH-01', name: 'Xem thông tin phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Danh sách phòng, trạng thái Trống/Đang thuê/Sắp trả, nhãn hạn hợp đồng, nhãn phản hồi, chi tiết phòng.' },
  { code: 'UC-PH-02', name: 'Thêm và cập nhật thông tin phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Thêm phòng mới (Mã phòng duy nhất, Tầng >=0, Diện tích >0, Ghi chú), sửa và lịch sử thay đổi.' },
  { code: 'UC-PH-03', name: 'Kiểm tra khả năng cho thuê', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Kiểm tra phòng Trống và không có hợp đồng chờ giao để kết luận Có thể giới thiệu / Chưa phù hợp.' },
  { code: 'UC-PH-04', name: 'Cập nhật trạng thái phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Tự động tính trạng thái Sắp trả (<=15 ngày), Đang thuê, hoặc Trống theo kết quả bàn giao thực tế 3.05.' },
  { code: 'UC-PH-05', name: 'Kiểm tra điều kiện nhận phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Kiểm tra 4 điều kiện: hợp đồng hiệu lực, cọc 1 tháng, thuê tháng đầu 1 tháng, biên bản nhận phòng Đã xác nhận.' },
  { code: 'UC-PH-06', name: 'Ghi nhận điều kiện còn thiếu', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Theo dõi hợp đồng hoặc bàn giao còn thiếu khi tiền đã đủ; ghi nhận khách dừng thủ tục thuê.' },
  { code: 'UC-PH-07', name: 'Ghi nhận hoàn tất 1 tháng cọc và 1 tháng tiền thuê đầu', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Ghi nhận chuyển khoản đủ 2 dòng cọc gốc 1 tháng + thuê tháng đầu 1 tháng, tài khoản nhận, mã giao dịch.' },
  { code: 'UC-PH-08', name: 'Kiểm tra kết quả trả phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Kiểm tra kết quả 3.04/3.05; Cập nhật trạng thái Trống khi 3.04=Đã nhận lại và 3.05 Đã xác nhận độc lập.' },
  { code: 'UC-PH-09', name: 'Ghi nhận chưa bàn giao xong', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Ghi lý do khách chưa thể tiếp tục bàn giao (3.04=Chưa nhận lại); chỉ báo Chưa kết thúc thuê.' },
  { code: 'UC-PH-10', name: 'Theo dõi thời hạn thuê', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Bảng theo dõi hạn hợp đồng, cảnh báo 30 ngày, bộ lọc nhãn và khoảng ngày / N ngày cần theo dõi.' },
  { code: 'UC-PH-11', name: 'Ghi nhận ngày dự kiến trả', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Ghi ngày trả lần đầu sau khi khách xác nhận: nguồn, thời điểm, nội dung; tính mốc 15 ngày.' },
  { code: 'UC-PH-12', name: 'Cập nhật ngày dự kiến trả', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Sửa ngày trả có lý do, nguồn, thời điểm; tính lại trạng thái Sắp trả (<=15 ngày) / Đang thuê (>15 ngày).' },
  { code: 'UC-PH-13', name: 'Theo dõi kế hoạch và phản hồi trả phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: '2 thẻ: Kế hoạch trả và Phản hồi; ghi nhật ký liên hệ, nhãn phản hồi hiện hành, xử lý mâu thuẫn Chờ đối chiếu.' },
  { code: 'UC-PH-14', name: 'Hủy kế hoạch trả phòng', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Tự động hủy kế hoạch trả cũ khi hợp đồng nối tiếp có hiệu lực; xem kết quả Đã hủy do gia hạn.' },
  { code: 'UC-PH-15', name: 'Kiểm tra kết quả tiếp tục thuê', process: 'Quy trình 01 - Tình trạng phòng', tabKey: 'rooms', priority: 'Must', description: 'Tra cứu kết quả hợp đồng nối tiếp có hiệu lực từ UC-HDT-07.' },

  // QT02
  { code: 'UC-BG01', name: 'Kiểm kê tài sản phòng', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Kiểm kê danh mục tài sản, số lượng thực tế, tình trạng; Trạng thái kiểm kê Nháp/Đã hoàn tất, liên kết Chưa/Đã liên kết.' },
  { code: 'UC-BG02', name: 'Ghi nhận hiện trạng tài sản', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Ghi mô tả, ảnh (tối đa 10 ảnh), link video HTTP(S), chốt chỉ số điện nước 1.03, khách kiểm tra 1.04, bổ sung 1.05.' },
  { code: 'UC-BG03', name: 'Lập biên bản nhận phòng', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Biên bản nhận phòng 3 trạng thái: Nháp / Đã lập / Đã xác nhận; khách ký 1.07 và chủ nhà ký 1.08 trên giấy.' },
  { code: 'UC-BG04', name: 'Ghi nhận sự cố tài sản', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Ghi sự cố, nguyên nhân, trách nhiệm, tình trạng Chưa xử lý/Đang xử lý/Đã xử lý; chi phí tham khảo.' },
  { code: 'UC-BG05', name: 'Tra cứu lịch sử sự cố tài sản', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Lọc lịch sử sự cố theo kỳ thuê, tài sản, từ khóa để đối chiếu khi khách trả phòng.' },
  { code: 'UC-BG06', name: 'Đối chiếu tài sản khi trả phòng', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'So sánh tài sản thực tế khi trả với biên bản nhận phòng BG03 sau khi 3.05 đã xác nhận Đã nhận lại.' },
  { code: 'UC-BG07', name: 'Ghi nhận kết quả đối chiếu tài sản', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Ghi nhận chênh lệch, ý kiến các bên, tình trạng thống nhất; nhắc bước 3.18 chuyển sang quyết toán cọc.' },
  { code: 'UC-BG08', name: 'Khởi tạo biên bản trả phòng', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Khởi tạo biên bản trả phòng trạng thái Nháp gắn phòng, lần thuê và biên bản nhận phòng gốc.' },
  { code: 'UC-BG09', name: 'Ghi nhận kết quả nhận lại phòng', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Bước 3.03 kiểm tra; 3.04 ghi Đã nhận lại / Chưa nhận lại; 3.05 Chủ nhà xác nhận độc lập Đã nhận lại.' },
  { code: 'UC-BG10', name: 'Theo dõi kết quả đối soát cọc', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Theo dõi kết quả 5.8 từ Quy trình 05; ghi vào biên bản trả phòng; nhãn Chờ kết quả / Cần rà soát.' },
  { code: 'UC-BG11', name: 'Hoàn thiện biên bản trả phòng', process: 'Quy trình 02 - Bàn giao & Tài sản', tabKey: 'handover', priority: 'Must', description: 'Hoàn thiện biên bản trả: Nháp -> Đã lập -> Đã xác nhận; ghi nhận Khách đã ký giấy hoặc Khách không ký + lý do.' },

  // QT03
  { code: 'UC-HSKT-01', name: 'Ghi nhận hồ sơ khách thuê', process: 'Quy trình 03 - Hồ sơ khách thuê', tabKey: 'tenants', priority: 'Must', description: 'Tra cứu trước, rà trùng, họ tên, SĐT, định danh, trạng thái giấy tờ Đã/Chưa cung cấp, kết quả Chưa xác minh/Hợp lệ.' },
  { code: 'UC-HSKT-02', name: 'Quản lý người ở cùng', process: 'Quy trình 03 - Hồ sơ khách thuê', tabKey: 'tenants', priority: 'Must', description: 'Quản lý danh sách người ở cùng: Nháp / Dự kiến / Đang cư trú / Đã kết thúc; đóng cư trú theo ngày nhận lại 3.04/3.05.' },
  { code: 'UC-HSKT-03', name: 'Kiểm tra thông tin thay đổi', process: 'Quy trình 03 - Hồ sơ khách thuê', tabKey: 'tenants', priority: 'Must', description: 'Kiểm tra bộ dữ liệu thay đổi (chế độ A) hoặc đối chiếu định danh trước ký (chế độ B); kết quả Đạt / Chưa đạt / Chưa xác minh.' },
  { code: 'UC-HSKT-04', name: 'Cập nhật hồ sơ khách thuê', process: 'Quy trình 03 - Hồ sơ khách thuê', tabKey: 'tenants', priority: 'Must', description: 'Cập nhật hồ sơ khi có kết quả HSKT-03 Đạt còn hiệu lực; so sánh trước/sau và lưu lịch sử.' },
  { code: 'UC-HSKT-05', name: 'Tra cứu lịch sử hồ sơ khách thuê', process: 'Quy trình 03 - Hồ sơ khách thuê', tabKey: 'tenants', priority: 'Must', description: 'Tra cứu lịch sử thay đổi thông tin khách, chuỗi lần thuê, người ở cùng và các mốc nhận/trả thực tế.' },

  // QT04
  { code: 'UC-HDT-01', name: 'Điều chỉnh điều kiện thuê', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Mã yêu cầu tiếp nhận, phòng dự kiến, thời hạn theo lịch đợt, tiền thuê, cọc 1 tháng, thanh toán Chuyển khoản; 4.4a1 khách đồng ý.' },
  { code: 'UC-HDT-02', name: 'Lập hợp đồng thuê lần đầu', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Lập dự thảo Nháp, cấp mã lần thuê dự kiến; thời hạn theo đợt, cọc 1 tháng, tiền thuê tháng đầu 1 tháng; khách vào giữa đợt.' },
  { code: 'UC-HDT-03', name: 'Điều chỉnh dự thảo hợp đồng', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Chỉ chỉnh sửa hợp đồng ở trạng thái Nháp; hợp đồng đã ký không được sửa, hủy hay ký lại.' },
  { code: 'UC-HDT-04', name: 'Ghi nhận hợp đồng thuê lần đầu đã ký', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Ghi nhận bản ký giấy 2 bên, ngày ký, chứng cứ; khóa điều khoản; trạng thái Đã ký; Chờ hiệu lực / Hiệu lực; mở PH-07.' },
  { code: 'UC-HDT-05', name: 'Theo dõi hạn hợp đồng', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Theo dõi ngày bắt đầu, kết thúc, các nhãn hạn; liên kết Lập hợp đồng gia hạn (HDT-06) và Kế hoạch trả (PH-13).' },
  { code: 'UC-HDT-06', name: 'Lập hợp đồng nối tiếp', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Lập hợp đồng gia hạn mới, kế thừa mã và số tiền cọc gốc của hợp đồng đầu tiên, không thu cọc mới.' },
  { code: 'UC-HDT-07', name: 'Ghi nhận ký và kích hoạt hợp đồng nối tiếp', process: 'Quy trình 04 - Hợp đồng thuê', tabKey: 'contracts', priority: 'Must', description: 'Ghi nhận ký giấy; khi có hiệu lực: hợp đồng cũ Kết thúc, hợp đồng mới Hiệu lực, phòng Đang thuê, tự hủy kế hoạch trả cũ.' },

  // QT05
  { code: 'UC-QTC-01', name: 'Lập quyết toán cọc', process: 'Quy trình 05 - Quyết toán cọc', tabKey: 'settlement', priority: 'Must', description: 'Lập phiếu khi 3.05 Đã nhận lại; cọc gốc từ hợp đồng đầu; bảng tính kỳ cuối TT-03; các khoản trừ; trạng thái Đang lập.' },
  { code: 'UC-QTC-02', name: 'Sửa quyết toán cọc', process: 'Quy trình 05 - Quyết toán cọc', tabKey: 'settlement', priority: 'Must', description: 'Ghi nhận phản hồi khách (Đồng ý/Không đồng ý/Chưa phản hồi/Không liên hệ được); nhật ký liên hệ; điều chỉnh khấu trừ; Tranh chấp.' },
  { code: 'UC-QTC-03', name: 'Ghi nhận kết quả quyết toán', process: 'Quy trình 05 - Quyết toán cọc', tabKey: 'settlement', priority: 'Must', description: 'Xác nhận khi Khách đồng ý; MỘT chứng từ chuyển khoản duy nhất cho số tiền hoàn hoặc thu thêm; cập nhật công nợ; phát hành 5.8.' },

  // QT06
  { code: 'UC-TT-01', name: 'Ghi nhận chỉ số điện/nước', process: 'Quy trình 06 - Tính tiền theo kỳ', tabKey: 'billing', priority: 'Must', description: 'Ghi chỉ số đầu/cuối theo kỳ chung hoặc ngoài kỳ; xử lý công tơ bất thường nhập Sản lượng thực tế đã xác minh; cờ Chờ xác minh.' },
  { code: 'UC-TT-02', name: 'Sửa chỉ số điện/nước', process: 'Quy trình 06 - Tính tiền theo kỳ', tabKey: 'billing', priority: 'Should', description: 'Sửa chỉ số kỳ chưa thu tiền; mở khóa dòng -> Nháp - điều chỉnh; tính lại TT-03; kỳ đã thu chỉ lưu hồ sơ sai sót.' },
  { code: 'UC-TT-03', name: 'Tính tiền theo kỳ', process: 'Quy trình 06 - Tính tiền theo kỳ', tabKey: 'billing', priority: 'Must', description: 'Tách riêng Kỳ tiền thuê tiếp theo trả trước & Kỳ dịch vụ vừa ở trả sau; áp đơn giá UC-CH-01; kỳ đầu đã thanh toán không thu lại; Xác nhận bảng tính.' },

  // QT07
  { code: 'UC07.1', name: 'Đối chiếu khoản phải thu', process: 'Quy trình 07 - Thông báo thu tiền', tabKey: 'notices', priority: 'Must', description: 'Đối chiếu khoản thuê kỳ tiếp theo và điện nước dịch vụ kỳ vừa ở; nợ cũ xem riêng; không thu trùng kỳ đầu.' },
  { code: 'UC07.2', name: 'Lập thông báo thanh toán', process: 'Quy trình 07 - Thông báo thu tiền', tabKey: 'notices', priority: 'Must', description: 'Tạo thông báo tổng + 1 mã QR cố định số tiền và nội dung chuyển khoản theo UC-CH-02; chọn hạn thanh toán; thông báo thay thế giữ hạn gốc.' },
  { code: 'UC07.3', name: 'Chia sẻ thông báo qua Zalo', process: 'Quy trình 07 - Thông báo thu tiền', tabKey: 'notices', priority: 'Must', description: 'Xem chi tiết, tải ảnh thông báo có mã QR để tự gửi thủ công qua Zalo; không tự gửi hay tự đánh dấu Đã gửi/Đã thu.' },

  // QT08
  { code: 'UC08.1', name: 'Theo dõi thanh toán', process: 'Quy trình 08 - Thu tiền', tabKey: 'receipts', priority: 'Must', description: 'Danh sách thông báo; trạng thái Đang hiệu lực / Đã thay thế; trạng thái thanh toán Chưa thu / Đã thu; nhãn Quá hạn.' },
  { code: 'UC08.2', name: 'Xác nhận thu tiền', process: 'Quy trình 08 - Thu tiền', tabKey: 'receipts', priority: 'Must', description: 'Kiểm tra giao dịch ngân hàng; nhập mã giao dịch, ngày nhận, số tiền thực nhận; xác nhận 1 lần cho cả thông báo; Sửa xác nhận thu nhầm có lý do.' },

  // QT09
  { code: 'UC-CN-01', name: 'Theo dõi số dư công nợ', process: 'Quy trình 09 - Quản lý công nợ', tabKey: 'debts', priority: 'Must', description: 'Danh sách nợ quá hạn: chỉ khoản Chưa thu đã quá hạn thanh toán; số dư > 0; khoản nợ bù cọc ghi Đã xử lý bằng cọc.' },
  { code: 'UC-CN-02', name: 'Ghi nhận lịch sử nhắc thanh toán', process: 'Quy trình 09 - Quản lý công nợ', tabKey: 'debts', priority: 'Must', description: 'Chỉ nhắc sau hạn thanh toán; kênh Zalo, Điện thoại, Gặp trực tiếp; ghi ngày, kênh, kết quả trao đổi; không bắt buộc chứng cứ gửi.' },
  { code: 'UC-CN-03', name: 'Ghi nhận phản hồi và hẹn thanh toán', process: 'Quy trình 09 - Quản lý công nợ', tabKey: 'debts', priority: 'Must', description: 'Ghi ý kiến khách và ngày hẹn trả tiền; ngày hẹn không thay thế hạn thanh toán gốc; chuyển xác minh nếu có chứng từ.' },
  { code: 'UC-CN-04', name: 'Tra cứu căn cứ xử lý nợ kéo dài', process: 'Quy trình 09 - Quản lý công nợ', tabKey: 'debts', priority: 'Must', description: 'Tra cứu số dư, ngày quá hạn, điều khoản hợp đồng vi phạm, lịch sử nhắc/hẹn; chỉ hỗ trợ tra cứu, không tự phạt/chấm dứt hợp đồng.' },

  // QT10
  { code: 'UC-BC-01', name: 'Tổng hợp số phòng và tỷ lệ lấp đầy', process: 'Quy trình 10 - Báo cáo thống kê', tabKey: 'reports', priority: 'Must', description: 'Đếm phòng Trống, Đang thuê, Sắp trả; Tỷ lệ lấp đầy = (Đang thuê + Sắp trả) / Tổng phòng * 100%; drill-down danh sách phòng.' },
  { code: 'UC-BC-02', name: 'Tổng hợp dữ liệu phải thu, thực thu và công nợ', process: 'Quy trình 10 - Báo cáo thống kê', tabKey: 'reports', priority: 'Must', description: 'Phải thu, Thực thu ngân hàng, Chưa thu, Công nợ quá hạn; nợ bù cọc theo dõi riêng; cọc gốc ngoài doanh thu thuê.' },
  { code: 'UC-BC-03', name: 'Đối soát số liệu báo cáo', process: 'Quy trình 10 - Báo cáo thống kê', tabKey: 'reports', priority: 'Must', description: 'Kiểm tra so sánh các khoản phải thu, thực thu, chưa thu trước khi xuất báo cáo; cảnh báo chênh lệch; Xác nhận đã kiểm tra.' },
  { code: 'UC-BC-04', name: 'Lập báo cáo quản trị tổng hợp', process: 'Quy trình 10 - Báo cáo thống kê', tabKey: 'reports', priority: 'Must', description: 'Báo cáo tổng hợp phòng, tài chính, công nợ, hợp đồng cần chú ý; Xuất Excel; không có duyệt nhiều cấp.' }
];

interface UseCasesNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUseCase: (tabKey: string, code: string) => void;
}

export const UseCasesNavigatorModal: React.FC<UseCasesNavigatorModalProps> = ({
  isOpen,
  onClose,
  onSelectUseCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProcess, setSelectedProcess] = useState<string>('all');

  if (!isOpen) return null;

  const processes = Array.from(new Set(ALL_USE_CASES.map(u => u.process)));

  const filtered = ALL_USE_CASES.filter(uc => {
    const matchProcess = selectedProcess === 'all' || uc.process === selectedProcess;
    const matchSearch = uc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      uc.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchProcess && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Danh mục 63 Use Case Chuẩn Đặc tả Hệ thống</h3>
              <p className="text-xs text-slate-300">Tra cứu & Chuyển nhanh tới từng màn hình/luồng kiểm thử của 11 Quy trình</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã UC (VD: UC-PH-05, UC-QTC-01, UC08.2) hoặc từ khóa..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Quy trình:</span>
            <select
              value={selectedProcess}
              onChange={(e) => setSelectedProcess(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="all">Tất cả quy trình ({ALL_USE_CASES.length})</option>
              {processes.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Use Cases */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Không tìm thấy Use Case nào phù hợp với từ khóa & bộ lọc.
            </div>
          ) : (
            filtered.map((uc) => (
              <div
                key={uc.code}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {uc.code}
                    </span>
                    <span className="font-semibold text-slate-800 text-sm">
                      {uc.name}
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      · {uc.process}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {uc.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {uc.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectUseCase(uc.tabKey, uc.code);
                    onClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer self-start md:self-center"
                >
                  <span>Mở luồng này</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị <strong>{filtered.length}</strong> / {ALL_USE_CASES.length} Use Case đã tin học hóa 100%</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
