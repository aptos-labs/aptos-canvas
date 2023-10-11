import axios from "axios";
import { RGBA, RGBAXY } from "./canvas_type";
import { convertExistingPixelsTo2DArray } from "./util";

import Jimp from "jimp";

type LoadImageOptions = {
  scaleTo?: { width: number; height: number };
  centerImage?: boolean;
};

export const imageFromRGBAArray = (
  rgbaArray: RGBA[][],
  width: number,
  height: number
) => {
  const image = new Jimp(width, height, 0x00000000);

  image.scan(
    0,
    0,
    image.bitmap.width,
    image.bitmap.height,
    (x: number, y: number, idx: number) => {
      const pixel = rgbaArray[y][x];
      // Set the color and alpha values for each pixel in the image
      image.bitmap.data[idx + 0] = pixel.r; // R
      image.bitmap.data[idx + 1] = pixel.g; // G
      image.bitmap.data[idx + 2] = pixel.b; // B
      image.bitmap.data[idx + 3] = pixel.a; // Alpha (0 to 255)
    }
  );

  return image;
};

// Get the current pixels
export const getExistingPixels = async (tokenAddress: string) => {
  const res = await axios.get(
    `https://fullnode.testnet.aptoslabs.com/v1/accounts/${tokenAddress}/resources?limit=9999`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        Referer: "https://canvas.dport.me/",
      },
      method: "GET",
    }
  );

  const body = await res.data;

  // @ts-ignore
  const allCanvas = body.filter((r: any) =>
    (r.type as string).includes("canvas_token::Canvas")
  );
  console.log(`there are ${allCanvas.length} canvas`);
  const dataItem = allCanvas[0];
  const pixels: { r: number; g: number; b: number }[] = dataItem.data.pixels;

  const canvasWidth = parseInt(dataItem.data.config.width);
  const canvasHeight = parseInt(dataItem.data.config.height);
  const existingPixels = convertExistingPixelsTo2DArray(
    pixels,
    canvasWidth,
    canvasHeight
  );
  const canvasImage = imageFromRGBAArray(
    existingPixels,
    canvasWidth,
    canvasHeight
  );
  return { existingPixels, canvasWidth, canvasHeight, canvasImage };
};

export const loadImageDiffBetweenSnapshotAndLatest = async (
  snapshotImagePath: string,
  latestImgPath: string,
  opt: LoadImageOptions = {}
) => {
  const snapshotImage = await Jimp.read(snapshotImagePath);
  const latestImage = await Jimp.read(latestImgPath);

  let width = snapshotImage.getWidth();
  let height = snapshotImage.getHeight();

  const scaleToWidth = opt.scaleTo?.width || latestImage.getWidth();
  const scaleToHeight = opt.scaleTo?.height || latestImage.getHeight();

  if (scaleToWidth < width || scaleToHeight < height) {
    latestImage.scaleToFit(
      opt.scaleTo?.width || snapshotImage.getWidth(),
      opt.scaleTo?.height || snapshotImage.getHeight()
    );
    console.log(
      `Loaded image ${latestImgPath} with dimensions ${width}x${height} and scaled to ${latestImage.getWidth()}x${latestImage.getHeight()}`
    );
    width = latestImage.getWidth();
    height = latestImage.getHeight();
  }

  let leftPos = 0;
  let topPos = 0;

  if (opt.centerImage) {
    leftPos = Math.floor((snapshotImage.getWidth() - width) / 2);
    topPos = Math.floor((snapshotImage.getHeight() - height) / 2);
  }

  const newImage = snapshotImage
    .clone()
    .composite(latestImage, leftPos, topPos);

  const previewImage = snapshotImage.clone();

  const toDraw: RGBAXY[] = [];

  for (let x = 0; x < snapshotImage.getWidth(); x++) {
    for (let y = 0; y < snapshotImage.getHeight(); y++) {
      const canvasColor = snapshotImage.getPixelColor(x, y);
      const canvasRgba = Jimp.intToRGBA(canvasColor);

      const color = newImage.getPixelColor(x, y);
      const rgba = Jimp.intToRGBA(color);

      // filter out unchanged pixels
      if (
        rgba.r != canvasRgba.r ||
        rgba.g != canvasRgba.g ||
        rgba.b != canvasRgba.b ||
        rgba.a != canvasRgba.a
      ) {
        previewImage.setPixelColor(color, x, y);
        toDraw.push({ ...rgba, x, y });
      }
    }
  }

  console.log(
    "Filtered existing pixels from",
    newImage.bitmap.width * newImage.bitmap.height,
    "to",
    toDraw.length
  );

  // write the image to a file
  const previewPath = "../temp/canvas_preview.png";
  await previewImage.writeAsync(previewPath);

  return { toDraw, width, height, previewPath };
};
