import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import PageHeader from '../../components/PageHeader'
import NicknameInput from '../../components/NicknameInput'
import ProfileImagePicker from '../login/ProfileImagePicker'
import profileChar from '../../assets/profile_char.svg'
import { DEFAULT_NICKNAME } from '../../constants/user'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState(
    () => localStorage.getItem('nickname') ?? DEFAULT_NICKNAME
  )
  const [profileImage, setProfileImage] = useState<string | null>(() =>
    localStorage.getItem('profileImage')
  )

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
          onChange={setProfileImage}
        />

        {/* 닉네임 입력 */}
        <NicknameInput
          value={nickname}
          onChange={setNickname}
          className="top-[422px]"
        />

        {/* 저장하기 버튼 */}
        <button
          type="button"
          className={`absolute left-6 top-[720px] flex h-[60px] w-[342px] items-center justify-center rounded-full text-[20px] font-bold text-white transition-colors ${nickname.trim() ? 'bg-[#ff9e1b]' : 'bg-[#ff9e1b]/50'}`}
          disabled={!nickname.trim()}
          onClick={() => {
            localStorage.setItem('nickname', nickname)
            if (profileImage) localStorage.setItem('profileImage', profileImage)
            navigate('/mypage', { replace: true })
          }}
        >
          저장하기
        </button>
      </div>
    </PageTransition>
  )
}
