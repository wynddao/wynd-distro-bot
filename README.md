# Wynd Distribution Bot

This is meant to be called hourly by anyone to ensure pending rewards are paid out to
the WYND Stakers.

To run, you need the mneomonic of an account that holds a small amount of JUNO to pay for gas.

```
export MNEMONIC="YOUR-SECRET-HERE"
npm run ping
```

It prints out a message if it is not yet time, otherwise tries to trigger a payout.

