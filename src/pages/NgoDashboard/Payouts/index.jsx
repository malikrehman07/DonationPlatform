import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Typography, message, Spin, Table, Tag, Row, Col, Statistic } from "antd";
import { WalletOutlined, HistoryOutlined, BankOutlined, ArrowUpOutlined } from "@ant-design/icons";
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
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  // =========================
  // FETCH HISTORY
  // =========================
  const fetchHistory = async () => {
    try {
      if (!user?._id) return;
      const token = localStorage.getItem("token");
      const res = await axios.get(`https://apigivehopes.vercel.app/ngo/withdrawal/history/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data.history || []);
    } catch (err) {
      console.error("History error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // =========================
  // CONNECT WALLET
  // =========================
  const connectWallet = async () => {
    try {
      setLoading(true);
      if (!window.ethereum) return message.error("Install MetaMask");

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletAddress = accounts[0];
      setWallet(walletAddress);

      const token = localStorage.getItem("token");
      await axios.put("https://apigivehopes.vercel.app/ngo/connect-wallet", { walletAddress }, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      setBalance(parseFloat(ethers.formatEther(rawBalance)).toFixed(2));
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
      if (Number(balance) <= 0) return message.warning("No funds available to withdraw");
      
      setWithdrawLoading(true);
      const contract = await getContract();
      
      // Perform Blockchain Withdrawal
      const tx = await contract.withdrawFunds({
        maxPriorityFeePerGas: ethers.parseUnits("40", "gwei"),
        maxFeePerGas: ethers.parseUnits("60", "gwei")
      });
      message.loading({ content: "Processing withdrawal on blockchain...", key: "payout" });
      const receipt = await tx.wait();

      // Record in Backend History
      const token = localStorage.getItem("token");
      await axios.post("https://apigivehopes.vercel.app/ngo/withdrawal/record", {
        amount: Number(balance),
        walletAddress: wallet,
        transactionHash: receipt.hash
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success({ content: "Withdraw successful! Funds sent to your wallet.", key: "payout" });
      
      loadBalance();
      fetchHistory();
    } catch (err) {
      console.error(err);
      message.error({ content: err.reason || "Withdraw failed", key: "payout" });
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    if (user?.walletAddress) {
      setWallet(user.walletAddress);
    }
  }, [user]);

  useEffect(() => {
    if (wallet) loadBalance();
    fetchHistory();
  }, [wallet, user]);

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => <b className="text-success">{amount} MATIC</b>
    },
    {
      title: "Transaction Hash",
      dataIndex: "transactionHash",
      key: "hash",
      render: (hash) => (
        <Text copyable style={{ color: "#1890ff" }}>
          {hash.substring(0, 10)}...{hash.substring(hash.length - 4)}
        </Text>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color="green">{status.toUpperCase()}</Tag>
    }
  ];

  return (
    <div className="dashboard-content">
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Title level={2}>Payouts & Withdrawals</Title>
          <Text secondary>Securely manage your campaign funds and withdraw directly to your connected wallet.</Text>
        </Col>

        {/* WALLET CONNECTION */}
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-4">
            <Statistic
              title="Connected Wallet"
              value={wallet ? "Connected" : "Not Linked"}
              prefix={<WalletOutlined />}
              valueStyle={{ color: wallet ? "#52c41a" : "#faad14" }}
            />
            <Text type="secondary" className="d-block mb-3" style={{ wordBreak: "break-all" }}>
              {wallet || "Please connect MetaMask to withdraw funds"}
            </Text>
            <Button 
              type={wallet ? "default" : "primary"} 
              size="large" 
              icon={<WalletOutlined />} 
              loading={loading}
              onClick={connectWallet}
              block
              shape="round"
            >
              {wallet ? "Update Connected Wallet" : "Link MetaMask Wallet"}
            </Button>
          </Card>
        </Col>

        {/* BALANCE & WITHDRAW */}
        <Col xs={24} lg={12}>
          <Card bordered={false} className="shadow-sm rounded-4 bg-primary text-white">
            <Statistic
              title={<span style={{color: 'white'}}>Available to Withdraw</span>}
              value={balance}
              precision={4}
              suffix="MATIC"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: 'white', fontSize: 32 }}
              loading={balanceLoading}
            />
            <Button 
              type="default" 
              size="large" 
              className="mt-3" 
              style={{ background: 'white', color: '#07887f', border: 'none' }}
              block
              loading={withdrawLoading}
              onClick={withdraw}
              disabled={!wallet || Number(balance) <= 0}
              shape="round"
            >
              Withdraw All Funds <BankOutlined />
            </Button>
          </Card>
        </Col>

        {/* HISTORY TABLE */}
        <Col span={24}>
          <Card 
            title={<span><HistoryOutlined /> Withdrawal History</span>} 
            bordered={false} 
            className="shadow-sm rounded-4"
          >
            <Table
              dataSource={history}
              columns={columns}
              rowKey="_id"
              loading={historyLoading}
              pagination={{ pageSize: 5 }}
              scroll={{ x: "max-content" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Payout;
