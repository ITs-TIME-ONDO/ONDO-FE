import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import NicknameInput from '../../components/NicknameInput'
import ProfileImagePicker from '../login/ProfileImagePicker'
import profileChar from '../../assets/profile_char.svg'
import { DEFAULT_NICKNAME } from '../../constants/user'
import { getUserProfile, putUserProfile } from '../../api/user'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(
    () => localStorage.getItem('nickname') ?? DEFAULT_NICKNAME
  )
  const [profileImage, setProfileImage] = useState<string | null>(() =>
    localStorage.getItem('profileImage')
  )
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasEditedRef = useRef(false)

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        if (hasEditedRef.current) return
        setNickname(profile.nickname)
        setProfileImage(profile.profileImageUrl || null)
      })
      .catch((error) => {
        console.error('프로필 조회 실패:', error)
      })
  }, [])

  const handleNicknameChange = (value: string) => {
    hasEditedRef.current = true
    setNickname(value)
  }

  const handleProfileImageChange = (file: File, previewUrl: string) => {
    hasEditedRef.current = true
    setProfileImageFile(file)
    setProfileImage(previewUrl)
  }

  return (
    <PageTransition>
      <div className="relative h-[844px] w-[390px] overflow-hidden bg-white">
        {/* 헤더 */}
        <PageHeader title="프로필 편집" fallbackPath="/mypage" />

        {/* 프로필 이미지 */}
        <ProfileImagePicker
          defaultImage={profileChar}
          className="top-[160px]"
          initialValue={profileImage}
          onChange={handleProfileImageChange}
        />

        {/* 닉네임 입력 */}
        <NicknameInput
          value={nickname}
          onChange={handleNicknameChange}
          className="top-[422px]"
        />

        {/* 저장하기 버튼 */}
        <button
          type="button"
          className={`absolute left-6 top-[720px] flex h-[60px] w-[342px] items-center justify-center rounded-full text-[20px] font-bold text-white transition-colors ${nickname.trim() && !isSubmitting ? 'bg-[#ff9e1b]' : 'bg-[#ff9e1b]/50'}`}
          disabled={!nickname.trim() || isSubmitting}
          onClick={async () => {
            if (isSubmitting) return

            try {
              setIsSubmitting(true)

              const trimmedNickname = nickname.trim()

              await putUserProfile({
                nickname: trimmedNickname,
                profileImage: profileImageFile,
              })

              localStorage.setItem('nickname', trimmedNickname)
              navigate('/mypage', { replace: true })
            } catch (error) {
              console.error('프로필 저장 실패:', error)
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </PageTransition>
  )
}
