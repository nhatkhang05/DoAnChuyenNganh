import type { PrescriptionLine, Medicine } from './types'

export const money = (n: number) => n.toLocaleString('vi-VN') + ' đ'

export const initialOf = (name: string) => (name.trim().split(' ').pop()?.charAt(0) ?? '?').toUpperCase()

export const drugTotal = (lines: PrescriptionLine[], medicines: Medicine[]) =>
  lines.reduce((sum, l) => sum + (medicines.find((m) => m.id === l.medicineId)?.price ?? 0) * l.qty, 0)

export const lineText = (l: PrescriptionLine, medicines: Medicine[]) => {
  const m = medicines.find((x) => x.id === l.medicineId)
  return m ? `${m.name} x ${l.qty} ${m.unit}` : ''
}

import type { Appointment, Doctor } from './types'
import { doctors } from './data/mock'

export const findDoctor = (id: number): Doctor | undefined => doctors.find((d) => d.id === id)

// Giờ đã có người đặt = có lịch thật trong dữ liệu, hoặc là người khác đặt (giả lập để nhìn cho giống thật)
export const isSlotBusy = (appointments: Appointment[], doctorId: number, date: string, time: string, dayIdx: number, slotIdx: number) =>
  appointments.some((a) => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'cancelled') ||
  (slotIdx * 3 + dayIdx * 2 + doctorId) % 5 === 0

export const monthLabel = (date: string) => 'THG ' + Number(date.split('/')[1])
export const dayLabel = (date: string) => date.split('/')[0]

import type { Role } from './types'

// Trang chủ của từng vai trò sau khi đăng nhập
export const homeOf = (role: Role) =>
  ({ patient: '/benh-nhan', receptionist: '/le-tan', doctor: '/bac-si', pharmacist: '/duoc-si', cashier: '/thu-ngan', admin: '/quan-tri' })[role]
