import dotenv from "dotenv";
import { env } from "process";

dotenv.config();

export const CURRENT_IMAGE_PATH = "img/snapshot_2.png";
// Reset to snapshot image
// export const OVERLAY_IMAGE_PATH = "img/snapshot_bad.png";
// Place a pepe
export const OVERLAY_IMAGE_PATH = "img/pepe.png";

/*
There are 2 modes
    Mode 1: 
        reset current image to snapshot image, 
        in this case overlay image is the snapshot image 
        and it has the same size as current image
        so LEFT_POS and TOP_POS must set to 0
    Mode 2:
        overlay image is a small image, 
        and it is placed at the given place of current image
        so LEFT_POS and TOP_POS are set accordingly
        e.g. if you want to place it at 100, 150 then LEFT_POS = 100, TOP_POS = 150
*/
export const LEFT_POS = 0;
export const TOP_POS = 0;

export const LIMIT_PER_DRAW = 2500;

export const ONE_APT = 100_000_000;

export const API_TOKEN = env.API_TOKEN!;
export const API_GATEWAY_URL = "https://api.testnet.aptoslabs.com";

export const CANVAS_CONTRACT_ADDRESS = env.CANVAS_CONTRACT_ADDRESS!;
export const CANVAS_TOKEN_ADDRESS = env.CANVAS_TOKEN_ADDRESS!;

export const DRAWER_PRIVATE_KEYS = env.DRAWER_PRIVATE_KEYS!.split(",");
export const NUM_DRAWERS = DRAWER_PRIVATE_KEYS.length;

export const MY_OWN_FAUCET_PRIVATE_KEY = env.MY_OWN_FAUCET_PRIVATE_KEY!;

export const GAS_LIMIT = 1_000_000;
export const GAS_PRICE = 100;
