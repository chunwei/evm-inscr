'use client'

// Error components must be Client Components
import { useEffect } from 'react'

import { Button, Typography } from 'antd'

const { Title, Text } = Typography
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <Title level={2}>Something went wrong!</Title>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
      <br />
      <Text type="danger">{error.message}</Text>
    </div>
  )
}
