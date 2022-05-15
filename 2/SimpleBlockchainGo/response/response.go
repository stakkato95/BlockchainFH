package response

import (
	"time"
)

type Transaction struct {
	Sender    string
	Recipient string
	Amount    int
}

type Block struct {
	Index        int
	Timestamp    time.Time
	Transactions []Transaction
	Proof        int
	PreviousHash string
}

type ChainResponse struct {
	Chain  []Block
	Length int
}

type NewTransactionResponse struct {
	Message string
}

type MineResponse struct {
	Message      string
	Index        int
	Transactions []Transaction
	Proof        int
	PreviousHash string
}

type RegisterNodesRequest struct {
	Nodes []string
}

type RegisterNodesResponse struct {
	Message    string
	TotalNodes []string
}

type ResolveResponse struct {
	Message string
	Chain   []Block
}
