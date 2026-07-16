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
      alert('이미지 파일만 선택할 수 있습니다.')
      e.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('10MB 이하의 이미지를 선택해주세요.')
      e.target.value = ''
      return
    }
    const previewUrl = URL.createObjectURL(file)
    setImageUrl(previewUrl)
    onChange?.(file, previewUrl)
  }

  const handleUseDefaultImage = async () => {
    setIsImageMenuOpen(false)
    setImageUrl(null)

    try {
      const response = await fetch(defaultImage)
      const blob = await response.blob()
      const extension = blob.type.includes('svg') ? 'svg' : 'png'
      const file = new File([blob], `default-profile.${extension}`, {
        type: blob.type,
      })
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
        <img
          alt="프로필 이미지"
          className={`absolute inset-0 z-30 size-full cursor-pointer rounded-full object-cover transition-transform duration-200 ease-out ${
            isImageMenuOpen ? 'scale-[1.03]' : 'scale-100'
          }`}
          src={imageUrl ?? defaultImage}
          onClick={() => setIsImageMenuOpen((prev) => !prev)}
        />

        {isImageMenuOpen && (
          <>
            <button
              type="button"
              aria-label="이미지 선택 메뉴 닫기"
              className="fixed inset-0 z-20 cursor-default bg-black/25"
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
