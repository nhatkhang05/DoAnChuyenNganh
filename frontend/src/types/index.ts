// Các kiểu dữ liệu dùng chung. Sau này backend NestJS trả về đúng dạng này.

export type Role = 'patient' | 'receptionist' | 'doctor' | 'pharmacist' | 'cashier' | 'admin'

export interface Account {
  id: number
  name: string
  username: string
  password: string
  role: Role
  locked: boolean
  email?: string
  phone?: string
}

export interface Doctor {
  id: number
  name: string
  specialty: string
  price: number // tiền khám
}

export type AppointmentStatus = 'booked' | 'arrived' | 'done' | 'cancelled'

export interface Appointment {
  id: number
  patientName: string
  phone: string
  patientId: string | null // null nếu là khách vãng lai
  doctorId: number
  date: string // dd/MM/yyyy
  time: string // HH:mm
  status: AppointmentStatus
  queueNo: number | null
  walkIn: boolean
  reason?: string
  // phần bác sĩ ghi sau khi khám
  symptom?: string
  diagnosis?: string
  recheck?: string
}

export interface Medicine {
  id: number
  name: string
  unit: string
  price: number
}

export interface PrescriptionLine {
  medicineId: number
  qty: number
}

// Mới kê -> Chờ thanh toán -> Đã thanh toán -> Đã giao
export type PrescriptionStatus = 'new' | 'waitingPay' | 'paid' | 'delivered'

export interface Prescription {
  id: number
  appointmentId: number
  lines: PrescriptionLine[]
  status: PrescriptionStatus
}

export interface Invoice {
  id: number
  appointmentId: number
  visitFee: number
  drugFee: number | null // null = dược sĩ chưa tính tiền thuốc
  paid: boolean
  method?: string
}

export interface PastVisit {
  id: number
  patientId: string
  date: string
  doctorName: string
  specialty: string
  diagnosis: string
  medicines: string[]
  recheck: string
}