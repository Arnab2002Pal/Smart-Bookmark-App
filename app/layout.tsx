import './globals.css'

export const metadata = {
  title: 'Smart Bookmark',
  description: 'Modern real-time bookmark manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white antialiased">
        {children}
      </body>
    </html>
  )
}
