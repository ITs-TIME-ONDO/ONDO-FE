import { useEffect, useRef, useState } from 'react'

interface ProfileImagePickerProps {
  defaultImage: string
  className?: string
  initialValue?: string | null
  onChange?: (file: File, previewUrl: string) => void
}

export default function ProfileImagePicker({
  defaultImage,
  className = '',
  initialValue,
  onChange,
}: ProfileImagePickerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialValue ?? null)
  const [isImageMenuOpen, setIsImageMenuOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setImageUrl(initialValue ?? null)
  }, [initialValue])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      e.target.value = ''
      return
    }
    if (file.size > 1024 * 1024) {
      e.target.value = ''
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setImageUrl(previewUrl)
    onChange?.(file, previewUrl)
    e.target.value = ''
  }

  const handleUseDefaultImage = async () => {
    setIsImageMenuOpen(false)

    try {
      const response = await fetch(defaultImage)
      if (!response.ok) throw new Error('기본 이미지 로드 실패')
      const blob = await response.blob()
      const extension = blob.type.includes('svg') ? 'svg' : 'png'
      const file = new File([blob], `default-profile.${extension}`, {
        type: blob.type,
      })
      setImageUrl(null)
      onChange?.(file, defaultImage)
    } catch {}
  }

  return (
    <>
      <div
        className={`absolute left-[calc(50%_-_110px)] z-20 size-[220px] ${className}`}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #FF9E1B, #FFDCAE)' }}
        />
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isImageMenuOpen}
          aria-label="프로필 이미지 변경 메뉴"
          onClick={() => setIsImageMenuOpen((prev) => !prev)}
          className={`absolute inset-0 z-30 size-full rounded-full transition-transform duration-200 ease-out ${
            isImageMenuOpen ? 'scale-[1.03]' : 'scale-100'
          }`}
        >
          <img
            alt="프로필 이미지"
            className="size-full rounded-full object-cover"
            src={imageUrl ?? defaultImage}
          />
        </button>

        {isImageMenuOpen && (
          <>
            <button
              type="button"
              aria-label="이미지 선택 메뉴 닫기"
              className="fixed inset-0 z-20 bg-black/25"
              onPointerDown={() => setIsImageMenuOpen(false)}
            />
            <div
              className="absolute bottom-[-93px] left-1/2 z-50 flex w-36 flex-col divide-y divide-[#E8E8E8] rounded-[5px] border border-white/60 bg-white/90 backdrop-blur-[2px]"
              style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.25)' }}
            >
              <button
                type="button"
                className="px-4 py-2.5 text-left text-sm text-black"
                onClick={() => {
                  setIsImageMenuOpen(false)
                  fileInputRef.current?.click()
                }}
              >
                사진 선택
              </button>
              <button
                type="button"
                className="px-4 py-2.5 text-left text-sm text-black"
                onClick={() => void handleUseDefaultImage()}
              >
                기본 이미지 사용
              </button>
            </div>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </>
  )
}
