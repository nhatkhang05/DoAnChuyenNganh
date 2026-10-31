import type { PrescriptionStatus } from '../types'

export const prescriptionSteps = ['Mới kê', 'Chờ thanh toán', 'Đã thanh toán', 'Đã giao']
export const stepIndex: Record<PrescriptionStatus, number> = { new: 0, waitingPay: 1, paid: 2, delivered: 3 }
