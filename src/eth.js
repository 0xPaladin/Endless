//ethers js 
import {ethers} from "../lib/ethers-5.0.min.js"
//abi 
import * as ABI from "../solidity/abi.js"

let reader = null, provider = null, signer = null;

const NETRPC = {
  5 : "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  250 : "https://rpc.ftm.tools"
}

if(window.ethereum) {
  // A Web3Provider wraps a standard Web3 provider, which is
  // what Metamask injects as window.ethereum into each page
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  let {chainId} = await provider.getNetwork()
  reader =  NETRPC[chainId] ? new ethers.providers.JsonRpcProvider(NETRPC[chainId]) : ethers.getDefaultProvider(chainId)
  
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

//export {ERC721Buyer, ERC721FullNoBurn, ERC721CommitReveal, Stats, ShardCosmicClaim}

const CONTRACTS = {
  5 : {
    "ERC721Buyer" : "0x326F012b2f893C44a1573A07F75c64C5b2718993",
    "ERC721FullNoBurn.Gen0" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8"
  },
  250 : {
    "ERC721Buyer" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8",
    "ERC721FullNoBurn.Gen0" : "0x8dB24cD8451B133115588ff1350ca47aefE2CB8c",
    "ERC721FullNoBurn.GenE" : "0x693eD718D4b4420817e0A2e6e606b888DCbDb39B",
    "ERC721CommitReveal" : "0xD124F097093F751E1620AA32f7f9A4B344eF9Be1", 
    "Stats" : "0xeEd019D0726e415526804fb3105a98323911E494", 
    "ShardCosmicClaim" : "0xF32974F4397D45694F13c873159d85D3F6deF0B9",
    "ERC721Utilities" : "0xf8f2ea668F996B45f9062BbA0FF6a5Eb31290eA5"
  }
}
const READONLY = ["ERC721FullNoBurn.Gen0","ERC721FullNoBurn.GenE","Stats","ERC721CommitReveal","ERC721Utilities"]

//id,name,nFixed,cost
const NETDATA = {
  5 : [5,"gETH",4,0.001],
  250 : [250,"FTM",0,1]
}

const NFTIDS = ["Gen0", "GenE"]

const COST = {
  5 : {
    "Gen0" : 0.001
  },
  250 : {
    "Gen0" : 1, 
    "GenE" : 0
  }
}

//load the contracts given a network name 
const loadContracts = (netId) => {
  if(!CONTRACTS[netId]) return null 

  let sig = {}, read = {};
  for(let x in CONTRACTS[netId]){
    let [id,name] = x.split(".")
    name = name || id
    
    sig[name] = new ethers.Contract(CONTRACTS[netId][x], ABI[id], signer)
    if(READONLY.includes(x)){
      read[name] = new ethers.Contract(CONTRACTS[netId][x], ABI[id], reader)
    }
  }

  return {sig,read} 
}

const EVMManager = async (app) => {
  app.eth = {
    contracts : {},
    parseEther : ethers.utils.parseEther
  }
  const read = () => app.eth.contracts.read;
  let address = "", NFT = {};

  let {chainId, name} = await provider.getNetwork()
  app.net = {chainId, name}
  console.log(app.net)

  //get commits
  const checkCommits = (address) => {
    read().ERC721CommitReveal.activeCommits(address, CONTRACTS[chainId]["ERC721FullNoBurn.GenE"]).then(res => {
      let reveal = res.toNumber()
      app.UI.main.setState({reveal})
    })
  }

  //if there is a nft balance poll for data 
  const checkNFTIds = async (id, nft) => {
    let _stats = CONTRACTS[chainId].Stats
    let _721 = nft[3]
    let C = read().ERC721Utilities

    let ids = (await C.getNFTIdBatch(_721, address)).map(bn => bn.toNumber())

    let _cosmic = (await C.getStatsOfIdBatch(_stats,"SRD.COSMIC",_721,ids))
      .map(bn => Number(ethers.utils.formatUnits(bn)))
    
    let _hash = (await C.getStatsOfIdBatch(_stats,"HASH",_721,ids)).map(bn => bn.toHexString())

    nft[2] = ids.map((id,i) => {
      let hash = _hash[i] == "0x00" ? null : _hash[i]
      let isOwned = true
      //generate and save 
      let shard = app.shard.byContract(_721,id,{hash,isOwned}) 

      return {
        id,
        cosmic : _cosmic[i],
        hash,
        _721
      }
    })
  }

  //check address for NFT balance
  const checkNFTBalance = async (id) => {
    let cost = COST[chainId][id]
    let C = read()[id]
    let getStat = read().Stats.getStat

    let nft = NFT[id] = NFT[id] || [-1,-1,[],C.address,cost]

    //check max
      if(nft[0] == -1){
        let _max = await C.MAX() 
        nft[0] = _max.gt(10**6) ? 10**7 : _max.toNumber() 
      }

      //check total 
      nft[1] = (await C.totalSupply()).toNumber()

    checkNFTIds(id,nft)
  }


  const poll = async () => {
    if(!CONTRACTS[chainId]) return 
    let {read} = app.eth.contracts

    Object.entries(COST[chainId]).forEach(async e => {


      /*
      //run through balance if it hasn't changed
      if(balance > nft[2]){
        nft[2] = balance
        nft[3] = []

        
      }
      */

      //get cosmic of shards 
      /*
      nft[3].forEach(async e => {
        let cosmic = await getStat("SRD.COSMIC", C.address, e[0])
      })
      */
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
    //block 
    let block = await provider.getBlockNumber()
    //get balance 
    let balance = Number(ethers.utils.formatUnits(await signer.getBalance()))
    
    //look for commits
    checkCommits(address)

    //check nfts 
    Object.keys(COST[chainId]).forEach(id => checkNFTBalance(id))

    //get owned shards 
    let myShards = app.shard.myShards()

    app.UI.main.setState({block, balance, NFT, myShards})
  },4000)
} 

export {EVMManager}
