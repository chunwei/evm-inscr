import { useCallback, useEffect, useState } from 'react'

interface Props {
  endTime: number
  endTimeCallback?: () => void
}

const Countdown: React.FC<Props> = ({ endTime, endTimeCallback }) => {
  const [timeLeft, setTimeLeft] = useState('')

  const calculateTimeLeft = useCallback(() => {
    const timeDiff = Math.max(endTime - Date.now(), 0)
    const minutes = Math.floor((timeDiff / 60000) % 60)
    const seconds = Math.floor((timeDiff / 1000) % 60)

    setTimeLeft(
      `${Math.floor(timeDiff / 3600000)}:${minutes < 10 ? '0' + minutes : minutes}:${
        seconds < 10 ? '0' + seconds : seconds
      }`
    )

    return timeDiff
  }, [endTime])

  useEffect(() => {
    let timer: any = null

    calculateTimeLeft()

    timer = setInterval(() => {
      const timeDiff = calculateTimeLeft()

      if (timeDiff <= 0) {
        clearInterval(timer)
        endTimeCallback && endTimeCallback()
      }
    }, 1000)

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [calculateTimeLeft, endTime, endTimeCallback])

  return <span>{timeLeft}</span>
}

export default Countdown
