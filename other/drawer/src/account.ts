import { AptosAccount, CoinClient } from "aptos";
import { DRAWER_PRIVATE_KEYS, ONE_APT } from "./const";
import { getAptosAccount } from "./util";

export class AccountPool {
  constructor(public accounts: AptosAccount[] = []) {}

  getAccount(): AptosAccount {
    return this.accounts.pop()!;
  }

  returnAccount(account: AptosAccount) {
    this.accounts.push(account);
  }

  async withAccount<T>(fn: (account: AptosAccount) => Promise<T>): Promise<T> {
    const account = this.getAccount();
    let result;
    try {
      result = await fn(account);
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      this.returnAccount(account);
    }
    return result;
  }
}

export const createAndFundAccount = async (
  coinClient: CoinClient,
  myFaucetAccount: AptosAccount,
  index: number,
  faucetSequenceNumber: string,
  skipFunding: boolean = false
): Promise<AptosAccount> => {
  const receiverAccount = getAptosAccount(DRAWER_PRIVATE_KEYS[index]);
  if (skipFunding) {
    return receiverAccount;
  }

  const receiverAccountAddr = receiverAccount.address().hex();
  await coinClient
    .transfer(myFaucetAccount, receiverAccountAddr, 10 * ONE_APT, {
      createReceiverIfMissing: true,
      providedSequenceNumber: faucetSequenceNumber,
    })
    .then((txHash) =>
      console.log(
        `funded account ${index}, address: ${receiverAccountAddr}, tx hash: ${txHash})`
      )
    );
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return receiverAccount;
};
