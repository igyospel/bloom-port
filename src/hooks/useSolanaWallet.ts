import { useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"

export function useSolanaWallet() {
  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  const connect = useCallback(() => {
    setVisible(true)
  }, [setVisible])

  const shortAddress =
    connected && publicKey
      ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
      : null

  return { connected, publicKey, shortAddress, connect, disconnect }
}
