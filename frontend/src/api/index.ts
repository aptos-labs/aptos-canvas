import {
  AnsClient,
  AptosClient,
  CoinClient,
  Network,
  Provider,
  Types,
} from "aptos";
import { withResponseError } from "./client";
import { NetworkName } from "../constants";
import { PixelAttribution } from "../processor/generated/types";
import { getSdk } from "../processor/generated/queries";
import { GraphQLClient } from "graphql-request";
import { toLongWithoutZeroX } from "../utils";

export function getLedgerInfoWithoutResponseError(
  nodeUrl: string,
): Promise<Types.IndexResponse> {
  const client = new AptosClient(nodeUrl);
  return client.getLedgerInfo();
}

export function getAccountResources(
  requestParameters: { address: string; ledgerVersion?: number },
  nodeUrl: string,
): Promise<Types.MoveResource[]> {
  const client = new AptosClient(nodeUrl);
  const { address, ledgerVersion } = requestParameters;
  let ledgerVersionBig;
  if (ledgerVersion !== undefined) {
    ledgerVersionBig = BigInt(ledgerVersion);
  }
  return withResponseError(
    client.getAccountResources(address, { ledgerVersion: ledgerVersionBig }),
  );
}

export function getCoinBalance(
  requestParameters: { address: string; coinType?: string },
  nodeUrl: string,
): Promise<bigint> {
  const client = new AptosClient(nodeUrl);
  const coinClient = new CoinClient(client);
  const { address, coinType } = requestParameters;
  return withResponseError(coinClient.checkBalance(address, { coinType }));
}

export async function getAptBalance(
  requestParameters: { address: string },
  nodeUrl: string,
): Promise<number> {
  return Number(
    await getCoinBalance({ address: requestParameters.address }, nodeUrl),
  );
}

export async function getPntBalance(
  requestParameters: { address: string; pntMetadataAddress: string },
  nodeUrl: string,
): Promise<number> {
  return Number(
    await getCoinBalance(
      {
        address: requestParameters.address,
        coinType: requestParameters.pntMetadataAddress,
      },
      nodeUrl,
    ),
  );
}

function getAnsClient(network: NetworkName): AnsClient {
  // https://stackoverflow.com/a/42623905/3846032
  // This stopped working ^
  let providerNetwork;
  if (network === "testnet") {
    providerNetwork = Network.TESTNET;
  } else if (network === "mainnet") {
    providerNetwork = Network.MAINNET;
  } else {
    providerNetwork = Network.LOCAL;
  }
  const provider = new Provider(providerNetwork);
  const ansClient = new AnsClient(provider);
  return ansClient;
}

export async function getAnsName(
  address: string,
  network: NetworkName,
): Promise<string | null> {
  const ansClient = getAnsClient(network);
  return await ansClient.getPrimaryNameByAddress(address);
}

export async function getAnsAddress(
  name: string,
  network: NetworkName,
): Promise<string | null> {
  const ansClient = getAnsClient(network);
  return await ansClient.getAddressByName(name);
}

export type PixelAttributionInner = {
  artistAddress: string;
  drawnAtSecs: number;
};

/**
 * Get the attribution information for a pixel.
 *
 * @param canvasAddress The address of the canvas.
 * @param index The index of the pixel we want to check attribution for.
 * @param indexerUrl The URL of the indexer.
 *
 * @returns The artist address and the time the pixel was drawn if there is attribution
 * information, null otherwise.
 */
export async function getPixelAttribution(
  canvasAddress: string,
  index: number,
  gqlUrl: string,
): Promise<PixelAttributionInner | null> {
  const client = new GraphQLClient(gqlUrl);
  const sdk = getSdk(client);
  let out = await sdk.getPixelAttribution({
    canvasAddress: toLongWithoutZeroX(canvasAddress),
    index,
  });
  if (out.pixelAttribution.nodes.length === 0) {
    return null;
  }
  return {
    artistAddress: out.pixelAttribution.nodes[0].artistAddress,
    drawnAtSecs: out.pixelAttribution.nodes[0].drawnAtSecs,
  };
}
