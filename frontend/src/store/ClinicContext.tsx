import { useEffect, useState, type ReactNode } from 'react'
import {
  accounts as seedAccounts,
  doctors as seedDoctors,
  medicines as seedMedicines,
  initialAppointments,
  initialInvoices,
  initialPrescriptions,
  CURRENT_PATIENT_ID,
  TODAY,
} from '../data/mock'
import { drugTotal } from '../utils'
import type { Account, Appointment, Doctor, Invoice, Medicine, Prescription, Role } from '../types'
import { ClinicContext, type ClinicStore, type ExamResult } from './clinicContext'

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(() => loadStorage('clinic_user_v2', null))
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadStorage('clinic_appointments_v2', initialAppointments))
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => loadStorage('clinic_prescriptions_v2', initialPrescriptions))
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage('clinic_invoices_v2', initialInvoices))
  const [accounts, setAccounts] = useState<Account[]>(() => loadStorage('clinic_accounts_v2', seedAccounts))
  const [doctorsList, setDoctorsList] = useState<Doctor[]>(() => loadStorage('clinic_doctors_v2', seedDoctors))
  const [medicinesList, setMedicinesList] = useState<Medicine[]>(() => loadStorage('clinic_medicines_v2', seedMedicines))

  useEffect(() => { localStorage.setItem('clinic_user_v2', JSON.stringify(user)) }, [user])
  useEffect(() => { localStorage.setItem('clinic_appointments_v2', JSON.stringify(appointments)) }, [appointments])
  useEffect(() => { localStorage.setItem('clinic_prescriptions_v2', JSON.stringify(prescriptions)) }, [prescriptions])
  useEffect(() => { localStorage.setItem('clinic_invoices_v2', JSON.stringify(invoices)) }, [invoices])
  useEffect(() => { localStorage.setItem('clinic_accounts_v2', JSON.stringify(accounts)) }, [accounts])
  useEffect(() => { localStorage.setItem('clinic_doctors_v2', JSON.stringify(doctorsList)) }, [doctorsList])
  useEffect(() => { localStorage.setItem('clinic_medicines_v2', JSON.stringify(medicinesList)) }, [medicinesList])

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

    // Nếu bệnh nhân đã có lịch hẹn chờ đến hôm nay thì xác nhận cấp số ngay vào lịch đó, không tạo dòng Vãng lai trùng lặp
    addWalkIn: (name, phone, doctorId, reason, patientId) =>
      setAppointments((list) => {
        const cleanName = name.trim()
        const cleanPhone = phone.trim()
        const no = nextQueueNo(list)

        const existingBooked = list.find(
          (a) =>
            a.date === TODAY &&
            a.status === 'booked' &&
            (a.patientName.trim().toLowerCase() === cleanName.toLowerCase() || a.phone.trim() === cleanPhone),
        )
        if (existingBooked) {
          return list.map((a) =>
            a.id === existingBooked.id
              ? {
                ...a,
                doctorId,
                reason: reason || a.reason,
                status: 'arrived',
                queueNo: no,
              }
              : a,
          )
        }

        const matchedAppt = list.find(
          (a) => a.patientName.trim().toLowerCase() === cleanName.toLowerCase() || a.phone.trim() === cleanPhone,
        )
        const resolvedPatientId =
          patientId !== undefined
            ? patientId
            : matchedAppt?.patientId ?? (cleanName.toLowerCase().includes('nguyễn văn an') ? CURRENT_PATIENT_ID : null)

        return [
          ...list,
          {
            id: nextId(list),
            patientName: cleanName,
            phone: cleanPhone,
            patientId: resolvedPatientId,
            doctorId,
            date: TODAY,
            time: '09:00',
            status: 'arrived',
            queueNo: no,
            walkIn: resolvedPatientId ? false : true,
            reason: reason || 'Khám sức khỏe',
          },
        ]
      }),

    // Cập nhật đồng bộ thông tin hồ sơ bệnh nhân sang tất cả lịch khám hôm nay, bác sĩ và tài khoản bệnh nhân
    updatePatientProfile: (oldName, oldPhone, newName, newPhone, doctorId, reason) => {
      const cOldName = oldName.trim().toLowerCase()
      const cOldPhone = oldPhone.trim()
      const cNewName = newName.trim()
      const cNewPhone = newPhone.trim()

      setAppointments((list) =>
        list.map((a) => {
          const isMatch = a.patientName.trim().toLowerCase() === cOldName && a.phone.trim() === cOldPhone
          if (!isMatch) return a
          const isActiveToday = a.date === TODAY && (a.status === 'booked' || a.status === 'arrived')
          return {
            ...a,
            patientName: cNewName,
            phone: cNewPhone,
            doctorId: isActiveToday && doctorId ? doctorId : a.doctorId,
            reason: isActiveToday && reason !== undefined ? reason : a.reason,
          }
        }),
      )

      setAccounts((list) =>
        list.map((acc) =>
          acc.role === 'patient' && acc.name.trim().toLowerCase() === cOldName
            ? { ...acc, name: cNewName, phone: cNewPhone }
            : acc,
        ),
      )

      if (user && user.role === 'patient' && user.name.trim().toLowerCase() === cOldName) {
        setUser({ ...user, name: cNewName, phone: cNewPhone })
      }
    },

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
      const cleanName = doc.name.startsWith('BS.') ? doc.name : `BS. ${doc.name}`
      const plainName = cleanName.replace(/^BS\.\s*/i, '').trim()
      if (doc.id) {
        setDoctorsList((list) =>
          list.map((d) => (d.id === doc.id ? { ...d, name: cleanName, specialty: doc.specialty, price: doc.price } : d)),
        )
      } else {
        const newDocId = nextId(doctorsList)
        setDoctorsList((list) => [...list, { id: newDocId, name: cleanName, specialty: doc.specialty, price: doc.price }])
        setAccounts((list) => {
          if (list.some((a) => a.name.includes(plainName))) return list
          const slug = plainName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')
          return [
            ...list,
            { id: nextId(list), name: plainName, username: `bacsi.${slug}`, password: '123456', role: 'doctor', locked: false },
          ]
        })
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
      localStorage.removeItem('clinic_appointments_v2')
      localStorage.removeItem('clinic_prescriptions_v2')
      localStorage.removeItem('clinic_invoices_v2')
      localStorage.removeItem('clinic_accounts_v2')
      localStorage.removeItem('clinic_doctors_v2')
      localStorage.removeItem('clinic_medicines_v2')
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