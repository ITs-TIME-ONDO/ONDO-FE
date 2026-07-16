import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import NicknameInput from '../../components/NicknameInput'
import ProfileImagePicker from '../login/ProfileImagePicker'
import profileChar from '../../assets/profile_char.svg'
import { DEFAULT_NICKNAME } from '../../constants/user'
import { getUserProfile, putUserProfile } from '../../api/user'
import { ApiError } from '../../api/client'

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
  const originalNicknameRef = useRef(nickname)

  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        originalNicknameRef.current = profile.nickname
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

  const hasChanges =
    nickname.trim() !== originalNicknameRef.current.trim() ||
    Boolean(profileImageFile)

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
          className={`absolute bottom-16 left-6 flex h-[60px] w-[342px] items-center justify-center rounded-full text-[20px] font-bold text-white transition-colors ${nickname.trim() && hasChanges && !isSubmitting ? 'bg-[#ff9e1b]' : 'bg-[#ff9e1b]/50'}`}
          disabled={!nickname.trim() || !hasChanges || isSubmitting}
          onClick={async () => {
            if (isSubmitting) return

            try {
              setIsSubmitting(true)
              const controller = new AbortController()
              const timeoutId = window.setTimeout(() => controller.abort(), 20000)

              const trimmedNickname = nickname.trim()
              const nicknameChanged =
                trimmedNickname !== originalNicknameRef.current.trim()

              if (!nicknameChanged && !profileImageFile) {
                navigate('/mypage', { replace: true })
                return
              }

              try {
                await putUserProfile(
                  {
                    nickname: nicknameChanged ? trimmedNickname : undefined,
                    profileImage: profileImageFile,
                  },
                  controller.signal
                )
              } finally {
                window.clearTimeout(timeoutId)
              }

              localStorage.setItem('nickname', trimmedNickname)
              originalNicknameRef.current = trimmedNickname
              navigate('/mypage', { replace: true })
            } catch (error) {
              console.error('프로필 저장 실패:', error)
              if (error instanceof DOMException && error.name === 'AbortError') {
                alert('이미지 업로드 시간이 초과되었습니다. 다시 시도해주세요.')
              } else if (error instanceof ApiError && error.status === 409) {
                alert('이미 사용 중인 닉네임입니다.')
              } else {
                alert('프로필 저장에 실패했습니다. 다시 시도해주세요.')
              }
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
