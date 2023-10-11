import { AptosAccount, AptosClient, CoinClient, HexString } from "aptos";
import {
  API_GATEWAY_URL,
  API_TOKEN,
  DRAWER_PRIVATE_KEYS,
  MY_OWN_FAUCET_ADDRESS,
  MY_OWN_FAUCET_PRIVATE_KEY,
} from "./const";

const CLIENT = new AptosClient(API_GATEWAY_URL, {
  HEADERS: {
    authorization: `Bearer ${API_TOKEN}`,
  },
});

const textEncoder = new TextEncoder();
// Encode the string to a Uint8Array
const myFaucetAccount = new AptosAccount(
  new HexString(MY_OWN_FAUCET_PRIVATE_KEY).toUint8Array(),
  MY_OWN_FAUCET_ADDRESS
);
const myFaucetAccountClient = new CoinClient(CLIENT);

export class AccountPool {
  private totalAccounts: number = 10;

  constructor(public accounts: AptosAccount[] = []) {
    this.totalAccounts = accounts.length;
  }

  async getAccount(): Promise<AptosAccount> {
    // if (this.accounts.length === 0) {
    //   this.accounts.push(await createAndFundAccount());
    //   this.totalAccounts += 1;
    //   console.log(
    //     "created new account",
    //     this.accounts.length,
    //     "/",
    //     this.totalAccounts
    //   );
    // }
    return this.accounts.pop()!;
  }

  returnAccount(account: AptosAccount) {
    this.accounts.push(account);
  }

  async withAccount<T>(fn: (account: AptosAccount) => Promise<T>): Promise<T> {
    const account = await this.getAccount();
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
  index: number,
  faucetSequenceNumber: string,
  fund: boolean = true,
): Promise<AptosAccount> => {
  console.log(`faucet sequence number: ${faucetSequenceNumber}`);
  // Encode the string to a Uint8Array
  const receiverAccount = new AptosAccount(
    textEncoder.encode(DRAWER_PRIVATE_KEYS[index])
  );

  const receiverAccountAddr = receiverAccount.address().hex();

  if (!fund) {
    console.log("funded account", receiverAccountAddr);
    return receiverAccount;
  }

  await myFaucetAccountClient
    // transfer 10 APT
    .transfer(myFaucetAccount, receiverAccountAddr, 1 * 1_000_000_000, {
      createReceiverIfMissing: true,
      providedSequenceNumber: faucetSequenceNumber,
    })
    .then((r) => console.log(r));

  console.log("funded account", receiverAccountAddr);

  await new Promise((resolve) => setTimeout(resolve, 3000));

  return receiverAccount;
};
