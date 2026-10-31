// Dữ liệu mẫu để chạy giao diện khi chưa có backend.
import type { Account, Appointment, Doctor, Invoice, Medicine, PastVisit, Prescription } from '../types'

export const TODAY = '26/10/2026'
export const CURRENT_PATIENT_ID = 'p-an' // bệnh nhân đang đăng nhập (Nguyễn Văn An)

export const doctors: Doctor[] = [
  { id: 1, name: 'BS. Nguyễn Minh Anh', specialty: 'Nội tổng quát', price: 50000 },
  { id: 2, name: 'BS. Trần Quốc Bảo', specialty: 'Nhi', price: 50000 },
  { id: 3, name: 'BS. Lê Thu Hà', specialty: 'Tai mũi họng', price: 60000 },
  { id: 4, name: 'BS. Phạm Đức Long', specialty: 'Da liễu', price: 60000 },
  { id: 5, name: 'BS. Đặng Hữu Phúc', specialty: 'Ngoại', price: 70000 },
]

export const specialties = ['Nội tổng quát', 'Nhi', 'Tai mũi họng', 'Da liễu', 'Ngoại']

export const medicines: Medicine[] = [
  { id: 1, name: 'Thuốc ho (mẫu)', unit: 'chai', price: 45000 },
  { id: 2, name: 'Thuốc ngậm họng (mẫu)', unit: 'vỉ', price: 18000 },
  { id: 3, name: 'Paracetamol (mẫu)', unit: 'hộp', price: 12000 },
  { id: 4, name: 'Vitamin C (mẫu)', unit: 'tuýp', price: 30000 },
  { id: 5, name: 'Nước muối (mẫu)', unit: 'chai', price: 10000 },
]

export const accounts: Account[] = [
  { id: 1, name: 'Nguyễn Văn An', username: 'benhnhan', password: '123456', role: 'patient', locked: false },
  { id: 2, name: 'Lê Thị Lan', username: 'letan', password: '123456', role: 'receptionist', locked: false },
  { id: 3, name: 'Nguyễn Minh Anh', username: 'bacsi', password: '123456', role: 'doctor', locked: false },
  { id: 4, name: 'Hoàng Thị Hoa', username: 'duocsi', password: '123456', role: 'pharmacist', locked: false },
  { id: 5, name: 'Phan Thị Phương', username: 'thungan', password: '123456', role: 'cashier', locked: false },
  { id: 6, name: 'Quản trị viên', username: 'admin', password: '123456', role: 'admin', locked: false },
  { id: 7, name: 'Trần Văn Dũng', username: 'dung.tran', password: '123456', role: 'receptionist', locked: true },
  // các bác sĩ còn lại (mỗi bác sĩ một tài khoản, tài khoản bacsi ở trên là BS. Nguyễn Minh Anh)
  { id: 8, name: 'Trần Quốc Bảo', username: 'bacsi.nhi', password: '123456', role: 'doctor', locked: false },
  { id: 9, name: 'Lê Thu Hà', username: 'bacsi.tmh', password: '123456', role: 'doctor', locked: false },
  { id: 10, name: 'Phạm Đức Long', username: 'bacsi.dalieu', password: '123456', role: 'doctor', locked: false },
  { id: 11, name: 'Đặng Hữu Phúc', username: 'bacsi.ngoai', password: '123456', role: 'doctor', locked: false },
]

export const initialAppointments: Appointment[] = [
  { id: 1, patientName: 'Trần Thị Bích', phone: '0903 111 222', patientId: 'p-bich', doctorId: 1, date: TODAY, time: '08:30', status: 'arrived', queueNo: 1, walkIn: false, reason: 'Đau họng, ho khan 3 ngày' },
  { id: 2, patientName: 'Nguyễn Văn An', phone: '0901 234 567', patientId: 'p-an', doctorId: 1, date: TODAY, time: '09:00', status: 'booked', queueNo: null, walkIn: false, reason: 'Đau đầu, ngủ ít' },
  { id: 3, patientName: 'Lê Hoàng Nam', phone: '0912 345 678', patientId: 'p-nam', doctorId: 3, date: TODAY, time: '09:30', status: 'booked', queueNo: null, walkIn: false },
  { id: 4, patientName: 'Phạm Thu Trang', phone: '0987 654 321', patientId: 'p-trang', doctorId: 2, date: TODAY, time: '10:00', status: 'booked', queueNo: null, walkIn: false },
  { id: 5, patientName: 'Võ Minh Khôi', phone: '0933 222 444', patientId: 'p-khoi', doctorId: 4, date: TODAY, time: '10:30', status: 'booked', queueNo: null, walkIn: false },
  { id: 6, patientName: 'Bé Phạm Gia Hân', phone: '0987 654 321', patientId: 'p-han', doctorId: 2, date: TODAY, time: '08:00', status: 'arrived', queueNo: 2, walkIn: false, reason: 'Sốt nhẹ, ho 2 ngày' },
  { id: 7, patientName: 'Đỗ Quang Huy', phone: '0944 555 666', patientId: 'p-huy', doctorId: 5, date: TODAY, time: '09:00', status: 'arrived', queueNo: 3, walkIn: false, reason: 'Đau bụng dưới bên phải' },
]

export const initialPrescriptions: Prescription[] = []
export const initialInvoices: Invoice[] = []

export const pastVisits: PastVisit[] = [
  { id: 1, patientId: 'p-an', date: '12/09/2026', doctorName: 'BS. Nguyễn Minh Anh', specialty: 'Nội tổng quát', diagnosis: 'Viêm họng', medicines: ['Thuốc ho (mẫu) x 1 chai', 'Thuốc ngậm họng (mẫu) x 2 vỉ'], recheck: 'Sau 2 tuần, ngày 26/09/2026' },
]

// Số liệu mẫu cho trang thống kê (7 ngày, tháng). "Hôm nay" thì tính thật từ dữ liệu đang chạy.
export const statsSample = {
  week: { revenue: 9.8, booked: 86, done: 74, delivered: 52, labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], values: [1.2, 1.5, 1.1, 1.7, 1.6, 1.9, 0.8], status: [74, 7, 5], byDoctor: [24, 17, 15, 11, 7] },
  month: { revenue: 38, booked: 342, done: 301, delivered: 214, labels: ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'], values: [8.4, 9.6, 10.2, 9.8], status: [301, 24, 17], byDoctor: [98, 72, 52, 43, 36] },
}

// 7 ngày đặt lịch bắt đầu từ hôm nay
export const bookingDays = [
  { dow: 'T2', day: '26', date: '26/10/2026' },
  { dow: 'T3', day: '27', date: '27/10/2026' },
  { dow: 'T4', day: '28', date: '28/10/2026' },
  { dow: 'T5', day: '29', date: '29/10/2026' },
  { dow: 'T6', day: '30', date: '30/10/2026' },
  { dow: 'T7', day: '31', date: '31/10/2026' },
  { dow: 'CN', day: '01', date: '01/11/2026' },
]

export const slotTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '13:30', '14:00', '14:30', '15:00', '15:30']

export const permissions: Record<string, string[]> = {
  patient: ['Đăng ký, đăng nhập', 'Tìm bác sĩ, xem khung giờ trống', 'Đặt lịch, đổi lịch, hủy lịch', 'Xem lịch sử khám, đơn thuốc của mình', 'Nhận thông báo lịch khám'],
  receptionist: ['Tạo, tra cứu hồ sơ bệnh nhân', 'Xác nhận bệnh nhân đến', 'Đăng ký khám vãng lai', 'Cấp số thứ tự khám'],
  doctor: ['Xem lịch khám trong ngày', 'Xem hồ sơ bệnh', 'Ghi bệnh án, kê đơn thuốc', 'Hẹn tái khám'],
  pharmacist: ['Xem đơn thuốc chờ xử lý', 'Nhập đơn, tính tiền thuốc', 'Xem trạng thái thanh toán', 'Giao thuốc (chỉ khi đã thanh toán)'],
  cashier: ['Lập hóa đơn, tính tổng tiền', 'Ghi nhận thanh toán', 'Xem trạng thái thanh toán'],
  admin: ['Quản lý tài khoản, phân quyền', 'Quản lý danh mục (chuyên khoa, bác sĩ, lịch làm việc, dịch vụ, thuốc)', 'Xem thống kê, báo cáo'],
}
