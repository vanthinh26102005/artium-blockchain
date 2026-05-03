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
export const UploadArtworkMenu = ({ triggerLabel = 'Upload Artwork' }: UploadArtworkMenuProps) => {
  return (
    <Button
      asChild
      variant="default"
      size="lg"
      className="gap-2 bg-primary font-bold text-white hover:bg-primary/90"
    >
      <Link href="/artworks/upload">
        <Upload className="h-4 w-4" />
        {triggerLabel}
      </Link>
    </Button>
  )
}
