package chain

import (
	"bytes"
	"crypto"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/stakkato95/simple-blockchain-go/response"
)

type Blockchain struct {
	Chain               []response.Block
	CurrentTransactions []response.Transaction
	nodes               map[string]bool
}

func NewBlockchain() Blockchain {
	b := Blockchain{}
	b.nodes = map[string]bool{}
	b.NewBlock(100, "1")
	return b
}

////////////////////////////////////////////////////////////////////////////

func (b *Blockchain) NewBlock(proof int, previousHash string) response.Block {
	block := response.Block{
		Index:        len(b.Chain) + 1,
		Timestamp:    time.Now(),
		Transactions: b.CurrentTransactions,
		Proof:        proof,
		PreviousHash: b.getPreviousHash(previousHash),
	}

	b.CurrentTransactions = []response.Transaction{}
	b.Chain = append(b.Chain, block)

	return block
}

func (b *Blockchain) getPreviousHash(previousHash string) string {
	if previousHash != "" {
		return previousHash
	}
	return Hash(b.Chain[len(b.Chain)-1])
}

func Hash(block response.Block) string {
	writer := new(bytes.Buffer)
	if err := json.NewEncoder(writer).Encode(block); err != nil {
		panic(err)
	}

	return hexDigest(writer.Bytes())
}

func hexDigest(bytes []byte) string {
	//https://gist.github.com/miguelmota/3dee93d8b7340e33fc474eb3abb7d450
	//https://8gwifi.org/docs/go-hashing.jsp
	h := crypto.SHA256.New()
	h.Write(bytes)
	//https://schadokar.dev/to-the-point/convert-byte-to-hex-and-hex-to-byte-in-golang/
	hexString := hex.EncodeToString(h.Sum(nil))
	return hexString
}

////////////////////////////////////////////////////////////////////////////

func (b *Blockchain) NewTransaction(transaction response.Transaction) int {
	b.CurrentTransactions = append(b.CurrentTransactions, transaction)

	return b.LastBlock().Index + 1
}

func (b *Blockchain) LastBlock() response.Block {
	return b.Chain[len(b.Chain)-1]
}

////////////////////////////////////////////////////////////////////////////

func (b *Blockchain) ProofOfWork(lastProof int) int {
	proof := 0

	for {
		if b.validProof(lastProof, proof) {
			break
		}
		proof += 1
	}

	return proof
}

func (b *Blockchain) validProof(lastProof, proof int) bool {
	//https://appdividend.com/2022/01/30/golang-how-to-convert-string-to-byte-array/#:~:text=How%20to%20Convert%20Golang%20String%20to%20Byte%20Array,to%20a%20byte%20slice.%20...%204%20See%20also
	//https://itsmycode.com/python-string-encode/#:~:text=Python%20String%20encode%20%28%29%20method%20is%20a%20built-in,can%20take%20two%20parameters%2C%20and%20both%20are%20optional.
	guess := []byte(fmt.Sprintf("%d%d", lastProof, proof))
	guessHash := hexDigest(guess)
	return guessHash[:4] == "0000"
}

////////////////////////////////////////////////////////////////////////////

func (b *Blockchain) RegisterNode(node string) {
	b.nodes[node] = true
}

func (b *Blockchain) GetNodes() []string {
	nodes := make([]string, len(b.nodes))

	i := 0
	for node := range b.nodes {
		nodes[i] = node
		i++
	}

	return nodes
}

func (b *Blockchain) ResolveConflicts() bool {
	var newChain *[]response.Block
	maxLength := len(b.Chain)

	for node := range b.nodes {
		resp, err := http.DefaultClient.Get(fmt.Sprintf("http://localhost:%s/chain", node))
		if err != nil {
			fmt.Printf("can not reach node %s: %s\n", node, err.Error())
			continue
		}
		if resp.StatusCode != http.StatusOK {
			fmt.Printf("can not reach node %s: response is not 200\n", node)
			continue
		}

		chainResponse := response.ChainResponse{}
		if err = json.NewDecoder(resp.Body).Decode(&chainResponse); err != nil {
			panic(err.Error())
		}

		if chainResponse.Length > maxLength && b.ValidChain(chainResponse.Chain) {
			maxLength = chainResponse.Length
			newChain = &chainResponse.Chain
		}
	}

	if newChain != nil {
		b.Chain = *newChain
		return true
	}

	return false
}

func (b *Blockchain) ValidChain(chain []response.Block) bool {
	lastBlock := chain[0]
	currentIndex := 1

	for {
		if currentIndex == len(chain) {
			break
		}

		block := chain[currentIndex]
		fmt.Printf("%#v\n%#v\n\n-----------\n\n", lastBlock, block)

		if block.PreviousHash != Hash(lastBlock) {
			return false
		}
		if !b.validProof(lastBlock.Proof, block.Proof) {
			return false
		}

		lastBlock = block
		currentIndex += 1
	}

	return true
}
