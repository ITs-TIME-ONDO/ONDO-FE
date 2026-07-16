import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import arrow from '../../assets/arrow.png'
import openArrow from '../../assets/open_arrow.png'
import { apiFetch } from '../../api/client'

type Purpose = '사진 찍기' | '합석' | '기타'
type Gender = '남성' | '여성' | '상관없음'

const categoryMap: Record<Purpose, string> = {
  '사진 찍기': 'PHOTO',
  합석: 'MEAL',
  기타: 'OTHER',
}


const getCardFromResponse = (response: any): any | null => {
  const card = response?.data?.card ?? response?.data ?? response?.card ?? response

  return card?.id ? card : null
}
const genderMap: Record<Gender, string> = {
  남성: 'MALE',
  여성: 'FEMALE',
  상관없음: 'ANY',
}

export default function RequestPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [purpose, setPurpose] = useState<Purpose | ''>('')
  const [gender, setGender] = useState<Gender | ''>('')
  const [ageRange, setAgeRange] = useState<[number, number]>([0, 100])
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasActiveRequest, setHasActiveRequest] = useState(false)

  const navigate = useNavigate()

  const isAllAge = ageRange[0] === 0 && ageRange[1] === 100
  const isValid =
    !hasActiveRequest && purpose && gender && description.trim().length > 0

  useEffect(() => {
    const checkActiveRequest = async () => {
      try {
        const res = await apiFetch<any>('/api/cards/my/active')
        const card = getCardFromResponse(res)
        const accessToken = localStorage.getItem('accessToken')

        if (card?.id) {
          setHasActiveRequest(true)

          if (accessToken) {
            localStorage.setItem(
              'myRequest',
              JSON.stringify({ accessToken, card })
            )
          }

          navigate('/')
        }
      } catch {}
    }

    checkActiveRequest()
  }, [navigate])

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })
  }

  const handleSubmit = async () => {
    if (!isValid || isSubmitting || hasActiveRequest) return

    try {
      setIsSubmitting(true)

      const position = await getCurrentPosition()

      const createdRes = await apiFetch<any>('/api/cards', {
        method: 'POST',
        body: JSON.stringify({
          category: categoryMap[purpose],
          description: description.trim(),
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          preferredGender: genderMap[gender],
          preferredAgeMin: ageRange[0],
          preferredAgeMax: ageRange[1],
        }),
      })

      const createdCard = getCardFromResponse(createdRes)

      const accessToken = localStorage.getItem('accessToken')

      if (createdCard?.id && accessToken) {
        localStorage.setItem(
          'myRequest',
          JSON.stringify({ accessToken, card: createdCard })
        )
      }
      navigate('/')
    } catch {} finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-white font-['Pretendard']">
      <header className="relative h-[104px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-6 top-[50px]"
        >
          <img src={arrow} alt="뒤로가기" className="h-5 w-5 object-contain" />
        </button>

        <h1 className="absolute left-1/2 top-[50px] -translate-x-1/2 text-xl font-medium text-black">
          요청 하기
        </h1>
      </header>

      <main className="px-6">
        <section className="relative">
          <p className="ml-5 text-base font-medium text-black">목적</p>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className={`mt-[10px] flex h-12 w-full items-center justify-between border border-[#D3D3D3] bg-white px-5 text-base ${
              isOpen ? 'rounded-t-[24px]' : 'rounded-full'
            }`}
          >
            <span className={purpose ? 'text-[#333333]' : 'text-[#A6A6A6]'}>
              {purpose || '목적 선택'}
            </span>

            <img
              src={openArrow}
              alt=""
              className={`w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-[81px] z-20 w-full overflow-hidden rounded-b-[20px] border-x border-b border-[#D3D3D3] bg-white">
              {(['사진 찍기', '합석', '기타'] as Purpose[])
                .filter((item) => item !== purpose)
                .map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setPurpose(item)
                      setIsOpen(false)
                    }}
                    className="flex h-12 w-full items-center px-5 text-base text-[#333333]"
                  >
                    {item}
                  </button>
                ))}
            </div>
          )}
        </section>

        <section className="mt-[37px]">
          <p className="ml-5 text-base font-medium text-black">성별</p>

          <div className="mt-[10px] grid grid-cols-3 gap-2">
            {(['남성', '여성', '상관없음'] as Gender[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setGender(item)}
                className={`h-12 whitespace-nowrap rounded-full text-[15px] font-medium ${
                  gender === item
                    ? 'bg-[#FF9814] font-semibold text-white'
                    : 'border border-[#D3D3D3] text-[#333333]'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-[37px]">
          <div className="flex items-center justify-between px-5">
            <div className="flex items-center gap-3">
              <p className="text-base font-medium text-black">나이</p>
              <p className="text-xs text-[#FF9814]">
                {isAllAge ? '모든 나이' : `${ageRange[0]}살 ~ ${ageRange[1]}살`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAgeRange([0, 100])}
              className="text-xs text-[#8C8C8C]"
            >
              초기화
            </button>
          </div>

          <div className="mt-[26px] px-5">
            <div className="relative h-5">
              <div className="absolute top-[8px] h-[5px] w-full rounded-full bg-[#D9D9D9]" />

              <div
                className="absolute top-[8px] h-[5px] rounded-full bg-[#FF9814]"
                style={{
                  left: `${ageRange[0]}%`,
                  width: `${ageRange[1] - ageRange[0]}%`,
                }}
              />

              <input
                type="range"
                min={0}
                max={100}
                value={ageRange[0]}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value <= ageRange[1]) {
                    setAgeRange([value, ageRange[1]])
                  }
                }}
                className="slider absolute left-0 top-0 w-full"
              />

              <input
                type="range"
                min={0}
                max={100}
                value={ageRange[1]}
                onChange={(e) => {
                  const value = Number(e.target.value)
                  if (value >= ageRange[0]) {
                    setAgeRange([ageRange[0], value])
                  }
                }}
                className="slider absolute left-0 top-0 w-full"
              />
            </div>
          </div>

          <div className="mt-1 flex justify-between px-5 text-xs leading-6 text-[#333333]">
            <span>0살</span>
            <span>50살</span>
            <span>100살</span>
          </div>
        </section>

        <section className="mt-[31px]">
          <p className="ml-5 text-base font-medium text-black">간단 설명</p>

          <div className="relative mt-[10px] h-28 rounded-[20px] bg-[#F3F3F3]">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              placeholder="요청 내용을 자유롭게 작성해주세요."
              className="h-full w-full resize-none rounded-[20px] bg-transparent px-5 py-4 pb-9 text-base leading-5 text-[#333333] placeholder:text-[#A6A6A6] focus:outline-none"
            />

            <p className="absolute bottom-3 right-5 text-sm text-[#8C8C8C]">
              {description.length}/100
            </p>
          </div>
        </section>
      </main>

      <button
        type="button"
        disabled={!isValid || isSubmitting || hasActiveRequest}
        onClick={handleSubmit}
        className={`absolute bottom-16 left-6 h-[60px] w-[342px] rounded-full text-xl font-bold text-white ${
          isValid && !isSubmitting && !hasActiveRequest
            ? 'bg-[#FF9814]'
            : 'bg-[#FFC878] cursor-not-allowed'
        }`}
      >
        {isSubmitting ? '생성 중...' : '다음'}
      </button>
    </div>
  )
}
