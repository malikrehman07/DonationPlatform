import { ethers } from "ethers";

import ABI from "./GiveHope.json";

export const CONTRACT_ADDRESS =
  "0xDA0bab807633f07f013f94DD0E6A4F96F8742B53";

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