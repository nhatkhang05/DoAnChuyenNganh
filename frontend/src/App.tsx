import { Navigate, Route, Routes } from 'react-router-dom'
import PatientLayout from './components/PatientLayout'
import RequireRole from './components/RequireRole'
import StaffLayout from './components/StaffLayout'
import Login from './pages/Login'
import Accounts from './pages/admin/Accounts'
import Catalog from './pages/admin/Catalog'
import Stats from './pages/admin/Stats'
import Invoices from './pages/cashier/Invoices'
import Done from './pages/doctor/Done'
import Exam from './pages/doctor/Exam'
import Booking from './pages/patient/Booking'
import Home from './pages/patient/Home'
import MyAppointments from './pages/patient/MyAppointments'
import Prescriptions from './pages/pharmacist/Prescriptions'
import Records from './pages/reception/Records'
import Today from './pages/reception/Today'

export default function App() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<Login />} />

      {/* Bệnh nhân */}
      <Route element={<RequireRole role="patient" />}>
        <Route element={<PatientLayout />}>
          <Route path="/benh-nhan" element={<Home />} />
          <Route path="/benh-nhan/dat-lich" element={<Booking />} />
          <Route path="/benh-nhan/lich-cua-toi" element={<MyAppointments />} />
        </Route>
      </Route>

      {/* Lễ tân */}
      <Route element={<RequireRole role="receptionist" />}>
        <Route element={<StaffLayout />}>
          <Route path="/le-tan" element={<Today />} />
          <Route path="/le-tan/ho-so" element={<Records />} />
        </Route>
      </Route>

      {/* Bác sĩ */}
      <Route element={<RequireRole role="doctor" />}>
        <Route element={<StaffLayout />}>
          <Route path="/bac-si" element={<Exam />} />
          <Route path="/bac-si/da-kham" element={<Done />} />
        </Route>
      </Route>

      {/* Dược sĩ */}
      <Route element={<RequireRole role="pharmacist" />}>
        <Route element={<StaffLayout />}>
          <Route path="/duoc-si" element={<Prescriptions mode="pending" />} />
          <Route path="/duoc-si/da-giao" element={<Prescriptions mode="delivered" />} />
        </Route>
      </Route>

      {/* Thu ngân */}
      <Route element={<RequireRole role="cashier" />}>
        <Route element={<StaffLayout />}>
          <Route path="/thu-ngan" element={<Invoices mode="pending" />} />
          <Route path="/thu-ngan/da-thu" element={<Invoices mode="paid" />} />
        </Route>
      </Route>

      {/* Quản trị viên */}
      <Route element={<RequireRole role="admin" />}>
        <Route element={<StaffLayout />}>
          <Route path="/quan-tri" element={<Stats />} />
          <Route path="/quan-tri/tai-khoan" element={<Accounts />} />
          <Route path="/quan-tri/danh-muc" element={<Catalog />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dang-nhap" replace />} />
    </Routes>
  )
}
