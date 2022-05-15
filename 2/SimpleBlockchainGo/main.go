package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/stakkato95/simple-blockchain-go/chain"
	"github.com/stakkato95/simple-blockchain-go/response"
)

func main() {
	handler := BlockchainHandler{
		blockchain: chain.NewBlockchain(),
		nodeId:     uuid.New().String()}

	r := mux.NewRouter()
	r.HandleFunc("/chain", handler.chain).Methods(http.MethodGet)
	r.HandleFunc("/transactions/new", handler.newTransaction).Methods(http.MethodPost)
	r.HandleFunc("/mine", handler.mine).Methods(http.MethodGet)

	port := ":8080"
	fmt.Printf("started ingress at %s\n", port)
	if err := http.ListenAndServe(port, r); err != nil {
		fmt.Println("error when starting ingress " + err.Error())
	}
}

type BlockchainHandler struct {
	blockchain chain.Blockchain
	nodeId     string
}

func (h *BlockchainHandler) chain(w http.ResponseWriter, r *http.Request) {
	chain := h.blockchain.Chain
	writeResponse(w, http.StatusOK, response.ChainResponse{
		Chain:  chain,
		Length: len(chain),
	})
}

func (h *BlockchainHandler) newTransaction(w http.ResponseWriter, r *http.Request) {
	transaction := chain.Transaction{}
	if err := json.NewDecoder(r.Body).Decode(&transaction); err != nil {
		panic(err)
	}

	index := h.blockchain.NewTransaction(transaction)
	writeResponse(w, http.StatusCreated, response.NewTransactionResponse{
		Message: fmt.Sprintf("Transaction will be added to Block %d", index),
	})
}

func (h *BlockchainHandler) mine(w http.ResponseWriter, r *http.Request) {
	lastBlock := h.blockchain.LastBlock()
	lastProof := lastBlock.Proof
	proof := h.blockchain.ProofOfWork(lastProof)
	h.blockchain.NewTransaction(chain.Transaction{
		Sender:    "0",
		Recipient: h.nodeId,
		Amount:    1,
	})
	previousHash := chain.Hash(lastBlock)
	block := h.blockchain.NewBlock(proof, previousHash)

	writeResponse(w, http.StatusOK, response.MineResponse{
		Message:      "New Block Forged",
		Index:        block.Index,
		Transactions: block.Transactions,
		Proof:        block.Proof,
		PreviousHash: block.PreviousHash,
	})
}

func writeResponse(w http.ResponseWriter, code int, data interface{}) {
	//1 Content-Type - always first
	w.Header().Add("Content-Type", "application/json")
	//2 HTTP status code
	w.WriteHeader(code)
	//3 body
	if err := json.NewEncoder(w).Encode(data); err != nil {
		panic(err)
	}
}
