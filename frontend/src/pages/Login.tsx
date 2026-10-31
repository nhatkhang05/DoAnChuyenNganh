import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useClinic } from '../store/useClinic'
import { homeOf } from '../utils'
import Icon, { type IconName } from '../components/Icon'
import { Btn } from '../components/ui'

const features: { icon: IconName; title: string; sub: string }[] = [
  { icon: 'cal', title: 'Đặt lịch online', sub: 'Thấy ngay giờ còn trống của bác sĩ' },
  { icon: 'list', title: 'Số thứ tự rõ ràng', sub: 'Đến nơi là được cấp số, đỡ phải xếp hàng' },
  { icon: 'receipt', title: 'Đơn thuốc và thanh toán gọn', sub: 'Xem lại đơn thuốc và lịch tái khám của mình' },
]

type AuthMode = 'login' | 'register' | 'forgot'

export default function Login() {
  const { login, registerPatient, resetPasswordByEmail, user } = useClinic()
  const [mode, setMode] = useState<AuthMode>('login')

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Đăng ký (Có Gmail)
  const [regName, setRegName] = useState('Nguyễn Văn An')
  const [regPhone, setRegPhone] = useState('0901 234 567')
  const [regEmail, setRegEmail] = useState('nguyenvanan@gmail.com')
  const [regUser, setRegUser] = useState('benhnhan.an')
  const [regPass, setRegPass] = useState('')
  const [regConfirm, setRegConfirm] = useState('')

  // Quên mật khẩu qua Gmail OTP
  const [fpEmail, setFpEmail] = useState('nguyenvanan@gmail.com')
  const [otpSent, setOtpSent] = useState(true)
  const [otpDigits, setOtpDigits] = useState(['4', '8', '2', '9', '1', '0'])
  const [fpNewPass, setFpNewPass] = useState('')
  const [fpConfirmPass, setFpConfirmPass] = useState('')

  if (user) return <Navigate to={homeOf(user.role)} replace />

  const switchMode = (next: AuthMode) => {
    setError('')
    setSuccessMsg('')
    setMode(next)
  }

  const handleLogin = (e: FormEvent) => {
    e.preventDefault()
    const err = login(username, password)
    setError(err ?? '')
  }

  const handleRegister = (e: FormEvent) => {
    e.preventDefault()
    if (regPass !== regConfirm) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }
    const err = registerPatient({
      name: regName,
      phone: regPhone,
      email: regEmail,
      username: regUser,
      password: regPass || '123456',
    })
    if (err) setError(err)
  }

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault()
    if (otpDigits.some((d) => !d.trim())) {
      setError('Vui lòng nhập đủ 6 chữ số OTP trong Gmail.')
      return
    }
    if (!fpNewPass || fpNewPass !== fpConfirmPass) {
      setError('Mật khẩu mới và xác nhận mật khẩu chưa khớp.')
      return
    }
    const err = resetPasswordByEmail(fpEmail, fpNewPass)
    if (err) {
      setError(err)
      return
    }
    setSuccessMsg('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.')
    setMode('login')
  }

  const handleOtpChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    setOtpDigits((prev) => prev.map((d, i) => (i === index ? clean : d)))
  }

  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="relative flex flex-[1_1_440px] flex-col justify-between gap-9 overflow-hidden bg-deep px-[60px] py-[52px] text-white">
        <div className="absolute -right-[90px] -top-[90px] size-80 rounded-full bg-[#115049]" />
        <div className="absolute -bottom-[110px] right-[60px] size-60 rounded-full bg-[#0f4943]" />
        <div className="relative flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-[13px] bg-mint text-deep">
            <Icon name="plus" size={26} strokeWidth={2.8} />
          </div>
          <div className="text-[19px] font-bold">Phòng khám đa khoa</div>
        </div>
        <div className="relative flex max-w-[470px] flex-col gap-[26px]">
          <h1 className="m-0 text-[42px] font-extrabold leading-[1.18]">
            Đặt lịch khám
            <br />
            trong vài giây.
          </h1>
          <p className="m-0 text-[17px] leading-relaxed text-[#bfe0dc]">
            Chọn bác sĩ, chọn giờ trống, đến đúng giờ là được khám. Nhân viên làm việc theo đúng phần việc của mình.
          </p>
          <div className="flex flex-col gap-3">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3.5 rounded-[14px] bg-deep-2 px-4 py-3.5">
                <Icon name={f.icon} size={24} className="text-mint" />
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-[13.5px] text-[#a9d3ce]">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-[13.5px] text-[#8fbdb8]">
          Đồ án chuyên ngành – Hệ thống đặt lịch và quản lý quy trình khám bệnh
        </div>
      </div>

      <div className="flex flex-[1_1_480px] items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-[450px] flex-col">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="shadow-card flex flex-col gap-[18px] rounded-[22px] bg-white p-[34px]">
              <div>
                <h2 className="m-0 mb-1 text-[26px] font-extrabold">Chào mừng quay lại</h2>
                <div className="text-[15px] text-muted">Đăng nhập để tiếp tục.</div>
              </div>

              {successMsg && (
                <div className="rounded-xl bg-[#dcf4e8] px-3.5 py-2.5 text-sm font-semibold text-[#116a40]">
                  {successMsg}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="tk" className="text-sm font-semibold">Tên đăng nhập</label>
                <input
                  id="tk"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập hoặc Gmail"
                  className="min-h-[48px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-4 text-[15px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="mk" className="text-sm font-semibold">Mật khẩu</label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[13px] font-bold text-brand hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <input
                  id="mk"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-[48px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-4 text-[15px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              {error && <div className="rounded-xl bg-[#fde4e2] px-3.5 py-2.5 text-sm text-[#9c2018]">{error}</div>}

              <Btn type="submit" className="min-h-12 text-[15.5px]">Đăng nhập</Btn>
              <Btn type="button" onClick={() => switchMode('register')} className="min-h-12 text-[15.5px]">Đăng ký</Btn>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="shadow-card flex flex-col gap-4 rounded-[22px] bg-white p-[32px]">
              <div>
                <h2 className="m-0 mb-1 text-[25px] font-extrabold">Đăng ký tài khoản</h2>
                <div className="text-[14px] text-muted">Nhập thông tin và Gmail để đặt lịch khám online.</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold">Họ và tên bệnh nhân</label>
                  <input
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[13.5px] focus:bg-white focus:outline-2 focus:outline-brand"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold">Số điện thoại</label>
                  <input
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[13.5px] focus:bg-white focus:outline-2 focus:outline-brand"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Địa chỉ Email (Gmail nhận mã OTP &amp; lịch khám)</label>
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="min-h-[44px] w-full rounded-xl border-[1.5px] border-brand bg-[#f0fdf9] pl-3.5 pr-24 text-[13.5px] font-bold focus:bg-white focus:outline-2 focus:outline-brand"
                  />
                  <span className="absolute right-2.5 rounded-lg bg-[#dcf4e8] px-2.5 py-1 text-[11px] font-bold text-[#116a40]">
                    Xác thực
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Tên đăng nhập</label>
                <input
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="min-h-[44px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[13.5px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Mật khẩu</label>
                <input
                  type="password"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-[44px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[14px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-[44px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[14px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              {error && <div className="rounded-xl bg-[#fde4e2] px-3.5 py-2 text-sm text-[#9c2018]">{error}</div>}

              <Btn type="submit" className="min-h-[46px]">Đăng ký tài khoản</Btn>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="min-h-[44px] w-full cursor-pointer rounded-xl border border-[#cfe2df] bg-white text-[14px] font-bold text-ink hover:bg-soft"
              >
                Đã có tài khoản? Quay lại đăng nhập
              </button>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleResetPassword} className="shadow-card flex flex-col gap-4 rounded-[22px] bg-white p-[32px]">
              <div>
                <h2 className="m-0 mb-1 text-[25px] font-extrabold">Quên mật khẩu</h2>
                <div className="text-[13.5px] text-muted">Khôi phục mật khẩu bằng mã xác thực OTP gửi qua Gmail.</div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex min-h-[34px] items-center justify-center rounded-lg border border-brand bg-[#e8f6f3] text-[12px] font-bold text-brand">
                  ✓ 1. Nhập Gmail nhận mã
                </div>
                <div className="flex min-h-[34px] items-center justify-center rounded-lg bg-deep text-[12px] font-bold text-white">
                  2. Xác nhận OTP &amp; Đổi mới
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Địa chỉ Gmail đã đăng ký</label>
                <div className="flex gap-2.5">
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    className="min-h-[42px] flex-1 rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[13.5px] font-bold focus:bg-white focus:outline-2 focus:outline-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="min-h-[42px] cursor-pointer rounded-xl border border-brand bg-[#e8f6f3] px-3.5 text-[12.5px] font-bold text-brand"
                  >
                    Gửi lại (45s)
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className="rounded-xl border border-[#b7e4c7] bg-[#f0fdf4] px-3.5 py-2.5 text-[12.5px] font-bold text-[#116a40]">
                  ✉ Đã gửi mã OTP 6 số tới hộp thư {fpEmail || 'nguyenvanan@gmail.com'}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Mã xác thực OTP (6 chữ số trong Gmail)</label>
                <div className="grid grid-cols-6 gap-2.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      className="h-[44px] w-full rounded-xl border-[1.5px] border-brand bg-white text-center text-[18px] font-bold text-deep focus:outline-2 focus:outline-brand"
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Mật khẩu mới</label>
                <input
                  type="password"
                  value={fpNewPass}
                  onChange={(e) => setFpNewPass(e.target.value)}
                  placeholder="••••••••••nop••"
                  className="min-h-[42px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[14px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold">Nhập lại mật khẩu mới</label>
                <input
                  type="password"
                  value={fpConfirmPass}
                  onChange={(e) => setFpConfirmPass(e.target.value)}
                  placeholder="••••••••••••"
                  className="min-h-[42px] w-full rounded-xl border border-[#cfe2df] bg-[#f8fbfa] px-3.5 text-[14px] focus:bg-white focus:outline-2 focus:outline-brand"
                />
              </div>

              {error && <div className="rounded-xl bg-[#fde4e2] px-3.5 py-2 text-sm text-[#9c2018]">{error}</div>}

              <Btn type="submit" className="min-h-[46px]">Xác nhận đổi mật khẩu</Btn>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="min-h-[44px] w-full cursor-pointer rounded-xl border border-[#cfe2df] bg-white text-[14px] font-bold text-ink hover:bg-soft"
              >
                Quay lại màn hình đăng nhập
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}