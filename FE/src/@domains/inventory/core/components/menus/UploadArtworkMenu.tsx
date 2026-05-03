// next
import Link from 'next/link'

// third-party
import { Upload } from 'lucide-react'

// @shared
import { Button } from '@shared/components/ui/button'

type UploadArtworkMenuProps = {
  triggerLabel?: string
}

/**
 * UploadArtworkMenu - React component
 * @returns React element
 */
export const UploadArtworkMenu = ({
  triggerLabel = 'Upload Artwork',
}: UploadArtworkMenuProps) => {
  return (
    <Button
      asChild
      variant="default"
      size="lg"
      className="bg-primary hover:bg-primary/90 gap-2 font-bold text-white"
    >
      <Link href="/artworks/upload">
        <Upload className="h-4 w-4" />
        {triggerLabel}
      </Link>
    </Button>
  )
}
