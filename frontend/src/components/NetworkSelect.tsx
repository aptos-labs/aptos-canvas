import { useEffect } from "react";
import { Select, Box } from "@chakra-ui/react";
import { defaultFeatureName, NetworkName, networkInfo } from "../constants";
import { useGlobalState } from "../GlobalState";
import { useSearchParams } from "react-router-dom";
import { useGetChainId } from "../api/hooks/useGetNetworkChainIds";
import { toTitleCase } from "../utils";

function capitalizeFirstLetter(str: string) {
  if (!str || typeof str !== "string") {
    return "";
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function NetworkAndChainIdCached({
  networkName,
  chainId,
}: {
  networkName: string;
  chainId: string | null;
}) {
  return <>{chainId ? `${chainId}: ${toTitleCase(networkName)}` : "---"}</>;
}

function NetworkAndChainId({ networkName }: { networkName: string }) {
  const chainId = useGetChainId(networkName as NetworkName);

  const out = chainId ? (
    <NetworkAndChainIdCached networkName={networkName} chainId={chainId} />
  ) : null;
  return out;
}

export default function NetworkSelect() {
  const [state, dispatch] = useGlobalState();
  const [searchParams, setSearchParams] = useSearchParams();

  function maybeSetNetwork(networkNameString: string | null) {
    if (!networkNameString || state.network_name === networkNameString) return;
    if (!(networkNameString in networkInfo)) return;
    const feature_name = state.feature_name;
    const network_name = networkNameString as NetworkName;
    const network_info = networkInfo[network_name];
    const network_value = network_info.node_api_url;
    if (network_value) {
      // Only show the "feature" param in the url when it's not "prod",
      // we don't want the users to know the existence of the "feature" param
      if (feature_name !== defaultFeatureName) {
        setSearchParams((prev) => {
          return { ...prev, network: network_name, feature: feature_name };
        });
      } else {
        setSearchParams((prev) => {
          return { ...prev, network: network_name };
        });
      }
      dispatch({ network_name, network_info, feature_name });
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const network_name = event.target.value;
    maybeSetNetwork(network_name);
  };

  useEffect(() => {
    const network_name = searchParams.get("network");
    maybeSetNetwork(network_name);
  });

  let options = [];
  for (const networkName in networkInfo) {
    const item = NetworkAndChainId({ networkName: networkName });
    if (item === null) {
      continue;
    }
    options.push(
      <option key={networkName} value={networkName}>
        {capitalizeFirstLetter(networkName)}
      </option>,
    );
  }

  return (
    <Box>
      <Select
        size="sm"
        value={state.network_name}
        onChange={handleChange}
        variant="unstyled"
        color="#666666"
      >
        <option disabled value="">
          Network
        </option>
        {options}
      </Select>
    </Box>
  );
}
