import loginChar from '../../assets/login_char.png'
import logo from '../../assets/logo.png'
import kakaoLogo from '../../assets/kakao_logo.png'
import PageTransition from '../../components/PageTransition'
import { getKakaoLoginUrl } from '../../api/auth'

export default function LoginPage() {
  return (
    <PageTransition>
      <div
        className="relative h-[844px] w-[390px] overflow-hidden"
        style={{ background: 'rgba(255, 158, 27, 0.1)' }}
      >
        {/* 큰 원형 배경 */}
        <div
          className="absolute -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            left: 'calc(50% - 6px)',
            top: 280,
            width: 676,
            height: 676,
            background: 'radial-gradient(circle, rgba(255, 158, 27, 0.6) 0%, rgba(255, 158, 27, 0) 70%)',
          }}
        />

        {/* 작은 타원 (하단 그림자) */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: 'calc(25% + 27.5px)',
            top: 670,
            width: 128,
            height: 14,
            background: 'radial-gradient(ellipse, rgba(102, 102, 102, 0.2) 0%, transparent 100%)',
          }}
        />

        {/* 상단 슬로건 + 로고 */}
        <div
          className="absolute -translate-x-1/2 flex flex-col items-center"
          style={{ left: '50%', top: 104, gap: 9 }}
        >
          <p className="whitespace-nowrap text-[14px] text-[#343434] tracking-[-0.56px]">
            도움이 필요한 순간, 온도를 나누다
          </p>
          <img
            alt="온도 로고"
            className="object-contain pointer-events-none"
            style={{ width: 160, height: 38 }}
            src={logo}
          />
        </div>

        {/* 채팅 버블 */}
        <div
          className="absolute flex items-center rounded-[50px] bg-white px-5 py-3"
          style={{ left: 24, top: 308 }}
        >
          <span className="text-[14px] text-[#343434] tracking-[-0.56px] whitespace-nowrap">
            오늘 저녁에 같이 맥주 먹을 사람!
          </span>
        </div>
        <div
          className="absolute flex items-center rounded-[50px] bg-white px-5 py-3"
          style={{ left: 'calc(25% + 71.5px)', top: 369 }}
        >
          <span className="text-[14px] text-[#343434] tracking-[-0.56px] whitespace-nowrap">
            지금 도와주러 올 수 있는 사람!
          </span>
        </div>
        <div
          className="absolute flex items-center rounded-[50px] bg-white px-5 py-3"
          style={{ left: 45, top: 422 }}
        >
          <span className="text-[14px] text-[#343434] tracking-[-0.56px] whitespace-nowrap">
            사진 잘 찍어 주는 사람!
          </span>
        </div>

        {/* 캐릭터 이미지 */}
        <img
          alt="온도 캐릭터"
          className="absolute -translate-x-1/2 object-cover pointer-events-none"
          style={{ left: '50%', top: 491, width: 162, height: 201 }}
          src={loginChar}
        />

        {/* 카카오 로그인 버튼 */}
        <button
          className="absolute -translate-x-1/2 flex items-center justify-center gap-3 rounded-full bg-[#f8e533]"
          style={{ left: '50%', top: 720, width: 342, height: 60 }}
          onClick={() => {
            window.location.href = getKakaoLoginUrl()
          }}
        >
          <img alt="카카오 로고" className="size-5 object-contain" src={kakaoLogo} />
          <span className="text-[16px] font-bold text-black tracking-[-0.3px]">
            카카오로 시작하기
          </span>
        </button>
      </div>
    </PageTransition>
  )
}
