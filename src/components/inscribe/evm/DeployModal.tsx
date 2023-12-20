import DeployForm from './DeployForm'
import Modal from 'antd/es/modal/Modal'
import { useEffect, useState } from 'react'

interface DeployModalProps {
  open?: boolean
  onClose?: () => void
}

export default function DeployModal({
  open = false,
  onClose
}: DeployModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(open)
  useEffect(() => {
    setIsModalOpen(open)
  }, [open])

  const handleOk = () => {
    setIsModalOpen(false)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const afterOpenChange = (open: boolean) => {
    if (!open && onClose) onClose()
  }

  return (
    <Modal
      //   width={368}
      centered
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      afterOpenChange={afterOpenChange}
      footer={''}
    >
      <DeployForm />
    </Modal>
  )
}
