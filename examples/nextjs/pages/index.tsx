import { useModal } from 'connectkit'
import { ButtonHTMLAttributes } from 'react'
import { useAccount } from 'wagmi'
import { StoredTransaction, useAddTransaction, useTransactions } from '@concave/txs-react'
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

const statusToEmoji = {
  pending: '⏳',
  confirmed: '👍',
  failed: '😬',
} satisfies Record<StoredTransaction['status'], string>

const RecentTransactions = () => {
  const recentTransactions = useTransactions()

  if (recentTransactions.length === 0) return null

  return (
    <div className="fixed max-h-[300px] overflow-auto bottom-4 right-4 flex flex-col gap-1 rounded-xl border border-grey-800 bg-grey-900 px-3 py-2 shadow-xl min-w-[250px]">
      <h3 className="text-grey-300 font-sm font-bold">Recent Transactions</h3>
      {recentTransactions.map((tx) => {
        return (
          <span key={tx.hash} className="text-grey-500 font-xs font-medium">
            <span className="mr-2">{statusToEmoji[tx.status]}</span>
            {tx.meta.description}
          </span>
        )
      })}
    </div>
  )
}

const Home = () => {
  return (
    <div className="flex min-h-screen justify-center items-center flex-col dark:bg-grey-900 bg-grey-50 gap-4">
      <WrapEthButton />
      <RecentTransactions />
    </div>
  )
}

export default Home
