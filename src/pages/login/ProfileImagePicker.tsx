import { useRef, useState } from 'react'
import cameraIcon from '../../assets/gridicons_camera.svg'

interface ProfileImagePickerProps {
  defaultImage: string
  className?: string
  initialValue?: string | null
  onChange?: (base64: string) => void
}

export default function ProfileImagePicker({
  defaultImage,
  className = '',
  initialValue,
  onChange,
}: ProfileImagePickerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialValue ?? null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setImageUrl(base64)
      onChange?.(base64)
    }
    reader.readAsDataURL(file)
  }

  return (
    <>
      <div
        className={`absolute left-1/2 -translate-x-1/2 size-[220px] ${className}`}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #FF9E1B, #FFDCAE)' }}
        />
        <img
          alt="프로필 이미지"
          className="absolute inset-0 size-full object-cover rounded-full cursor-pointer"
          src={imageUrl ?? defaultImage}
          onClick={() => setIsPreviewOpen(true)}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-[10px] right-[-10px] flex size-10 items-center justify-center rounded-full"
          style={{
            background: 'rgba(243, 243, 243)',
            filter: 'drop-shadow(0 0 1px #FF9E1B)',
          }}
        >
          <img alt="사진 변경" className="size-[22px]" src={cameraIcon} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setIsPreviewOpen(false)}
        >
          <img
            alt="프로필 확대"
            className="size-[300px] rounded-full object-cover"
            src={imageUrl ?? defaultImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
