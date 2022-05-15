package response

import "github.com/stakkato95/simple-blockchain-go/chain"

type ChainResponse struct {
	Chain  []chain.Block
	Length int
}

type NewTransactionResponse struct {
	Message string
}

type MineResponse struct {
	Message      string
	Index        int
	Transactions []chain.Transaction
	Proof        int
	PreviousHash string
}
