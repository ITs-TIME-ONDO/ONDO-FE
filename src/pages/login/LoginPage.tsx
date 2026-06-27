import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import profileChar from '../../assets/profile_char.svg'
import cameraIcon from '../../assets/gridicons_camera.svg'
import PageTransition from '../../components/PageTransition'

export default function LoginPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setProfileImage(url)
  }

  return (
    <PageTransition>
      <div
        className="relative mx-auto bg-white overflow-hidden"
        style={{ width: 390, minHeight: '100dvh' }}
      >
        {/* 진행 단계 바 */}
        <div className="absolute flex gap-1 items-center left-6 top-10">
          <div className="h-1 w-[169px] rounded-full bg-[#ff9e1b]" />
          <div className="h-1 w-[169px] rounded-full bg-[#c6c6c6]" />
        </div>

        {/* 타이틀 */}
        <div className="absolute left-6 top-[104px] text-[22px] font-medium leading-7 text-black">
          <p>온도에서 사용할</p>
          <p>프로필을 만들어주세요</p>
        </div>

        {/* 프로필 이미지 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[261px] size-[220px]">
          <div className="absolute inset-0 rounded-full bg-[#ff9e1b]" />
          <img
            alt="프로필 캐릭터"
            className="absolute inset-0 size-full object-cover rounded-full"
            src={profileImage ?? profileChar}
          />

          {/* 카메라 버튼 */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-[10px] right-[-10px] flex size-10 items-center justify-center rounded-full bg-white shadow-sm"
          >
            <img alt="사진 변경" className="size-[22px]" src={cameraIcon} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfileChange}
          />
        </div>

        {/* 닉네임 입력 */}
        <div className="absolute left-6 top-[523px] w-[342px]">
          <p className="ml-5 mb-[7px] text-[16px] font-medium text-black">
            닉네임
          </p>
          <div
            className={`flex h-[50px] items-center rounded-full bg-[#f3f3f3] px-5 border ${nickname ? 'border-[#ff9e1b]' : 'border-transparent'}`}
          >
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임을 입력해주세요"
              className="w-full bg-transparent text-[16px] text-black placeholder:text-[#929292] outline-none"
            />
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          className={`absolute left-6 top-[720px] flex h-[60px] w-[342px] items-center justify-center rounded-full text-[20px] font-bold text-white transition-colors ${nickname ? 'bg-[#ff9e1b]' : 'bg-[#ff9e1b]/50'}`}
          disabled={!nickname}
          onClick={() => navigate('/terms')}
        >
          다음
        </button>
      </div>
    </PageTransition>
  )
}
