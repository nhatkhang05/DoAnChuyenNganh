import { createContext } from 'react'
import type { Account, Appointment, Doctor, Invoice, Medicine, PrescriptionLine, Prescription, Role } from '../types'

export interface ExamResult {
  symptom: string
  diagnosis: string
  lines: PrescriptionLine[]
  recheck: string
}

export interface RegisterPayload {
  name: string
  phone: string
  email: string
  username: string
  password: string
}

// Tất cả dữ liệu + thao tác của phòng khám nằm ở đây.
export interface ClinicStore {
  // đăng nhập / đăng ký / quên mật khẩu
  user: Account | null
  login: (username: string, password: string) => string | null
  loginAs: (role: Role, accountId?: number) => void
  registerPatient: (payload: RegisterPayload) => string | null
  resetPasswordByEmail: (email: string, newPassword: string) => string | null
  logout: () => void

  // dữ liệu
  appointments: Appointment[]
  prescriptions: Prescription[]
  invoices: Invoice[]
  accounts: Account[]
  doctorsList: Doctor[]
  medicinesList: Medicine[]

  // bệnh nhân
  bookAppointment: (doctorId: number, date: string, time: string, reason: string) => void
  cancelAppointment: (id: number) => void
  // lễ tân
  confirmArrival: (id: number) => void
  addWalkIn: (name: string, phone: string, doctorId: number, reason?: string) => void
  // bác sĩ
  finishExam: (appointmentId: number, result: ExamResult) => void
  updateExamRecord: (appointmentId: number, symptom: string, diagnosis: string, recheck: string) => void
  // dược sĩ
  computeDrugFee: (prescriptionId: number) => void
  deliverMedicine: (prescriptionId: number) => void
  // thu ngân
  payInvoice: (invoiceId: number, method: string) => void
  // quản trị
  toggleLock: (accountId: number) => void
  createAccount: (name: string, username: string, role: Role) => void
  saveDoctor: (doc: Omit<Doctor, 'id'> & { id?: number }) => void
  saveMedicine: (med: Omit<Medicine, 'id'> & { id?: number }) => void
  resetData: () => void
}

export const ClinicContext = createContext<ClinicStore | null>(null)