import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'w3m-button': React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >
      // Add other custom elements as needed
    }
  }
}

export default function ConnectButton() {
  return <w3m-button />
}
