# Frontend – Hệ thống đặt lịch và quản lý quy trình khám bệnh

React + TypeScript + Tailwind CSS + Vite. Hiện tại chạy **chưa có backend**: dữ liệu là dữ liệu mẫu nằm trong code
và được giữ trong bộ nhớ của trình duyệt (tải lại trang thì về lại dữ liệu mẫu ban đầu).

## Cách chạy trong VS Code

Cần cài Node.js bản 20.19 trở lên (hoặc 22.12 trở lên). Mở thư mục `DoAn_ChuyenNganh` bằng VS Code, mở Terminal (Ctrl + `) rồi gõ:

```bash
cd frontend
npm install
npm run dev
```

Mở trình duyệt vào http://localhost:5173

Các lệnh khác:

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy để code, sửa file là trang tự đổi |
| `npm run build` | Kiểm tra lỗi TypeScript và build bản chạy thật |
| `npm run lint` | Kiểm tra code |

## Tài khoản mẫu (mật khẩu đều là `123456`)

| Tên đăng nhập | Vai trò |
|---|---|
| `benhnhan` | Bệnh nhân (Nguyễn Văn An) |
| `letan` | Lễ tân |
| `bacsi` | Bác sĩ (BS. Nguyễn Minh Anh) |
| `duocsi` | Dược sĩ |
| `thungan` | Thu ngân |
| `admin` | Quản trị viên |

Trong lúc demo có ô **Đổi nhanh vai trò** (ở menu bên trái, hoặc góc trên với bệnh nhân) để đổi vai trò mà không cần đăng xuất.

## Chạy thử cả quy trình khám

1. **Bệnh nhân** đặt lịch ở trang Đặt lịch, xem lại ở Lịch của tôi.
2. **Lễ tân** bấm Xác nhận đến, hệ thống cấp số thứ tự. Khách chưa đặt thì bấm Đăng ký khám vãng lai.
3. **Bác sĩ** chọn bệnh nhân trong hàng chờ, ghi bệnh án, kê thuốc, hẹn tái khám, bấm Hoàn tất khám.
4. **Dược sĩ** bấm Nhập đơn, tính tiền thuốc. Lúc này nút Giao thuốc chưa bấm được.
5. **Thu ngân** thu tiền (tiền khám + tiền thuốc) và ghi nhận đã thanh toán. Bệnh nhân không có thuốc thì chỉ thu tiền khám.
6. **Dược sĩ** thấy đã thanh toán thì mới bấm được Giao thuốc.
7. **Quản trị viên** xem thống kê, tạo hoặc khóa tài khoản.

## Cấu trúc thư mục

```
src/
  main.tsx, App.tsx      Khởi động và khai báo đường dẫn (route) cho từng vai trò
  index.css              Tailwind và màu của giao diện
  types/                 Kiểu dữ liệu (Appointment, Prescription, Invoice...)
  data/                  Dữ liệu mẫu (mock.ts)
  store/                 Nơi giữ dữ liệu và các thao tác của phòng khám (ClinicContext)
  components/            Thành phần dùng chung: menu, nút, thẻ, thanh tiến trình...
  pages/
    Login.tsx
    patient/             Trang chủ, Đặt lịch, Lịch của tôi
    reception/           Lịch khám hôm nay, Hồ sơ bệnh nhân
    doctor/              Khám bệnh, Đã khám hôm nay
    pharmacist/          Đơn thuốc
    cashier/             Hóa đơn
    admin/               Thống kê, Tài khoản và phân quyền, Danh mục
```

Đường dẫn: `/dang-nhap`, `/benh-nhan`, `/le-tan`, `/bac-si`, `/duoc-si`, `/thu-ngan`, `/quan-tri`.
Vào sai vai trò thì bị đưa về trang của vai trò đó (`components/RequireRole.tsx`, sau này backend sẽ chặn thêm bằng Guards).

## Khi có backend NestJS

Tất cả thao tác với dữ liệu đang nằm trong `src/store/ClinicContext.tsx` (đăng nhập, đặt lịch, cấp số, kê đơn, tính tiền, thu tiền, giao thuốc...).
Mỗi hàm ở đó sau này đổi thành một lệnh gọi API, còn các trang trong `pages/` gần như không phải sửa.
Cấu hình gọi API (proxy sang cổng của backend) thêm vào `vite.config.ts`.

## Chưa làm

- Backend và cơ sở dữ liệu.
- Danh mục mới chỉ xem, chưa thêm, sửa, xóa.
- Đăng ký tài khoản bệnh nhân mới, thông báo (chuông chỉ để hiển thị).
- Dữ liệu chưa lưu lại khi tải lại trang.
