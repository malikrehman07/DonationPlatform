import { ethers } from "ethers";

import ABI from "./GiveHope.json";

export const CONTRACT_ADDRESS =
  "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3";

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