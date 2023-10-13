import { AptosAccount, AptosClient, BCS } from "aptos";
import {
  AccountAddress,
  ChainId,
  EntryFunction,
  RGBAXY,
  RawTransaction,
  TransactionPayloadEntryFunction,
} from "./canvas_type";
import { CANVAS_CONTRACT_ADDRESS, GAS_LIMIT, GAS_PRICE } from "./const";
import { serializeVectorU64, serializeVectorU8 } from "./util";

export const drawPoint = async (
  aptosClient: AptosClient,
  account: AptosAccount,
  tokenAddress: string,
  rgbaxyArr: RGBAXY[]
) => {
  rgbaxyArr = rgbaxyArr.filter((rgbaxy) => rgbaxy != undefined);

  const entryFunctionPayload = new TransactionPayloadEntryFunction(
    EntryFunction.natural(
      `${CANVAS_CONTRACT_ADDRESS}::canvas_token`,
      "draw",
      [],
      [
        BCS.bcsToBytes(AccountAddress.fromHex(tokenAddress)),
        serializeVectorU64(rgbaxyArr.map((rgbaxy) => rgbaxy.x)),
        serializeVectorU64(rgbaxyArr.map((rgbaxy) => rgbaxy.y)),
        serializeVectorU8(rgbaxyArr.map((rgbaxy) => rgbaxy.r)),
        serializeVectorU8(rgbaxyArr.map((rgbaxy) => rgbaxy.g)),
        serializeVectorU8(rgbaxyArr.map((rgbaxy) => rgbaxy.b)),
      ]
    )
  );

  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    aptosClient.getAccount(account.address()),
    aptosClient.getChainId(),
  ]);

  const rawTxn = new RawTransaction(
    // Transaction sender account address
    AccountAddress.fromHex(account.address()),
    BigInt(sequenceNumber),
    entryFunctionPayload,
    // Max gas unit to spend
    BigInt(GAS_LIMIT),
    // Gas price per unit
    BigInt(GAS_PRICE),
    // Expiration timestamp. Transaction is discarded if it is not executed within 10 seconds from now.
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new ChainId(chainId)
  );

  // Sign the raw transaction with account1's private key
  const bcsTxn = AptosClient.generateBCSTransaction(account, rawTxn);

  const transactionRes = await aptosClient.submitSignedBCSTransaction(bcsTxn);
  await aptosClient.waitForTransaction(transactionRes.hash, {
    checkSuccess: true,
  });
  console.log(
    "put dot:",
    `${tokenAddress.slice(0, 5)}...`,
    // rgbaxyArr,
    // [rgbaxy.x, rgbaxy.y],
    // [rgbaxy.r, rgbaxy.g, rgbaxy.b, rgbaxy.a],
    transactionRes.hash
  );
};
