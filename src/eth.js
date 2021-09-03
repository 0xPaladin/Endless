//ethers js 
import {ethers} from "../lib/ethers-5.0.min.js"
//abi 
import * as ABI from "../solidity/abi.js"

let provider = null, signer = null;

if(window.ethereum) {
  // A Web3Provider wraps a standard Web3 provider, which is
  // what Metamask injects as window.ethereum into each page
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  
  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  
  provider.on("network", (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // oldNetwork exists, it represents a changing network
        if (oldNetwork) {
            window.location.reload();
        }
  });
  
  // The Metamask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  signer = provider.getSigner();
  console.log("Account:", await signer.getAddress());
}
else {
  provider =  ethers.getDefaultProvider()
}

const CONTRACTS = {
  5 : {
    "ERC721Buyer" : "0x326F012b2f893C44a1573A07F75c64C5b2718993",
    "ERC721FullNoBurn.Gen0" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8"
  },
  250 : {
    "ERC721Buyer" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8",
    "ERC721FullNoBurn.Gen0" : "0x8dB24cD8451B133115588ff1350ca47aefE2CB8c"
  }
}

//id,name,nFixed,cost
const NETDATA = {
  5 : [5,"gETH",4,0.001],
  250 : [250,"FTM",0,1]
}

const NFTIDS = ["Gen0"]

//load the contracts given a network name 
const loadContracts = (netId) => {
  if(!CONTRACTS[netId]) return null 

  let c = {}
  for(let x in CONTRACTS[netId]){
    let [id,name] = x.split(".")
    name = name || id
    
    c[name] = new ethers.Contract(CONTRACTS[netId][x], ABI[id], signer)
  }

  return c 
}

const EVMManager = async (app) => {
  app.eth = {
    contracts : {},
    parseEther : ethers.utils.parseEther
  }
  let address = "", NFT = {}; 

  let {chainId, name} = await provider.getNetwork()
  app.net = {chainId, name}
  console.log(app.net)

  const poll = async () => {
    if(!CONTRACTS[chainId]) return 

    NFTIDS.forEach(async id => {
      let C = app.eth.contracts[id]
      let nft = NFT[id] = NFT[id] || [-1,-1,0,[],C.address]

      //check max
      if(nft[0] == -1)  
        nft[0] = (await C.MAX()).toNumber()   
      //check total 
      nft[1] = (await C.totalSupply()).toNumber()
      //check balance 
      let balance = (await C.balanceOf(address)).toNumber()

      //run through balance if it hasn't changed
      if(balance > nft[2]){
        nft[2] = balance
        nft[3] = []

        //loop and push to array 
        for(let i = 0; i < balance; i++){
          let tid = (await C.tokenOfOwnerByIndex(address,i)).toNumber()
          //generate and save 
          let shard = app.shard.byContract(C.address, tid)
          nft[3].push(shard.hash)
        }
      }
    })
  }

  //poll for address change 
  setInterval(async ()=>{
    let newAddress = await signer.getAddress()
    if(address != newAddress) {
      address = newAddress
      //load contracts again 
      app.eth.contracts = loadContracts(app.net.chainId)
      //reset NFT data 
      NFT = {}
      //UI
      let chainData = NETDATA[app.net.chainId] || [chainId,"Ξ",4,-1]
      app.UI.main.setAddress(address, chainData)
    }
    //get balance 
    let balance = Number(ethers.utils.formatUnits(await signer.getBalance()))
    app.UI.main.setBalance(balance)
    //get 721 data 
    poll()
    app.UI.main.setNFT(NFT)
  },3000)
} 

export {EVMManager}
