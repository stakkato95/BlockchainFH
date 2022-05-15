package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

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

	r.HandleFunc("/nodes/register", handler.registerNodes).Methods(http.MethodPost)
	r.HandleFunc("/nodes/resolve", handler.resolveNodes).Methods(http.MethodGet)

	port := ":8080"
	if len(os.Args[1:]) != 0 {
		port = os.Args[1]
	}

	fmt.Printf("started blockchain node at %s\n", port)
	if err := http.ListenAndServe(port, r); err != nil {
		fmt.Println("error when starting ingress " + err.Error())
	}
}

type BlockchainHandler struct {
	blockchain chain.Blockchain
	nodeId     string
}

////////////////////////////////////////////////////////////////////////////

func (h *BlockchainHandler) chain(w http.ResponseWriter, r *http.Request) {
	ch := h.blockchain.Chain
	writeResponse(w, http.StatusOK, response.ChainResponse{
		Chain:  ch,
		Length: len(ch),
	})
}

func (h *BlockchainHandler) newTransaction(w http.ResponseWriter, r *http.Request) {
	transaction := response.Transaction{}
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
	h.blockchain.NewTransaction(response.Transaction{
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

////////////////////////////////////////////////////////////////////////////

func (h *BlockchainHandler) registerNodes(w http.ResponseWriter, r *http.Request) {
	nodes := response.RegisterNodesRequest{}
	if err := json.NewDecoder(r.Body).Decode(&nodes); err != nil {
		panic(err)
	}

	for _, node := range nodes.Nodes {
		h.blockchain.RegisterNode(node)
	}

	writeResponse(w, http.StatusCreated, response.RegisterNodesResponse{
		Message:    "New nodes have been added",
		TotalNodes: h.blockchain.GetNodes(),
	})
}

func (h *BlockchainHandler) resolveNodes(w http.ResponseWriter, r *http.Request) {
	replaced := h.blockchain.ResolveConflicts()
	var message string
	if replaced {
		message = "Our chain was replaced"
	} else {
		message = "Chain is authoritative"
	}

	writeResponse(w, http.StatusOK, response.ResolveResponse{
		Message: message,
		Chain:   h.blockchain.Chain,
	})
}

////////////////////////////////////////////////////////////////////////////

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
