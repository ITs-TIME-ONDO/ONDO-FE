import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import CheckIcon from '../../components/CheckIcon'
import NextButton from '../../components/NextButton'

const TERMS = [
  { id: 'service', label: '(필수) 서비스 이용약관 동의' },
  { id: 'privacy', label: '(필수) 개인정보 수집 및 이용 동의' },
  { id: 'location', label: '(필수) 위치기반서비스 이용 동의' },
  { id: 'age', label: '(필수) 만 14세 이상입니다' },
]

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 4L10 8L6 12" stroke="#929292" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function TermsPage() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState<Record<string, boolean>>({
    service: false,
    privacy: false,
    location: false,
    age: false,
  })

  const allChecked = TERMS.every((t) => checked[t.id])

  const toggleAll = () => {
    const next = !allChecked
    setChecked({ service: next, privacy: next, location: next, age: next })
  }

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <PageTransition>
      <div className="relative mx-auto bg-white overflow-hidden" style={{ width: 390, minHeight: '100dvh' }}>
        {/* 진행 단계 바 */}
        <div className="absolute flex gap-1 items-center left-6 top-10">
          <div className="h-1 w-[169px] rounded-full bg-[#c6c6c6]" />
          <div className="h-1 w-[169px] rounded-full bg-[#ff9e1b]" />
        </div>

        {/* 타이틀 */}
        <div className="absolute left-6 top-[104px] text-[22px] font-medium leading-7 text-black">
          <p>회원가입 약관에</p>
          <p>동의해 주세요</p>
        </div>

        {/* 모두 체크하기 */}
        <button
          type="button"
          onClick={toggleAll}
          className="absolute left-6 top-[285px] flex h-[60px] w-[343px] items-center gap-2 rounded-[62px] bg-[#f3f3f3] px-4"
        >
          <CheckIcon checked={allChecked} />
          <span className="text-[18px] font-medium text-[#343434]">항목 모두 체크하기</span>
        </button>

        {/* 구분선 */}
        <div className="absolute left-6 top-[373px] h-px w-[342px] bg-[#e8e8e8]" />

        {/* 약관 항목 */}
        <div className="absolute left-6 top-[401px] flex flex-col w-[342px]">
          {TERMS.map((term, i) => (
            <button
              key={term.id}
              type="button"
              onClick={() => toggle(term.id)}
              className="flex h-12 items-center gap-[9px]"
              style={{ marginTop: i === 0 ? 0 : 0 }}
            >
              <CheckIcon checked={checked[term.id]} />
              <span className="flex-1 text-left text-[16px] text-[#343434]">{term.label}</span>
              <ChevronRight />
            </button>
          ))}
        </div>

        {/* 다음 버튼 */}
        <NextButton disabled={!allChecked} onClick={() => navigate('/')} />
      </div>
    </PageTransition>
  )
}
