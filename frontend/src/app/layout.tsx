import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/Providers'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI Agent Code Web - 智能协作代码生成平台',
  description: '与AI智能体进行自然语言对话，轻松生成高质量代码。实时可视化多智能体协作过程。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 