import React, { createContext, useContext, ReactNode, useState } from "react";

interface DrawModeContextType {
  drawModeOn: boolean;
  setDrawModeOn: React.Dispatch<React.SetStateAction<boolean>>;
  brushSize: number;
  setBrushSize: React.Dispatch<React.SetStateAction<number>>;
  brushColor: Color;
  setBrushColor: React.Dispatch<React.SetStateAction<Color>>;
}

const DrawModeContext = createContext<DrawModeContextType | undefined>(
  undefined,
);

export type Color = {
  r: number;
  g: number;
  b: number;
};

export const BRUSH_COLORS = [
  { r: 0, g: 0, b: 0 }, // #000000
  { r: 255, g: 255, b: 255 }, // #FFFFFF
  { r: 0, g: 158, b: 253 }, // #009EFD
  { r: 0, g: 197, b: 3 }, // #00C503
  { r: 255, g: 198, b: 0 }, // #FFC600
  { r: 255, g: 125, b: 0 }, // #FF7D00
  { r: 250, g: 0, b: 106 }, // #FA006A
  { r: 196, g: 0, b: 199 }, // #C400C7
];

export const BRUSH_SIZE = { min: 1, max: 8, default: 1 };

export const DrawModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [drawModeOn, setDrawModeOn] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(BRUSH_SIZE.default);
  const [brushColor, setBrushColor] = useState<Color>(BRUSH_COLORS[0]);

  return (
    <DrawModeContext.Provider
      value={{
        drawModeOn,
        setDrawModeOn,
        brushSize,
        setBrushSize,
        brushColor,
        setBrushColor,
      }}
    >
      {children}
    </DrawModeContext.Provider>
  );
};

export const useDrawMode = () => {
  const context = useContext(DrawModeContext);
  if (!context) {
    throw new Error("useDrawMode must be used within a DrawModeProvider");
  }
  return context;
};
