import "./globals.css"

export const metadata = {
  title: "Smart Tourist Safety App",
  description: "Get real-time weather information and traffic updates for any city",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
