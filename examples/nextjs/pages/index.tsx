import { useModal } from 'connectkit'
import { ButtonHTMLAttributes } from 'react'
import { useAccount } from 'wagmi'
import { useAddTransaction } from '@concave/txs-react'
import { useIsMounted } from 'hooks/useIsMounted'
import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { parseEther } from 'ethers/lib/utils'

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className="rounded shadow hover:scale-105 hover:shadow-blue-500/40 active:opacity-90 transition-all hover:ring-1 ring-1 ring-grey-200/20 text-white bg-gradient-to-b from-blue-500 to-blue-600 font-bold px-4 py-1 flex gap-1.5 items-center"
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
  const { write: wrap } = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      addTransaction({ hash: tx.hash, meta: { description: 'Wrap 0.0001 ETH' } })
    },
  })

  if (!isMounted) return null

  if (!address) return <Button onClick={() => connectkit.setOpen(true)}>Connect Wallet</Button>

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
