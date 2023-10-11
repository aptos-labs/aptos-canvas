// Copyright © Max Kaplan
// SPDX-License-Identifier: IOWN-YRSOUL-3.2

import { PromisePool } from "@supercharge/promise-pool";
import { loadImageDiffBetweenSnapshotAndLatest } from "./image";
import {
  API_GATEWAY_URL,
  API_TOKEN,
  CANVAS_TOKEN_ADDRESS,
  LATEST_IMAGE_ATH,
  MY_OWN_FAUCET_ADDRESS,
  MY_OWN_FAUCET_PRIVATE_KEY,
  SNAPSHOT_IMAGE_PATH,
} from "./const";
import { shuffleArray } from "./util";
import { AccountPool, createAndFundAccount } from "./account";
import { RGBAXY } from "./canvas_type";
import { drawPoint } from "./draw";
import { AptosAccount, AptosClient, HexString } from "aptos";

async function main() {
  const beginTime = new Date();
  console.log("begin to run draw script: ", beginTime);

  // Config
  const outputEvery = 100;
  const centerImage = false;

  // toDraw will reset latest back to snapshot by only drawing the diff part
  let { toDraw, width, height, previewPath } = await loadImageDiffBetweenSnapshotAndLatest(
    LATEST_IMAGE_ATH,
    SNAPSHOT_IMAGE_PATH,
    { centerImage }
  );

  // Shuffle to make it fun
  shuffleArray(toDraw);
  toDraw = toDraw.filter((rgbaxy) => rgbaxy !== undefined);
  console.log(`toDraw length: ${toDraw.length}`);

  console.log("Drawing!");

  const numAccounts = 10;

  // Make some accounts
  const accounts = [];

  const CLIENT = new AptosClient(API_GATEWAY_URL, {
    HEADERS: {
      authorization: `Bearer ${API_TOKEN}`,
    },
  });

  const myFaucetAccount = new AptosAccount(
    new HexString(MY_OWN_FAUCET_PRIVATE_KEY).toUint8Array(),
    MY_OWN_FAUCET_ADDRESS
  );
  let { sequence_number: faucetSequenceNumber } = await CLIENT.getAccount(
    myFaucetAccount.address()
  );

  for (let i = 0; i < numAccounts; i++) {
    const account = await createAndFundAccount(i, faucetSequenceNumber, false);
    faucetSequenceNumber = (
      BigInt(faucetSequenceNumber) + BigInt(1)
    ).toString();

    accounts.push(account);
  }
  const accountPool = new AccountPool(accounts);

  const finishedFundTime = new Date();
  console.log(
    `finished to fund accounts: ${finishedFundTime}, time used: ${
      (finishedFundTime.getTime() - beginTime.getTime()) / 1000
    } seconds`
  );

  const limitPerDraw = 500;

  // convert toDraw to array of RGBAXY array
  let toDrawArr: RGBAXY[][] = [];
  for (let i = 0; i < toDraw.length; i += limitPerDraw) {
    let tmp = [];
    for (let j = 0; j < limitPerDraw; j++) {
      tmp.push(toDraw[i + j]);
    }
    toDrawArr.push(tmp);
  }

  let drawn = 0;
  const { results, errors } = await PromisePool.for(toDrawArr)
    .withConcurrency(numAccounts)
    .process(async (rgbaxyArr, index) => {
      await accountPool.withAccount(async (account) => {
        // random delay between 0 and 6 second
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 6000)
        );
        await drawPoint(account, CANVAS_TOKEN_ADDRESS, rgbaxyArr);
      });
      drawn += limitPerDraw;
      if (drawn % outputEvery == 0)
        console.log(
          `\ndrawn ${drawn} / ${toDraw.length} pixels (${(
            (drawn / toDraw.length) *
            100
          ).toFixed(2)}%)\n`
        );
    });

  const finishedDrawTime = new Date();
  console.log(
    `finished to draw: ${finishedDrawTime}, time used: ${
      (finishedDrawTime.getTime() - finishedFundTime.getTime()) / 1000
    } seconds`
  );
}

main().then(() => console.log("done"));
