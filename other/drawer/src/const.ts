import dotenv from "dotenv";
import { env } from "process";

dotenv.config();

export const LATEST_IMAGE_ATH = "img/latest.png";
export const SNAPSHOT_IMAGE_PATH = "img/snapshot_bad.png";

export const API_TOKEN = env.API_TOKEN!;
export const API_GATEWAY_URL = "https://api.testnet.aptoslabs.com";

export const CANVAS_CONTRACT_ADDRESS = env.CANVAS_CONTRACT_ADDRESS!;
export const CANVAS_TOKEN_ADDRESS = env.CANVAS_TOKEN_ADDRESS!;

export const DRAWER_PRIVATE_KEYS = [
  env.DRAWER_PRIVATE_KEY_1!,
  env.DRAWER_PRIVATE_KEY_2!,
  env.DRAWER_PRIVATE_KEY_3!,
  env.DRAWER_PRIVATE_KEY_4!,
  env.DRAWER_PRIVATE_KEY_5!,
  env.DRAWER_PRIVATE_KEY_6!,
  env.DRAWER_PRIVATE_KEY_7!,
  env.DRAWER_PRIVATE_KEY_8!,
  env.DRAWER_PRIVATE_KEY_9!,
  env.DRAWER_PRIVATE_KEY_10!,
];

export const DRAWER_ADDRESSES = [
  env.DRAWER_ADDRESS_1!,
  env.DRAWER_ADDRESS_2!,
  env.DRAWER_ADDRESS_3!,
  env.DRAWER_ADDRESS_4!,
  env.DRAWER_ADDRESS_5!,
  env.DRAWER_ADDRESS_6!,
  env.DRAWER_ADDRESS_7!,
  env.DRAWER_ADDRESS_8!,
  env.DRAWER_ADDRESS_9!,
  env.DRAWER_ADDRESS_10!,
];

export const MY_OWN_FAUCET_ADDRESS = env.MY_OWN_FAUCET_ADDRESS!;
export const MY_OWN_FAUCET_PRIVATE_KEY = env.MY_OWN_FAUCET_PRIVATE_KEY!;

export const GAS_LIMIT = 50000;
export const GAS_PRICE = 100;
