import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Frontend chạy ở http://localhost:5173
// Sau này khi có backend NestJS, thêm proxy ở đây để gọi API (ví dụ /api -> http://localhost:3000)
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
