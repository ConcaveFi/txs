![transaciton notification toast](https://user-images.githubusercontent.com/6232729/214408094-630c3aec-a458-4ad0-a9a5-213784d43896.png)

## Concave txs 
The easiest way to manage user transactions on your dapp

- ✅ Out-of-the-box status notifications on top of @zag-js/toast
- 🎉 Easily customizable, or create your own with simple headless hooks
- ✨ Framework agnostic core at `@concave/txs-core`
- 📦 Tiny tiny, less than `3 kB gzipped`

### Install 

```bash
pnpm add @concave/txs-react ethers wagmi @zag-js/react @zag-js/toast

# zag is not required if you want to create your own notifications
pnpm add @concave/txs-react ethers wagmi
```

### Usage

Check the [examples](https://github.com/ConcaveFi/txs/tree/main/examples) folder for a complete implementation

```jsx
import { createTransactionsStore, TransactionsProvider } from '@concave/txs-react'
import { ClassicNotifications } from '@concave/txs-react/ClassicNotification' // More on built-in components below
import '@concave/txs-react/ClassicNotification/styles.css' // Import the notification component styles

const transactionsStore = createTransactionsStore({
  /* max completed transactions to keep in storage */
  maxCompletedTransactions: 25
  /* how many confirmations to consider the tx completed/failed  */
  minConfirmations: 1
  localStorageKey: 'transactions'
})

...

// Add the provider to your app
<TransactionsProvider store={transactionsStore}>
  // Add a notifications viewport
  <ClassicNotifications placement="top-right" showPendingOnReopen />
  ...
```




