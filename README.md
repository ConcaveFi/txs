![aaaaaa](https://user-images.githubusercontent.com/6232729/215295598-cdda474f-78bc-482f-8e92-4feab3169a69.png)

## Concave txs

A plug and play, customizable way to manage user transaction status on your dapp

- ✅ Out-of-the-box status notifications on top of @zag-js/toast (totally optional)
- 🎉 Easily customizable, or create your own with simple react hooks
- 🔥 Using `ethers` and `wagmi`
- ✨ Framework agnostic core at `@pcnv/txs-core`
- 📦 Tiny tiny, less than `3 kB gzipped`

### Install

```bash
pnpm add @pcnv/txs-react ethers wagmi @zag-js/react @zag-js/toast

# zag is not required if you want to create your own notification components
pnpm add @pcnv/txs-react ethers wagmi
```

### Usage

Check the [examples](https://github.com/ConcaveFi/txs/tree/main/examples) folder for a complete implementation

```jsx
import {
  createTransactionsStore,
  ToastsViewport,
  TransactionsStoreProvider,
} from '@pcnv/txs-react'

// import a builtin toast component or create your own
import { ClassicToast } from '@pcnv/txs-react/toasts/ClassicToast'
import '@pcnv/txs-react/toasts/ClassicToast/styles.css'

const transactionsStore = createTransactionsStore()

...

// Add the provider to your app
<WagmiConfig client={...}> 
  <TransactionsStoreProvider store={txsStore}> // make sure to make it a children of WagmiConfig 
    <ToastsViewport
      TransactionStatusComponent={ClassicToast}
      placement="top-end"
     />
    ...
```

And in your component

```ts
  import { usePrepareContractWrite, useContractWrite } from 'wagmi'
  import { useAddRecentTransaction } from '@pcnv/txs-react'

  ...

  const { config } = usePrepareContractWrite(...)
  const addTransaction = useAddRecentTransaction()
  const { write } = useContractWrite({
    ...config,
    onSuccess: (tx) => {
      // useContractWrite onSuccess means the transaciton was signed and sent
      addTransaction({
        hash: tx.hash,
        meta: {
          description: 'Your transaction description'
        },
      })
    },
  })
```

## Built in Components

Both detect `prefers-color-scheme` and style `light`/`dark` accordingly, you can force by passing a `colorScheme` prop, default is `system`

```js
import { EmojiToast } from '@pcnv/txs-react/toasts/EmojiToast'
import '@pcnv/txs-react/toasts/EmojiToast/styles.css'
```

![EmojiToast](https://user-images.githubusercontent.com/6232729/215291468-808a1834-93bd-479b-9c34-90d789ab87a3.png)

```js
import { ClassicToast } from '@pcnv/txs-react/toasts/ClassicToast'
import '@pcnv/txs-react/toasts/ClassicToast/styles.css'
```

![ClassicToast](https://user-images.githubusercontent.com/6232729/215294093-c0900895-4a0c-4b88-8e5a-0b70c15f5b99.png)

## Some Defaults

The following can be configured thru props on `ToastsViewport`

- `showPendingOnReopen`: should pop up the pending notification when the user closes and opens the app again while still pending? defaults to true
- `staleTime`: if the user closed the app without a status update, for how long it's still relevant to display the update on reopen
- `stuckTime`: transactions are considered stuck after 30min without a confirmation/rejection

## Meta field

The `meta` field accepts anything serializable really,
for example, instead of a single `description` you may want to have custom description for `pending`, `completed` and `failed`

Here's an example of how that could work

```jsx
type TransactionMeta = {
  [status in StoredTransaction['status']]: string
}

const MyCustomNotification = (props: TransactionStatusToastProps<TransactionMeta>) => {
  const tx = props.transaction
  return <EmojiToast {...props} description={tx.meta[tx.status]} />
}

// you can rexport the hooks passing your new type as a generic to type check on use
// just remember to import from this file, and not @pcnv/txs-react
export const useRecentTransactions = cnvTxs.useRecentTransactions<TransactionMeta>
export const useAddRecentTransaction = cnvTxs.useAddRecentTransaction<TransactionMeta>

...
<ToastsViewport TransactionStatusComponent={MyCustomNotification} />

...

// and in you component ts will enforce this usage
const { addTransaction } = useAddRecentTransaction()
...
addTransaction({
  hash: tx.hash,
  meta: {
    pending: '...',
    completed: '...',
    failed: '...',
   },
})


```

> **Note**
> Beware that everything included as `meta` will be saved to LocalStorage

#### Another example

This time only some properties are saved to localstorage based on the transaction type

```jsx
type TransactionType = { type: 'approve'; amount: string; token: string } // | { ...more types }

type TransactionMetaToStatusLabel = {
  [Meta in TransactionType as Meta['type']]: (
    meta: Omit<Meta, 'type'>,
  ) => Record<StoredTransaction['status'], string>
}

const typeToStatusDescription = {
  approve: ({ amount, token }) => ({
    pending: `Approving ${amount} ${token}`,
    confirmed: `Successfully approved ${amount} ${token}`,
    failed: `Failed to approve ${amount} ${token}`,
  }),
} satisfies TransactionMetaToStatusLabel

const MyCustomNotification = (props: TransactionStatusToastProps<TransactionType>) => {
  const { meta, status } = props.transaction
  const description = typeToStatusDescription[meta.type](meta)[status]
  return <EmojiToast {...props} description={description} />
}

...

// and the hook usage
const { addTransaction } = useAddRecentTransaction<TransactionType>()
...
addTransaction({
  hash: tx.hash,
  meta: {
    type: 'approve', // typescript can auto suggest all available types and their required properties
    amount: 1,
    token: 'CNV'
   },
})
```
