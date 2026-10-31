import { useState, type ReactNode } from 'react'
import {
  accounts as seedAccounts,
  doctors as seedDoctors,
  medicines as seedMedicines,
  initialAppointments,
  initialInvoices,
  initialPrescriptions,
  CURRENT_PATIENT_ID,
} from '../data/mock'
import { drugTotal } from '../utils'
import type { Account, Appointment, Doctor, Invoice, Medicine, Prescription, Role } from '../types'
import { ClinicContext, type ClinicStore, type ExamResult } from './clinicContext'

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts)
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(seedDoctors)
  const [medicinesList, setMedicinesList] = useState<Medicine[]>(seedMedicines)

  const nextId = (list: { id: number }[]) => list.reduce((m, x) => Math.max(m, x.id), 0) + 1
  const nextQueueNo = (list: Appointment[]) => list.reduce((m, a) => Math.max(m, a.queueNo ?? 0), 0) + 1

  const store: ClinicStore = {
    user,
    login: (username, password) => {
      const q = username.trim().toLowerCase()
      const acc = accounts.find(
        (a) => a.username.toLowerCase() === q || (a.email && a.email.toLowerCase() === q) || a.phone === username.trim(),
      )
      if (!acc || acc.password !== password) return 'Sai tên đăng nhập hoặc mật khẩu.'
      if (acc.locked) return 'Tài khoản này đã bị khóa. Liên hệ quản trị viên.'
      setUser(acc)
      return null
    },
    loginAs: (role, accountId) => {
      const acc = accounts.find((a) => (accountId ? a.id === accountId : a.role === role) && !a.locked)
      if (acc) setUser(acc)
    },
    registerPatient: ({ name, phone, email, username, password }) => {
      if (!name.trim() || !phone.trim() || !email.trim() || !username.trim() || !password.trim()) {
        return 'Vui lòng nhập đầy đủ thông tin.'
      }
      if (accounts.some((a) => a.username.toLowerCase() === username.trim().toLowerCase())) {
        return 'Tên đăng nhập này đã tồn tại.'
      }
      const newAcc: Account = {
        id: nextId(accounts),
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
        role: 'patient',
        locked: false,
      }
      setAccounts((list) => [...list, newAcc])
      setUser(newAcc)
      return null
    },
    resetPasswordByEmail: (email, newPassword) => {
      const q = email.trim().toLowerCase()
      const idx = accounts.findIndex((a) => (a.email?.toLowerCase() ?? 'nguyenvanan@gmail.com') === q || a.username.toLowerCase() === q)
      if (idx === -1) return 'Không tìm thấy tài khoản gắn với địa chỉ Gmail này.'
      setAccounts((list) => list.map((a, i) => (i === idx ? { ...a, password: newPassword } : a)))
      return null
    },
    logout: () => setUser(null),

    appointments,
    prescriptions,
    invoices,
    accounts,
    doctorsList,
    medicinesList,

    bookAppointment: (doctorId, date, time, reason) =>
      setAppointments((list) => [
        ...list,
        {
          id: nextId(list),
          patientName: user?.name ?? 'Nguyễn Văn An',
          phone: user?.phone ?? '0901 234 567',
          patientId: CURRENT_PATIENT_ID,
          doctorId,
          date,
          time,
          status: 'booked',
          queueNo: null,
          walkIn: false,
          reason,
        },
      ]),
    cancelAppointment: (id) => setAppointments((list) => list.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))),

    confirmArrival: (id) =>
      setAppointments((list) => {
        const no = nextQueueNo(list)
        return list.map((a) => (a.id === id && a.status === 'booked' ? { ...a, status: 'arrived', queueNo: no } : a))
      }),
    addWalkIn: (name, phone, doctorId, reason) =>
      setAppointments((list) => [
        ...list,
        {
          id: nextId(list),
          patientName: name,
          phone,
          patientId: null,
          doctorId,
          date: '26/10/2026',
          time: '09:00',
          status: 'arrived',
          queueNo: nextQueueNo(list),
          walkIn: true,
          reason: reason || 'Đau đầu, sốt nhẹ từ tối qua',
        },
      ]),

    finishExam: (appointmentId, result: ExamResult) => {
      const appt = appointments.find((a) => a.id === appointmentId)
      if (!appt) return
      const visitFee = doctorsList.find((d) => d.id === appt.doctorId)?.price ?? 50000
      setAppointments((list) =>
        list.map((a) =>
          a.id === appointmentId
            ? { ...a, status: 'done', symptom: result.symptom, diagnosis: result.diagnosis, recheck: result.recheck }
            : a,
        ),
      )
      const hasDrug = result.lines.length > 0
      if (hasDrug) {
        setPrescriptions((list) => [...list, { id: nextId(list), appointmentId, lines: result.lines, status: 'new' }])
      }
      setInvoices((list) => [...list, { id: nextId(list), appointmentId, visitFee, drugFee: hasDrug ? null : 0, paid: false }])
    },

    updateExamRecord: (appointmentId, symptom, diagnosis, recheck) => {
      setAppointments((list) =>
        list.map((a) => (a.id === appointmentId ? { ...a, symptom, diagnosis, recheck } : a)),
      )
    },

    computeDrugFee: (prescriptionId) => {
      const p = prescriptions.find((x) => x.id === prescriptionId)
      if (!p || p.status !== 'new') return
      const fee = drugTotal(p.lines, medicinesList)
      setPrescriptions((list) => list.map((x) => (x.id === prescriptionId ? { ...x, status: 'waitingPay' } : x)))
      setInvoices((list) => list.map((i) => (i.appointmentId === p.appointmentId ? { ...i, drugFee: fee } : i)))
    },
    deliverMedicine: (prescriptionId) =>
      setPrescriptions((list) => list.map((x) => (x.id === prescriptionId && x.status === 'paid' ? { ...x, status: 'delivered' } : x))),

    payInvoice: (invoiceId, method) => {
      const inv = invoices.find((i) => i.id === invoiceId)
      if (!inv || inv.paid || inv.drugFee === null) return
      setInvoices((list) => list.map((i) => (i.id === invoiceId ? { ...i, paid: true, method } : i)))
      setPrescriptions((list) =>
        list.map((p) => (p.appointmentId === inv.appointmentId && p.status === 'waitingPay' ? { ...p, status: 'paid' } : p)),
      )
    },

    toggleLock: (accountId) => setAccounts((list) => list.map((a) => (a.id === accountId ? { ...a, locked: !a.locked } : a))),
    createAccount: (name, username, role: Role) =>
      setAccounts((list) => [...list, { id: nextId(list), name, username, password: '123456', role, locked: false }]),

    saveDoctor: (doc) => {
      if (doc.id) {
        setDoctorsList((list) => list.map((d) => (d.id === doc.id ? { ...d, name: doc.name, specialty: doc.specialty, price: doc.price } : d)))
      } else {
        setDoctorsList((list) => [...list, { id: nextId(list), name: doc.name, specialty: doc.specialty, price: doc.price }])
      }
    },
    saveMedicine: (med) => {
      if (med.id) {
        setMedicinesList((list) => list.map((m) => (m.id === med.id ? { ...m, name: med.name, unit: med.unit, price: med.price } : m)))
      } else {
        setMedicinesList((list) => [...list, { id: nextId(list), name: med.name, unit: med.unit, price: med.price }])
      }
    },

    resetData: () => {
      setAppointments(initialAppointments)
      setPrescriptions(initialPrescriptions)
      setInvoices(initialInvoices)
      setAccounts(seedAccounts)
      setDoctorsList(seedDoctors)
      setMedicinesList(seedMedicines)
    },
  }

  return <ClinicContext.Provider value={store}>{children}</ClinicContext.Provider>
}