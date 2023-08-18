import { AptosClient } from "aptos";

async function submitTransaction(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  fullnodeUrl: string,
  transaction: any,
) {
  console.log("Submitting transaction", JSON.stringify(transaction));
  const pendingTransaction = await signAndSubmitTransaction(transaction);
  const client = new AptosClient(fullnodeUrl);
  await client.waitForTransactionWithResult(pendingTransaction.hash, {
    checkSuccess: true,
  });
}

export async function create(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  description: string,
  name: string,
  width: number,
  height: number,
  perAccountTimeoutSecs: number,
  canDrawForSecs: number,
  cost: number,
  defaultColorRed: number,
  defaultColorGreen: number,
  defaultColorBlue: number,
  ownerIsSuperAdmin: boolean,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::create`,
    type_arguments: [],
    arguments: [
      description,
      name,
      width,
      height,
      perAccountTimeoutSecs,
      canDrawForSecs,
      cost,
      defaultColorRed,
      defaultColorGreen,
      defaultColorBlue,
      ownerIsSuperAdmin,
    ],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function draw(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  canvasAddress: string,
  xs: number[],
  ys: number[],
  reds: number[],
  greens: number[],
  blues: number[],
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::draw`,
    type_arguments: [],
    arguments: [canvasAddress, xs, ys, reds, greens, blues],
  };
  console.log(JSON.stringify(transaction));
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}

export async function drawOne(
  signAndSubmitTransaction: (txn: any) => Promise<any>,
  moduleId: string,
  fullnodeUrl: string,
  canvasAddress: string,
  x: number,
  y: number,
  red: number,
  green: number,
  blue: number,
) {
  const transaction = {
    type: "entry_function_payload",
    function: `${moduleId}::draw_one`,
    type_arguments: [],
    arguments: [canvasAddress, x, y, red, green, blue],
  };
  await submitTransaction(signAndSubmitTransaction, fullnodeUrl, transaction);
}
