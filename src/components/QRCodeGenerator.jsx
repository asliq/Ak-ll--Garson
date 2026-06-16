import { useEffect, useRef } from 'react'
import { Download, Printer } from 'lucide-react'
import styles from './QRCodeGenerator.module.css'

export function QRCodeGenerator({ tableId, tableNumber }) {
  const canvasRef = useRef(null)
  const url = `${window.location.origin}/customer?table=${tableId}`

  useEffect(() => {
    if (!canvasRef.current) return

    // Basit QR kod oluşturma (gerçek projede qrcode kütüphanesi kullanılmalı)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const size = 200
    canvas.width = size
    canvas.height = size

    // Arka plan
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, size, size)

    // Basit QR pattern (demo)
    ctx.fillStyle = '#000000'
    const moduleSize = size / 25
    for (let row = 0; row < 25; row++) {
      for (let col = 0; col < 25; col++) {
        // Rastgele pattern (gerçek QR için kütüphane kullan)
        if (Math.random() > 0.5) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }

    // Köşe marker'ları
    const drawCornerMarker = (x, y) => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(x, y, moduleSize * 7, moduleSize * 7)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(x + moduleSize, y + moduleSize, moduleSize * 5, moduleSize * 5)
      ctx.fillStyle = '#000000'
      ctx.fillRect(x + moduleSize * 2, y + moduleSize * 2, moduleSize * 3, moduleSize * 3)
    }

    drawCornerMarker(0, 0)
    drawCornerMarker(size - moduleSize * 7, 0)
    drawCornerMarker(0, size - moduleSize * 7)
  }, [tableId])

  const handleDownload = () => {
    const canvas = canvasRef.current
    const link = document.createElement('a')
    link.download = `masa-${tableNumber}-qr.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const handlePrint = () => {
    const canvas = canvasRef.current
    const printWindow = window.open('', '', 'width=600,height=600')
    printWindow.document.write(`
      <html>
        <head>
          <title>Masa ${tableNumber} QR Kod</title>
          <style>
            body { 
              display: flex; 
              flex-direction: column;
              align-items: center; 
              justify-content: center;
              padding: 40px;
              font-family: Arial, sans-serif;
            }
            h1 { margin-bottom: 20px; }
            img { border: 2px solid #000; padding: 10px; }
            p { margin-top: 20px; font-size: 14px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Masa ${tableNumber}</h1>
          <img src="${canvas.toDataURL()}" />
          <p>Menüyü görmek için QR kodu okutun</p>
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div className={styles.qrGenerator}>
      <div className={styles.qrCard}>
        <div className={styles.qrHeader}>
          <h3>Masa {tableNumber}</h3>
          <span className={styles.qrSubtitle}>Menü QR Kodu</span>
        </div>
        <div className={styles.qrCanvas}>
          <canvas ref={canvasRef} />
        </div>
        <div className={styles.qrUrl}>{url}</div>
        <div className={styles.qrActions}>
          <button className={styles.downloadBtn} onClick={handleDownload}>
            <Download size={18} />
            İndir
          </button>
          <button className={styles.printBtn} onClick={handlePrint}>
            <Printer size={18} />
            Yazdır
          </button>
        </div>
      </div>
    </div>
  )
}

