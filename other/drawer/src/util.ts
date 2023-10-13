import { AptosAccount, AptosClient, BCS, CoinClient, HexString } from "aptos";
import { API_GATEWAY_URL, API_TOKEN } from "./const";

export const serializeVectorU64 = (arr: Array<number>) => {
  const serializer = new BCS.Serializer();
  serializer.serializeU32AsUleb128(arr.length);
  arr.forEach((arg) => serializer.serializeU64(arg));
  return serializer.getBytes();
};

export const serializeVectorU8 = (arr: Array<number>) => {
  const serializer = new BCS.Serializer();
  serializer.serializeU32AsUleb128(arr.length);
  arr.forEach((arg) => serializer.serializeU8(arg));
  return serializer.getBytes();
};

export const getAptosClient = () => {
  return new AptosClient(API_GATEWAY_URL, {
    HEADERS: {
      authorization: `Bearer ${API_TOKEN}`,
    },
  });
};

export const getAptosAccount = (privateKey: string) => {
  return new AptosAccount(new HexString(privateKey).toUint8Array());
};

export const getCoinClient = () => {
  return new CoinClient(getAptosClient());
};

export const getSequenceNumber = async (account: AptosAccount) => {
  const { sequence_number: sequenceNumber } = await getAptosClient().getAccount(
    account.address()
  );
  return sequenceNumber;
};
