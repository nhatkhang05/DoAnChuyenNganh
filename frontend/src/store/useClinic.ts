import { useContext } from 'react'
import { ClinicContext } from './clinicContext'

export function useClinic() {
  const ctx = useContext(ClinicContext)
  if (!ctx) throw new Error('useClinic phải dùng bên trong <ClinicProvider>')
  return ctx
}
