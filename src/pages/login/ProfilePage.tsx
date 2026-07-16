import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import profileChar from '../../assets/profile_char.svg'
import PageTransition from '../../components/PageTransition'
import NicknameInput from '../../components/NicknameInput'
import ProfileImagePicker from './ProfileImagePicker'
import { postUserProfile } from '../../api/user'

export default function ProfilePage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <PageTransition>
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-white">
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
        <ProfileImagePicker
          defaultImage={profileChar}
          className="top-[261px]"
          onChange={(file) => setProfileImageFile(file)}
        />

        {/* 닉네임 입력 */}
        <NicknameInput value={nickname} onChange={setNickname} />

        {/* 다음 버튼 */}
        <button
          type="button"
          className={`absolute bottom-16 left-6 flex h-[60px] w-[342px] items-center justify-center rounded-full text-[20px] font-bold text-white transition-colors ${nickname.trim() && !isSubmitting ? 'bg-[#ff9e1b]' : 'bg-[#ff9e1b]/50'}`}
          disabled={!nickname.trim() || isSubmitting}
          onClick={async () => {
            if (isSubmitting) return

            try {
              setIsSubmitting(true)

              await postUserProfile({
                nickname: nickname.trim(),
                profileImage: profileImageFile,
              })

              localStorage.setItem('nickname', nickname)
              navigate('/terms')
            } catch (error) {
              console.error('프로필 저장 실패:', error)
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          {isSubmitting ? '저장 중...' : '다음'}
        </button>
      </div>
    </PageTransition>
  )
}
