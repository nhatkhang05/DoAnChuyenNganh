import { Navigate, Route, Routes } from 'react-router-dom'
import PatientLayout from './components/PatientLayout'
import RequireRole from './components/RequireRole'
import StaffLayout from './components/StaffLayout'
import DangNhap from './pages/DangNhap'
import TaiKhoan from './pages/quan-tri/TaiKhoan'
import DanhMuc from './pages/quan-tri/DanhMuc'
import ThongKe from './pages/quan-tri/ThongKe'
import HoaDon from './pages/thu-ngan/HoaDon'
import DaKham from './pages/bac-si/DaKham'
import KhamBenh from './pages/bac-si/KhamBenh'
import DatLich from './pages/benh-nhan/DatLich'
import TrangChu from './pages/benh-nhan/TrangChu'
import LichCuaToi from './pages/benh-nhan/LichCuaToi'
import DonThuoc from './pages/duoc-si/DonThuoc'
import HoSo from './pages/le-tan/HoSo'
import LichHomNay from './pages/le-tan/LichHomNay'

export default function App() {
  return (
    <Routes>
      <Route path="/dang-nhap" element={<DangNhap />} />

      {/* Bệnh nhân */}
      <Route element={<RequireRole role="patient" />}>
        <Route element={<PatientLayout />}>
          <Route path="/benh-nhan" element={<TrangChu />} />
          <Route path="/benh-nhan/dat-lich" element={<DatLich />} />
          <Route path="/benh-nhan/lich-cua-toi" element={<LichCuaToi />} />
        </Route>
      </Route>

      {/* Lễ tân */}
      <Route element={<RequireRole role="receptionist" />}>
        <Route element={<StaffLayout />}>
          <Route path="/le-tan" element={<LichHomNay />} />
          <Route path="/le-tan/ho-so" element={<HoSo />} />
        </Route>
      </Route>

      {/* Bác sĩ */}
      <Route element={<RequireRole role="doctor" />}>
        <Route element={<StaffLayout />}>
          <Route path="/bac-si" element={<KhamBenh />} />
          <Route path="/bac-si/da-kham" element={<DaKham />} />
        </Route>
      </Route>

      {/* Dược sĩ */}
      <Route element={<RequireRole role="pharmacist" />}>
        <Route element={<StaffLayout />}>
          <Route path="/duoc-si" element={<DonThuoc mode="pending" />} />
          <Route path="/duoc-si/da-giao" element={<DonThuoc mode="delivered" />} />
        </Route>
      </Route>

      {/* Thu ngân */}
      <Route element={<RequireRole role="cashier" />}>
        <Route element={<StaffLayout />}>
          <Route path="/thu-ngan" element={<HoaDon mode="pending" />} />
          <Route path="/thu-ngan/da-thu" element={<HoaDon mode="paid" />} />
        </Route>
      </Route>

      {/* Quản trị viên */}
      <Route element={<RequireRole role="admin" />}>
        <Route element={<StaffLayout />}>
          <Route path="/quan-tri" element={<ThongKe />} />
          <Route path="/quan-tri/tai-khoan" element={<TaiKhoan />} />
          <Route path="/quan-tri/danh-muc" element={<DanhMuc />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dang-nhap" replace />} />
    </Routes>
  )
}
