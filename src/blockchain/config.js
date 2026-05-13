import { ethers } from "ethers";

import ABI from "./GiveHope.json";

export const CONTRACT_ADDRESS =
  "0xc3C96A6D23aB6902F32F13A404609d310b18eE8F";

export const getContract = async () => {

  if (!window.ethereum) {
    throw new Error("MetaMask not installed");
  }

  await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  const provider =
    new ethers.BrowserProvider(window.ethereum);

  const signer =
    await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    signer
  );
};

export const getReadOnlyContract = () => {
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");
  
  return new ethers.Contract(
    CONTRACT_ADDRESS,
    ABI,
    provider
  );
};