import { useGlobalState } from "../../GlobalState";
import { MyCanvasLoader } from "./MyCanvasLoader";

export const HomePage = () => {
  const [state, _] = useGlobalState();
  const featuredCanvas = state.network_info.featured_canvases[0];

  return <MyCanvasLoader writeable={true} address={featuredCanvas} />;
};
