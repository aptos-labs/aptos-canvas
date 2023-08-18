import React, { createContext, useContext, ReactNode, useState } from "react";

interface DrawModeContextType {
  drawModeOn: boolean;
  setDrawModeOn: React.Dispatch<React.SetStateAction<boolean>>;
  brushSize: number;
  setBrushSize: React.Dispatch<React.SetStateAction<number>>;
  brushColor: string;
  setBrushColor: React.Dispatch<React.SetStateAction<string>>;
}

const DrawModeContext = createContext<DrawModeContextType | undefined>(
  undefined,
);

export const BRUSH_COLORS = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#000000",
  "#FFFFFF",
];

export const BRUSH_SIZE = { min: 1, max: 8, default: 1 };

export const DrawModeProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [drawModeOn, setDrawModeOn] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(BRUSH_SIZE.default);
  const [brushColor, setBrushColor] = useState<string>(BRUSH_COLORS[0]);

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
