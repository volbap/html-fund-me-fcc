import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, address } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a Metamask!")
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected!"
        console.log("Connected to Metamask")
    } else {
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider / connection to the blockchain
        // signer / wallet with gas

        // provider is our metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log(provider)

        // signer is the account connected with this website via metamask
        const signer = provider.getSigner()
        console.log(signer)

        // Contract we're interacting with, we need:
        // 1. ABI:
        //   - copy ABI from backend's artifacts folder
        //   - paste it in `constants.js` and export as a const
        //   - import { abi } from "./constants.js"
        // 2. Address:
        //   - spin up a node (yarn hardhat node)
        //   - connect metamask to that node (Add New Network > via RPC)
        //   - obtain the address from terminal logs (FundMe deployed at address 0x...)
        //   - paste it in `constant.js` and export it as a string const
        const contract = new ethers.Contract(address, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // Two ways of getting feedback when the transaction gets through:

            // (Option A) listen for the tx to be mined
            // Hey, wait for this transaction to finish...
            await listenForTransactionMine(transactionResponse, provider)
            console.log("done!")

            // (Option B) listen for an event
            // provider.once( )
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations.`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(address)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        // provider is our metamask
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log(provider)

        // signer is the account connected with this website via metamask
        const signer = provider.getSigner()
        console.log(signer)

        const contract = new ethers.Contract(address, abi, signer)

        console.log("Withdrawing...")
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdrawn!")
        } catch (error) {
            console.log(error)
        }
    }
}
