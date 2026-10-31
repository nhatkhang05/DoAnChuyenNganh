import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

// ---- Thẻ (card) ----
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`shadow-card rounded-[18px] bg-white ${className}`}>{children}</div>
}

// ---- Nhãn trạng thái ----
const tones = {
  ok: 'bg-[#dcf4e8] text-[#116a40]',
  wait: 'bg-[#fdf0d5] text-[#7a4d00]',
  no: 'bg-[#fde4e2] text-[#9c2018]',
  info: 'bg-[#e0eefa] text-[#1b4d78]',
  gray: 'bg-[#eceff0] text-[#4a5857]',
}
export type Tone = keyof typeof tones

export function Tag({ tone, children, className = '' }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-[11px] py-1 text-[12.5px] font-semibold ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}

// ---- Nút ----
const variants = {
  primary: 'bg-brand text-white shadow-[0_4px_12px_rgba(11,143,132,.25)] hover:bg-brand-dark',
  light: 'bg-brand-soft text-[#07685f] hover:bg-[#cdebe6]',
  danger: 'bg-[#fdeceb] text-[#a3261d] hover:bg-[#fbdcda]',
  ghost: 'border border-dashed border-[#86b9b4] bg-white text-[#07685f]',
}
const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold no-underline disabled:cursor-not-allowed disabled:!bg-[#d6e0de] disabled:!text-[#6a807d] disabled:!shadow-none'
const sizes = { md: 'min-h-[46px] px-5 text-[15px]', sm: 'min-h-[38px] rounded-[10px] px-3.5 text-sm' }

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}
export function Btn({ variant = 'primary', size = 'md', className = '', ...rest }: BtnProps) {
  return <button type="button" className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />
}

interface BtnLinkProps extends LinkProps {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}
export function BtnLink({ variant = 'primary', size = 'md', className = '', ...rest }: BtnLinkProps) {
  return <Link className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest} />
}

// ---- Chip (nút bấm dạng viên thuốc, dùng làm tab / bộ lọc) ----
export function Chip({ active, onClick, children, dark = true }: { active: boolean; onClick: () => void; children: ReactNode; dark?: boolean }) {
  const on = dark ? 'border-deep bg-deep text-white' : 'border-brand bg-brand text-white'
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 cursor-pointer items-center rounded-full border px-4 text-[14.5px] font-medium ${active ? on : 'border-[#cfe2df] bg-white text-[#1d4a46] hover:border-brand'
        }`}
    >
      {children}
    </button>
  )
}

export function Avatar({ letter, size = 44, className = '' }: { letter: string; size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex flex-none items-center justify-center rounded-full bg-[#dff3f0] font-bold text-[#07685f] ${className}`}
    >
      {letter}
    </div>
  )
}

export function PageTitle({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3.5">
      <div>
        <h1 className="m-0 mb-1 text-[30px] font-extrabold">{title}</h1>
        {sub && <div className="text-[15px] text-muted">{sub}</div>}
      </div>
      {children}
    </div>
  )
}

// Đã ẩn dòng chữ "Dữ liệu trên màn hình là dữ liệu mẫu để minh họa."
export function SampleNote() {
  return null
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-[14px] bg-soft px-4 py-5 text-center text-sm text-muted">{children}</div>
}