import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Typography, Input, message, Spin } from "antd";
import { ethers } from "ethers";
import { useAuthContext } from "../../../context/Auth";
import { getContract } from "../../../blockchain/config";

const { Title, Text } = Typography;

const Payout = () => {

  const { user, readProfile } = useAuthContext();

  const [wallet, setWallet] = useState(user?.walletAddress || "");
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [balance, setBalance] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // =========================
  // CONNECT WALLET
  // =========================
  const connectWallet = async () => {

    try {

      setLoading(true);

      if (!window.ethereum) {
        return message.error("Install MetaMask");
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      const walletAddress = accounts[0];
      setWallet(walletAddress);

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/ngo/connect-wallet",
        { walletAddress },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      message.success("Wallet connected successfully");

      await readProfile();

    } catch (err) {
      console.error(err);
      message.error("Wallet connection failed");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET BLOCKCHAIN BALANCE
  // =========================
  const loadBalance = async () => {

    try {

      if (!wallet) return;

      setBalanceLoading(true);

      const contract = await getContract();

      const rawBalance = await contract.ngoBalances(wallet);

      setBalance(ethers.formatEther(rawBalance));

    } catch (err) {
      console.error("Balance error:", err);
    } finally {
      setBalanceLoading(false);
    }
  };

  // =========================
  // WITHDRAW FROM BLOCKCHAIN
  // =========================
  const withdraw = async () => {

  try {

    setWithdrawLoading(true);

    const contract = await getContract();

    const tx = await contract.withdrawFunds();

    await tx.wait();

    message.success("Withdraw successful");

    loadBalance();

  } catch (err) {

    console.error(err);
    message.error(err.reason || "Withdraw failed");

  } finally {
    setWithdrawLoading(false);
  }
};

  // =========================
  // LOAD BALANCE ON MOUNT
  // =========================
  useEffect(() => {
    if (wallet) {
      loadBalance();
    }
  }, [wallet]);

  return (
    <div style={{ padding: 20 }}>

      <Card>

        <Title level={3}>Payout Dashboard</Title>

        <Text>
          Wallet: {wallet || "Not Connected"}
        </Text>

        <br /><br />

        {/* CONNECT WALLET */}
        <Button
          type="primary"
          loading={loading}
          onClick={connectWallet}
        >
          Connect MetaMask Wallet
        </Button>

        <br /><br />

        {/* BALANCE */}
        <Card>

          <Title level={4}>Available Balance</Title>

          {balanceLoading ? (
            <Spin />
          ) : (
            <Title level={2}>
              {balance} MATIC
            </Title>
          )}

        </Card>

        <br />

        {/* WITHDRAW */}
        <Card>

          <Title level={4}>Withdraw Funds</Title>

          <Input
            placeholder="Enter amount (MATIC)"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />

          <br /><br />

          <Button
            type="primary"
            block
            loading={withdrawLoading}
            onClick={withdraw}
          >
            Withdraw
          </Button>

        </Card>

      </Card>

    </div>
  );
};

export default Payout;