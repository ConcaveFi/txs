import { useModal } from 'connectkit'
import { ButtonHTMLAttributes, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAddTransaction } from '@concave/txs-react'
import { useIsMounted } from 'hooks/useIsMounted'
import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { parseEther } from 'ethers/lib/utils'

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className="rounded shadow hover:scale-105 disabled:hover:shadow-none disabled:hover:scale-1 hover:shadow-blue-500/40 disabled:from-grey-500 disabled:to-grey-600 active:opacity-90 transition-all hover:ring-1 ring-1 ring-grey-200/20 text-white bg-gradient-to-b from-blue-500 to-blue-600 font-bold px-4 py-1 flex gap-1.5 items-center"
    />
  )
}

const goerliWeth = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'

const WrapEthButton = () => {
  const { address } = useAccount()

  const connectkit = useModal()
  const isMounted = useIsMounted()

  const { config } = usePrepareContractWrite({
    address: goerliWeth,
    abi: ['function deposit() public payable'],
    functionName: 'deposit',
    overrides: {
      value: parseEther('0.0001'),
    },
  })
  const addTransaction = useAddTransaction()
  const {
    write: wrap,
    isLoading,
    isSuccess,
    reset,
  } = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      addTransaction({
        hash: tx.hash,
        meta: { description: 'Wrap 0.0001 ETH' },
      })
      setTimeout(() => reset(), 10 * 1000)
    },
  })

  if (!isMounted) return null

  if (!address) return <Button onClick={() => connectkit.setOpen(true)}>Connect Wallet</Button>

  if (isLoading) return <Button disabled>⏳ Confirm in your wallet</Button>

  if (isSuccess) return <Button disabled>🥳 Transaction Submitted</Button>

  return <Button onClick={() => wrap?.()}>Wrap ETH</Button>
}

const Home = () => {
  return (
    <div className="flex min-h-screen justify-center items-center flex-col dark:bg-grey-900 bg-grey-50">
      <WrapEthButton />
    </div>
  )
}

export default Home
