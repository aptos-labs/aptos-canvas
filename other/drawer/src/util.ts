import { BCS } from "aptos";
import { RGB, RGBA, RGBAXY } from "./canvas_type";

export const shuffleArray = (array: RGBAXY[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

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

export const convertExistingPixelsTo2DArray = (
  pixels: RGB[],
  width: number,
  height: number
): RGBA[][] => {
  const dataArray = [];

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      const pixel = pixels[y * width + x];
      row.push({ ...pixel, a: 255 });
    }
    dataArray.push(row);
  }

  return dataArray;
};
