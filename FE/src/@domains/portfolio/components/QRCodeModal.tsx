import { useMemo, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shared/components/ui/dialog'
import { Button } from '@shared/components/ui/button'

interface QRCodeModalProps {
  isOpen: boolean
  onClose: () => void
  artistName: string
  handle: string
}

/**
 * QRCodeModal - React component
 * @returns React element
 */
export const QRCodeModal = ({ isOpen, onClose, artistName, handle }: QRCodeModalProps) => {
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate the portfolio URL based on handle
  /**
   * qrRef - Utility function
   * @returns void
   */
  const portfolioUrl = useMemo(() => {
    if (typeof window === 'undefined') return ''
    const cleanHandle = handle.replace('@', '')
    return `${window.location.origin}/portfolio/${cleanHandle}`
  }, [handle])

  /**
   * portfolioUrl - Utility function
   * @returns void
   */
  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    // Create canvas and draw SVG
    /**
     * cleanHandle - Utility function
     * @returns void
     */
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    /**
     * downloadQRCode - Utility function
     * @returns void
     */

    const img = new Image()
    img.onload = () => {
      // Set canvas size with padding
      /**
       * svg - Utility function
       * @returns void
       */
      const padding = 40
      canvas.width = img.width + padding * 2
      canvas.height = img.height + padding * 2

      // Draw white background
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      /**
       * canvas - Utility function
       * @returns void
       */

      // Draw QR code
      ctx.drawImage(img, padding, padding)

      /**
       * ctx - Utility function
       * @returns void
       */
      // Download
      const pngUrl = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = pngUrl
      downloadLink.download = `${artistName.replace(/\s+/g, '_')}_QRCode.png`
      downloadLink.click()
      /**
       * svgData - Utility function
       * @returns void
       */

      URL.revokeObjectURL(url)
    }
    img.src = url
    /**
     * svgBlob - Utility function
     * @returns void
     */
  }

  const printQRCode = () => {
    const svg = qrRef.current?.querySelector('svg')
    /**
     * url - Utility function
     * @returns void
     */
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    /**
     * img - Utility function
     * @returns void
     */

    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${artistName}</title>
/**
 * padding - Utility function
 * @returns void
 */
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        font-family: system-ui, -apple-system, sans-serif;
                    }
                    h1 {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 24px;
                    }
/**
 * pngUrl - Utility function
 * @returns void
 */
                    .qr-container {
                        padding: 20px;
                        background: white;
                    }
/**
 * downloadLink - Utility function
 * @returns void
 */
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>
                <h1>${artistName}</h1>
                <div class="qr-container">${svgData}</div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.close();
                    }
/**
 * printQRCode - Utility function
 * @returns void
 */
                </script>
            </body>
            </html>
        `)
    /**
     * svg - Utility function
     * @returns void
     */
    printWindow.document.close()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-2xl bg-white p-6 sm:max-w-[420px]">
        /** * svgData - Utility function * @returns void */
        <DialogHeader className="mb-2">
          <DialogTitle className="text-center text-2xl font-bold">My QR code</DialogTitle>
        </DialogHeader>
        /** * printWindow - Utility function * @returns void */
        <p className="mb-6 text-center text-slate-600">
          Let people access your portfolio instantly by scanning this QR code. Download or print it
          to share on products, displays, or at events.
        </p>
        {/* Artist Name */}
        <h3 className="mb-4 text-center text-xl font-bold">{artistName}</h3>
        {/* QR Code */}
        <div ref={qrRef} className="mb-6 flex justify-center">
          <QRCodeSVG
            value={portfolioUrl}
            size={200}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="h-12 flex-1 gap-2 border-slate-300"
            onClick={downloadQRCode}
          >
            <Download className="h-4 w-4" />
            Download PNG
          </Button>
          <Button
            variant="outline"
            className="h-12 flex-1 gap-2 border-slate-300"
            onClick={printQRCode}
          >
            <Printer className="h-4 w-4" />
            Print QR Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
