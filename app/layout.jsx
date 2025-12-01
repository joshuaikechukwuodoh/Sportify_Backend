import './globals.css'

export const metadata = {
  title: 'Spotify Backend',
  description: 'API Documentation for Spotify Backend',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}