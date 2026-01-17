"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusherClient";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, Spinner, Badge, Card, Row, Col, ProgressBar } from "react-bootstrap";

interface WalletTransaction {
  _id: string;
  type: "credit" | "debit" | "earning";
  amount: number;
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface WalletData {
  balance: number;
  transactions: WalletTransaction[];
}


export default function WalletRoute({ params }: { params: any }) {
  const userId = params.userId;
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [upiId, setUpiId] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const isValidUpi = (upi: string) =>
    /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upi);

  async function fetchWallet() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/wallet/${userId}`);
      const data = await res.json();
      if (res.ok) setWallet(data);
      else setError(data.error || "Failed to load wallet data");
    } catch (err) {
      console.error("Failed to fetch wallet", err);
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWallet();

    const channel = pusherClient.subscribe(`wallet-${userId}`);
    channel.bind("withdrawal-update", () => fetchWallet());

    return () => pusherClient.unsubscribe(`wallet-${userId}`);
  }, [userId]);

  async function handleWithdraw() {
    setError("");
    setSuccess("");

    if (!upiId || !amount) return setError("Please fill UPI ID and amount");
    if (!isValidUpi(upiId)) return setError("Enter a valid UPI ID (e.g., username@bank)");
    if (wallet && Number(amount) > wallet.balance) return setError("Insufficient balance");

    setLoading(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount: Number(amount), upiId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to request withdrawal");

      setSuccess("Withdrawal requested! Waiting for admin approval.");
      setAmount("");
      fetchWallet();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved": return "success";
      case "pending": return "warning";
      case "rejected": return "danger";
      default: return "secondary";
    }
  };

  const getTransactionIcon = (type: string, status?: string) => {
    if (type === "earning" || type === "credit") return "💰";
    if (type === "debit") {
      switch (status) {
        case "approved": return "✅";
        case "pending": return "⏳";
        case "rejected": return "❌";
        default: return "💳";
      }
    }
    return "💳";
  };

  return (
    <motion.div 
      className="container-fluid py-4 px-3 px-md-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="text-center mb-5">
        <motion.h1 
          className="display-5 fw-bold text-gradient mb-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          💳 Wallet
        </motion.h1>
        <p className="text-muted lead">Manage your funds and track transactions</p>
      </div>

      <Row className="g-4">
        {/* Balance Card - Left Side */}
        <Col lg={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-lg border-0 rounded-4 h-100">
              <Card.Body className="p-4 d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                    <span className="fs-2">💰</span>
                  </div>
                  <div>
                    <Card.Title className="text-muted mb-1">Current Balance</Card.Title>
                    {isLoading ? (
                      <Spinner animation="border" variant="primary" />
                    ) : (
                      <h2 className="fw-bold text-gradient mb-0">₹{wallet?.balance?.toLocaleString() ?? 0}</h2>
                    )}
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="mt-auto">
                  <div className="d-flex justify-content-between text-sm text-muted mb-2">
                    <span>Available for withdrawal</span>
                    <span>₹{wallet?.balance?.toLocaleString() ?? 0}</span>
                  </div>
                  <ProgressBar 
                    now={100} 
                    variant="success" 
                    className="mb-3"
                    style={{ height: "6px" }}
                  />
                  
                  <div className="bg-light rounded-3 p-3 mt-3">
                    <small className="text-muted d-block">
                      💡 Withdrawals processed within 24-48 hours
                    </small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>

        {/* Withdraw Form - Right Side */}
        <Col lg={8}>
          <Row className="g-4">
            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="shadow-lg border-0 rounded-4 h-100">
                  <Card.Body className="p-4">
                    <Card.Title className="mb-4">
                      <span className="bg-primary bg-opacity-10 p-2 rounded-2 me-2">💸</span>
                      Withdraw Funds
                    </Card.Title>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Alert variant="danger" className="rounded-3 border-0">
                            <i className="bi bi-exclamation-triangle me-2"></i>
                            {error}
                          </Alert>
                        </motion.div>
                      )}
                      
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <Alert variant="success" className="rounded-3 border-0">
                            <i className="bi bi-check-circle me-2"></i>
                            {success}
                          </Alert>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">UPI ID</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-upc-scan text-muted"></i>
                        </span>
                        <input
                          type="text"
                          placeholder="username@bank"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="form-control border-start-0 rounded-end-pill"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-semibold">Amount (₹)</label>
                      <div className="input-group input-group-lg">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-currency-rupee text-muted"></i>
                        </span>
                        <input
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="form-control border-start-0 rounded-end-pill"
                          min="1"
                          max={wallet?.balance}
                        />
                      </div>
                      {wallet && (
                        <div className="form-text d-flex justify-content-between mt-2">
                          <span>Available: ₹{wallet.balance.toLocaleString()}</span>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setAmount(wallet.balance.toString())}
                          >
                            Max
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleWithdraw}
                      className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm py-3 fw-semibold"
                      disabled={loading || !wallet || Number(amount) > wallet.balance || !amount || !upiId}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-check me-2"></i>
                          Request Withdrawal
                        </>
                      )}
                    </button>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>

            {/* Recent Activity */}
            <Col md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="shadow-lg border-0 rounded-4 h-100">
                  <Card.Body className="p-4">
                    <Card.Title className="mb-4">
                      <span className="bg-info bg-opacity-10 p-2 rounded-2 me-2">📊</span>
                      Recent Activity
                    </Card.Title>
                    
                    {isLoading ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-2">Loading transactions...</p>
                      </div>
                    ) : wallet?.transactions?.length ? (
                      <div className="transaction-list" style={{ maxHeight: "400px", overflowY: "auto" }}>
                        {wallet.transactions.map((t, index) => {
                          const platformFee = (t.type === "earning" || t.type === "credit") ? t.amount * 0.2 : 0;
                          const netAmount = t.amount - platformFee;
                          
                          return (
                            <motion.div
                              key={t._id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="transaction-item border-bottom pb-3 mb-3"
                            >
                              <div className="d-flex align-items-start">
                                <div className="bg-light rounded-2 p-2 me-3">
                                  <span className="fs-5">{getTransactionIcon(t.type, t.status)}</span>
                                </div>
                                <div className="flex-grow-1">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                      <h6 className="mb-1 fw-semibold">
                                        {t.type === "earning" ? "Tip Received" : 
                                         t.type === "credit" ? "Credit Added" : "Withdrawal"}
                                      </h6>
                                      <small className="text-muted">
                                        {new Date(t.createdAt).toLocaleDateString('en-IN', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </small>
                                    </div>
                                    <Badge 
                                      bg={getStatusVariant(t.status || 'completed')} 
                                      className="rounded-pill"
                                    >
                                      {t.status || 'completed'}
                                    </Badge>
                                  </div>
                                  
                                  <div className="mt-2">
                                    <span className={`fw-bold fs-5 ${
                                      t.type === 'debit' ? 'text-danger' : 'text-success'
                                    }`}>
                                      {t.type === 'debit' ? '-' : '+'}₹{t.amount.toLocaleString()}
                                    </span>
                                    
                                    {platformFee > 0 && (
                                      <div className="text-xs text-muted">
                                        charge: (30% platform fee)
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-5">
                        <div className="bg-light rounded-3 p-4 mb-3">
                          <i className="bi bi-receipt fs-1 text-muted"></i>
                        </div>
                        <p className="text-muted">No transactions yet</p>
                        <small className="text-muted">Your transactions will appear here</small>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Full Transactions List for Larger Screens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-5 d-none d-lg-block"
      >
        <Card className="shadow-lg border-0 rounded-4">
          <Card.Header className="bg-transparent border-0 py-4">
            <h5 className="mb-0">
              <i className="bi bi-clock-history me-2"></i>
              Transaction History
            </h5>
          </Card.Header>
          <Card.Body className="p-0">
            {wallet?.transactions?.length ? (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 ps-4">Transaction</th>
                      <th className="border-0">Date & Time</th>
                      <th className="border-0">Status</th>
                      <th className="border-0 text-end pe-4">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.transactions.map((t) => (
                      <tr key={t._id} className="border-top">
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            <span className="me-3">{getTransactionIcon(t.type, t.status)}</span>
                            <div>
                              <div className="fw-semibold">
                                {t.type === "earning" ? "Tip Received" : 
                                 t.type === "credit" ? "Credit Added" : "Withdrawal Request"}
                              </div>
                              {t.type === "earning" && (
                                <small className="text-muted">20% platform fee applied</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          {new Date(t.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3">
                          <Badge bg={getStatusVariant(t.status || 'completed')} className="rounded-pill">
                            {t.status || 'completed'}
                          </Badge>
                        </td>
                        <td className={`fw-bold fs-5 text-end pe-4 py-3 ${
                          t.type === 'debit' ? 'text-danger' : 'text-success'
                        }`}>
                          {t.type === 'debit' ? '-' : '+'}₹{t.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </Card.Body>
        </Card>
      </motion.div>

      <style jsx>{`
        .text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .transaction-list::-webkit-scrollbar {
          width: 4px;
        }
        
        .transaction-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .transaction-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        
        .card {
          transition: transform 0.2s ease-in-out;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
        }
        
        .btn-primary:hover {
          background: linear-gradient(135deg, #5a6fd8 0%, #6a42a0 100%);
          transform: translateY(-1px);
        }
      `}</style>
    </motion.div>
  );
}