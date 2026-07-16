import mapImage from '../assets/map.png'

export type LiveLocationShareCardStatus = 'requested' | 'accepted'

type Props = {
  sender: 'me' | 'partner'
  status: LiveLocationShareCardStatus
  onAgree?: () => void
  onOpen?: () => void
}

export default function LiveLocationShareCard({
  sender,
  status,
  onAgree,
  onOpen,
}: Props) {
  const accepted = status === 'accepted'
  const needsAgreement = sender === 'partner' && !accepted

  return (
    <article
      className={`flex w-64 flex-col items-center gap-1 px-3 py-2 ${
        sender === 'me'
          ? 'rounded-2xl bg-[#1BB3FF]/20'
          : 'rounded-[10px] bg-[#F3F3F3]'
      }`}
    >
      <p className="text-sm leading-5 text-[#111]">실시간 위치 공유</p>

      <button
        type="button"
        disabled={!accepted}
        onClick={accepted ? onOpen : undefined}
        aria-label={accepted ? '실시간 위치 지도 열기' : undefined}
        className="relative h-[130px] w-[232px] overflow-hidden rounded-[5px] disabled:cursor-default"
      >
        <img src={mapImage} alt="" className="h-full w-full object-cover" />
        {needsAgreement && <span className="absolute inset-0 bg-black/40" />}
      </button>

      {(sender === 'me' || accepted) && (
        <p
          className={`w-[232px] text-right text-[10px] font-medium ${
            accepted ? 'text-[#FF9E1B]' : 'text-[#666]'
          }`}
        >
          {accepted ? '공유 중' : '요청 대기 중'}
        </p>
      )}

      {needsAgreement && (
        <button
          type="button"
          onClick={onAgree}
          className="flex h-8 w-20 items-center justify-center rounded-full bg-[#FF9E1B] text-base font-medium text-white"
        >
          동의
        </button>
      )}
    </article>
  )
}
