import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageTransition from '../../components/PageTransition'
import { postKakaoCallback } from '../../api/auth'
import { ApiError } from '../../api/client'
import { saveTokens } from '../../utils/authStorage'

export default function KakaoCallbackPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const requested = useRef(false)

  const getKakaoParams = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    const hashQuery = hash.includes('?')
      ? hash.slice(hash.indexOf('?') + 1)
      : ''
    const hashParams = new URLSearchParams(hashQuery)

    return {
      code: searchParams.get('code') ?? hashParams.get('code'),
      state: searchParams.get('state') ?? hashParams.get('state'),
    }
  }

  useEffect(() => {
    if (requested.current) return
    requested.current = true

    const { code, state } = getKakaoParams()

    if (!code || !state) {
      setError('카카오 로그인 정보를 확인할 수 없습니다.')
      return
    }

    postKakaoCallback({ code, state })
      .then((res) => {
        saveTokens(res)
        if (res.isNewUser) {
          navigate('/profile', { replace: true })
        } else {
          localStorage.setItem('onboardingCompleted', 'true')
          navigate('/', { replace: true })
        }
      })
      .catch((err) => {
        const message =
          err instanceof ApiError
            ? err.status === 401
              ? '인가 정보가 만료되었거나 일치하지 않습니다. 로그인 버튼부터 다시 시도해 주세요.'
              : err.message
            : '로그인 중 오류가 발생했습니다.'
        setError(message)
      })
  }, [navigate])

  return (
    <PageTransition>
      <div className="relative flex h-[844px] w-[390px] flex-col items-center justify-center gap-4 overflow-hidden bg-white px-6 text-center">
        {error ? (
          <>
            <p className="text-[16px] text-[#343434]">{error}</p>
            <button
              type="button"
              className="rounded-full bg-[#ff9e1b] px-6 py-3 text-[14px] font-bold text-white"
              onClick={() => navigate('/login', { replace: true })}
            >
              로그인으로 돌아가기
            </button>
          </>
        ) : (
          <p className="text-[16px] text-[#343434]">로그인 처리 중입니다...</p>
        )}
      </div>
    </PageTransition>
  )
}
