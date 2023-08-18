const BOTTOM_OFFSET = 40;

export default function BottomComponentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: BOTTOM_OFFSET,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%", // you can adjust or remove this depending on your needs
      }}
    >
      {children}
    </div>
  );
}
