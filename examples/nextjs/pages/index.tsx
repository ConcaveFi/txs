import { useModal } from 'connectkit'
import { ButtonHTMLAttributes } from 'react'
import { useAccount } from 'wagmi'
import { StoredTransaction } from '@concave/txs-react'
import { useIsMounted } from 'hooks/useIsMounted'
import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import { parseEther } from 'ethers/lib/utils'
import {
  useAddRecentTransaction,
  useRecentTransactions,
} from 'providers/RecentTransactionsProvider'

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className="disabled:hover:scale-1 flex items-center gap-1.5 rounded bg-gradient-to-b from-blue-500 to-blue-600 px-4 py-1 font-bold text-white shadow ring-1 ring-grey-200/20 transition-all hover:scale-105 hover:shadow-blue-500/40 hover:ring-1 active:opacity-90 disabled:from-grey-500 disabled:to-grey-600 disabled:hover:shadow-none"
    />
  )
}

const goerliWeth = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6'
const amount = '0.0001'

const WrapEthButton = () => {
  const { address } = useAccount()

  const connectkit = useModal()
  const isMounted = useIsMounted()

  const { config } = usePrepareContractWrite({
    address: goerliWeth,
    abi: ['function deposit() public payable'],
    functionName: 'deposit',
    overrides: { value: parseEther(amount) },
  })
  const addTransaction = useAddRecentTransaction()
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
        meta: {
          pending: `Wrapping ${amount} ETH`,
          confirmed: `Successfully wrapped ${amount} ETH`,
          failed: `Failed to wrap ${amount} ETH`,
        },
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
  const recentTransactions = useRecentTransactions()

  if (recentTransactions.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 flex max-h-[300px] min-w-[250px] flex-col gap-1 overflow-auto rounded-xl bg-gradient-to-b from-grey-100 to-grey-200 px-3 py-2 shadow-lg shadow-black/5 dark:border-grey-800 dark:bg-grey-900 dark:from-grey-800 dark:to-grey-900">
      <h3 className="text-sm font-bold dark:text-grey-300">Recent Transactions</h3>
      {recentTransactions.map((tx) => {
        return (
          <span key={tx.hash} className="text-sm text-grey-500 dark:text-grey-400">
            <span className="mr-2">{statusToEmoji[tx.status]}</span>
            {tx.meta[tx.status]}
          </span>
        )
      })}
    </div>
  )
}

const Home = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-grey-50 dark:bg-grey-900">
      <WrapEthButton />
      <RecentTransactions />
    </div>
  )
}

export default Home
