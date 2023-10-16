// Copyright © Max Kaplan
// SPDX-License-Identifier: IOWN-YRSOUL-3.2

import { PromisePool } from "@supercharge/promise-pool";
import { loadImageDiffBetweenOverlayAndCurrent } from "./image";
import {
  CANVAS_TOKEN_ADDRESS,
  CURRENT_IMAGE_PATH,
  LEFT_POS,
  LIMIT_PER_DRAW,
  MY_OWN_FAUCET_PRIVATE_KEY,
  NUM_DRAWERS,
  OVERLAY_IMAGE_PATH,
  TOP_POS,
} from "./const";
import { AccountPool, createAndFundAccount } from "./account";
import { RGBAXY } from "./canvas_type";
import { drawPoint } from "./draw";
import {
  getAptosAccount,
  getAptosClient,
  getCoinClient,
  getSequenceNumber,
} from "./util";
import { AptosAccount } from "aptos";

async function main() {
  const beginTime = new Date();
  console.log("begin to run draw script: ", beginTime);

  // =================== Calculate diff ===================

  // toDraw is the diff between overlay image and current image
  // Drawing it will place overlay image on top of current image
  let toDraw = await loadImageDiffBetweenOverlayAndCurrent(
    CURRENT_IMAGE_PATH,
    OVERLAY_IMAGE_PATH,
    { centerImage: false },
    LEFT_POS,
    TOP_POS
  );

  console.log(`toDraw pixels count: ${toDraw.length}`);
  if (toDraw.length === 0) {
    console.log("nothing to draw");
    return;
  }

  // =================== Fund drawer accounts ===================

  const accounts: AptosAccount[] = [];
  const coinClient = getCoinClient();
  const myFaucetAccount = getAptosAccount(MY_OWN_FAUCET_PRIVATE_KEY);
  let faucetSequenceNumber = await getSequenceNumber(myFaucetAccount);

  for (let i = 0; i < NUM_DRAWERS; i++) {
    const account = await createAndFundAccount(
      coinClient,
      myFaucetAccount,
      i,
      faucetSequenceNumber,
      true
    );
    faucetSequenceNumber = (
      BigInt(faucetSequenceNumber) + BigInt(1)
    ).toString();
    accounts.push(account);
  }
  const accountPool = new AccountPool(accounts);

  const finishedFundTime = new Date();
  console.log(
    `finished funding accounts: ${finishedFundTime}, time used: ${
      (finishedFundTime.getTime() - beginTime.getTime()) / 1000
    } seconds`
  );

  // =================== Start drawing ===================

  console.log("Drawing!");
  const outputEvery = 100;
  // convert toDraw to array of RGBAXY array
  let toDrawArr: RGBAXY[][] = [];
  for (let i = 0; i < toDraw.length; i += LIMIT_PER_DRAW) {
    let tmp: RGBAXY[] = [];
    for (let j = 0; j < LIMIT_PER_DRAW; j++) {
      tmp.push(toDraw[i + j]);
    }
    toDrawArr.push(tmp);
  }

  let drawn = 0;
  const aptosClient = getAptosClient();
  const { results, errors } = await PromisePool.for(toDrawArr)
    .withConcurrency(NUM_DRAWERS)
    .process(async (rgbaxyArr, index) => {
      await accountPool.withAccount(async (account) => {
        // random delay between 0 and 3 second
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 3000)
        );
        await drawPoint(aptosClient, account, CANVAS_TOKEN_ADDRESS, rgbaxyArr);
      });
      drawn += LIMIT_PER_DRAW;
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
