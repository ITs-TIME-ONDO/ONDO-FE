import PageTransition from '../../components/PageTransition'
import BottomNav from '../../components/BottomNav'

import logo from '../../assets/logo.png'
import alertIcon from '../../assets/alert.png'
import profileBtn from '../../assets/top_small_profile_btn.png'
import cryingChar from '../../assets/crying_char.png'

export default function HomePage() {
  return (
    <PageTransition>
      <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-gradient-to-b from-white via-[#FFF4E8] to-[#FFC679]">
        <header className="absolute left-0 top-[50px] flex w-full items-center justify-between px-6">
          <img src={logo} alt="ONDO" className="h-6 w-[97px] object-contain" />

          <div className="flex items-center gap-3">
            <img src={alertIcon} alt="알림" className="h-6 w-5" />
            <img src={profileBtn} alt="프로필" className="h-6 w-6" />
          </div>
        </header>

        <main className="absolute left-0 top-[267px] flex w-full flex-col items-center">
          <img
            src={cryingChar}
            alt="울고 있는 캐릭터"
            className="h-auto w-[200px] object-contain"
          />

          <p className="mt-5 text-sm text-[#666666]">아직 요청이 없어요</p>
        </main>

        <BottomNav />
      </div>
    </PageTransition>
  )
}
