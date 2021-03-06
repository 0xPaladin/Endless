//ethers js 
import {ethers} from "../lib/ethers-5.0.min.js"
//ether Random js 
import {keccak256} from "./ETHRandom.js"
//abi 
const ABI = {}
import {r1, r2} from "../solidity/abi.js"
ABI["250"] = r1
ABI["338"] = r2
ABI["9000"] = r2
ABI["1666600000"] = r2 

let reader = null, provider = null, signer = null;

const NETRPC = {
  5 : "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
  250 : "https://rpc.ftm.tools",
  9000 : "http://arsiamons.rpc.evmos.org:8545",
  1666600000 : "https://api.harmony.one",
  338 : "https://cronos-testnet-3.crypto.org:8545/"
}
//id,name,nFixed,cost
const NETDATA = {
  5 : [5,"gETH",4,0.001],
  250 : [250,"FTM",0,1],
  338 : [338,"tCRO",0,10],
  9000 : [9000,"tPHOTON",0,10],
  1666600000 : [1666600000,"ONE",10]
}


const FTMSCAN = "https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress="
const FTMAPI = "&apikey=KSTS4EH3UBX6J7BW3J31NP469P863VE2DH"

if(window.ethereum) {
  // A Web3Provider wraps a standard Web3 provider, which is what Metamask injects as window.ethereum into each page
  provider = new ethers.providers.Web3Provider(window.ethereum, "any");
  let {chainId} = await provider.getNetwork()

  reader =  NETRPC[chainId] ? new ethers.providers.JsonRpcProvider(NETRPC[chainId]) : new ethers.providers.JsonRpcProvider(NETRPC["250"]) 
  
  // Prompt user for account connections
  await provider.send("eth_requestAccounts", []);
  
  provider.on("network", (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network" event with a null oldNetwork along with the newNetwork. 
        // So, if the oldNetwork exists, it represents a changing network
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
    "ERC721FullNoBurn.GenR" : "0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb",
    "ERC721FullNoBurn.Ally" : "0xAe1Ad876f3759eaBcc04733ce32918cBEC5218B5",
    "ERC721FreeClaim" : "0xf13802CA09a9528cf8E3C48768E7D3c9EB48191f", 
    "Stats" : "0xeEd019D0726e415526804fb3105a98323911E494",
    "StatsBytes" : "0x0382b163D4B46999660d5AD85Fdc0f3fB5Eb9541",
    "StatsBytesUtilities" : "0x1F83ff50D30da84657d9be73e593386C29428541", 
    "ERC721Utilities" : "0xf8f2ea668F996B45f9062BbA0FF6a5Eb31290eA5",
    "ShardCosmicClaim" : "0xAF63B2Dd717CEC099d262680dDe7692B48Ab9b34",
    "TransferCosmic" : "0x208C03B576F3bd8142A4de897C3D309176e09D93",
    "FeatureClaimFixed.FC0" : "0x1090b41872B890424b96BFFee712dD835fd87c55",
    "FeatureClaimFixed.FC1" : "0x04777919fd8868F2ECEA4761201966e360ea21E6",
    "FeatureClaimFixed.FC2" : "0x2A9F1f86Ae900dB9B63cfbb0F384b62aA1Df9a44",
    "FeatureClaimFixed.FC3" : "0x3c362BAcc5E5e8e3f1da9716D8BcA326c8e29103",
    "FeatureClaimFixed.FC4" : "0xE424980979A2f75251692A05Eb6d2c7AA457f009",
    "FeatureClaimFixed.FC6" : "0x64b7A22C48674D87cE77738CFD5B4bCB9a12fAcE",
    "FeatureClaimFixed.FC8" : "0x215989c299FbE62C903894021C52555d4475182e",
    "FeatureLastClaimPoll" : "0x950CF55E8826d41097a0bCbBd30DE113CEa9cb17"
  },
  338 : {
    "ERC721FreeClaim" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8", 
    "ERC721Utilities" : "0x326F012b2f893C44a1573A07F75c64C5b2718993",
    "ShardCosmic" : "0xeEd019D0726e415526804fb3105a98323911E494",
    "ShardFeatures" : "0x693eD718D4b4420817e0A2e6e606b888DCbDb39B",
    "ShardFeatureClaimPoll" : "0xC79b585e7543fc42ff8B4B07784290B032643f2c",
  },
  9000 : {
    "ERC721FreeClaim" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8", 
    "ERC721Utilities" : "0xd17E5A1cAbaF6898582658045Cca242f9C4DD5Ba",
    "ShardCosmic" : "0xc8B0bEac15375FcD15c81E3f484a6D485fbf4AA4",
    "ShardFeatures" : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
    "ShardFeatureClaimPoll" : "0x53513dd02AF722F3Ea582cA2E055b4E97d225C22",
    "ShardAlly" : "0xB1f6F15e2324fF93cBd5039AbB82Da05daBB1110"
  },
  1666600000 : {
    "ERC721FreeClaim" : "0xedb2517b60DCDEc0d191E3Ad2719D4CA6ec9Cb8b", 
    "ERC721Utilities" : "0xE6c64B33C7F80a5976F6074A71eab6ea036204d7",
    "ShardCosmic" : "0xae022C5b791ECc6Ff33c974d573f5D1540aaDAec",
    "ShardFeatures" : "0x835f590C64715851B17457eE57624D8E50F4c095",
    "ShardFeatureClaimPoll" : "0xb8ceb752468671f973bdeb894A9f9DE8f8B7E5f6"
  }
}
const READONLY = ["ERC721FullNoBurn.Ally","ERC721FullNoBurn.Gen0","ERC721FullNoBurn.GenE","ERC721FullNoBurn.GenR","StatsBytesUtilities","ERC721Utilities","FeatureLastClaimPoll","ShardFeatureClaimPoll"]

const NFTIDS = {
  5 : {
    "Gen0" : "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8"
  },
  250 : {
    "Gen0" : "0x8dB24cD8451B133115588ff1350ca47aefE2CB8c",
    "GenE" : "0x693eD718D4b4420817e0A2e6e606b888DCbDb39B",
    "GenR" : "0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb",
    "Ally" : "0xAe1Ad876f3759eaBcc04733ce32918cBEC5218B5",
  },
  338 : {
    "GenE" : "0x8dB24cD8451B133115588ff1350ca47aefE2CB8c",
  },
  9000 : {
    "GenE" : "0x8dB24cD8451B133115588ff1350ca47aefE2CB8c",
    "Ally" : "0xbd80C80a62521c9E6205f1F7574e639283B250ca"
  },
  1666600000 : {
    "GenE" : "0xC79b585e7543fc42ff8B4B07784290B032643f2c",
  }
}

const MAYCLAIM = {
  "250" : {} ,
  "338" : {},
  "9000" : {
    0 : "0xB1f6F15e2324fF93cBd5039AbB82Da05daBB1110",
    1 : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
    2 : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
    3 : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
    4 : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
    6 : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
    8 : "0x6F154e7066D3BB068BAbd224669b72f70d33d0AF",
  },
  "1666600000" : {
    1 : "0x835f590C64715851B17457eE57624D8E50F4c095",
    2 : "0x835f590C64715851B17457eE57624D8E50F4c095",
    3 : "0x835f590C64715851B17457eE57624D8E50F4c095",
  },
}

//load the contracts given a network name 
const loadContracts = (netId) => {
  if(!CONTRACTS[netId]) return null 

  let sig = {}, read = {};
  for(let x in CONTRACTS[netId]){
    let [id,name] = x.split(".")
    name = name || id
    
    if(ABI[netId][id]) {
      sig[name] = new ethers.Contract(CONTRACTS[netId][x], ABI[netId][id], signer)
    }
    if(READONLY.includes(x) && ABI[netId][id]){
      read[name] = new ethers.Contract(CONTRACTS[netId][x], ABI[netId][id], signer)
    }
  }

  return {sig,read} 
}

const checkRarity = async (address) => {
    let ids = {}
    ////https://api.ftmscan.com/api?module=account&action=tokennfttx&contractaddress=0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb&address=0x592Ad5d7618994464885fb485953a51DE119586A
    let {result = []} = await $.get(FTMSCAN+"0xce761D788DF608BD21bdd59d6f4B54b2e27F25Bb"+"&address="+address+FTMAPI)

    result.forEach(res => {
      let {tokenID, to, blockNumber} = res 
      blockNumber = Number(blockNumber)

      //sending token 
      if(ethers.utils.getAddress(to) == address){
        ids[tokenID] = blockNumber
      } 
      //receiving token 
      else {
        delete ids[tokenID]
      }
    })

    return Object.keys(ids).map(Number)
  }

const EVMManager = async (app) => {
  let address = "", NFT = {};

  app.eth = {
    mayClaim : [],
    contracts : {},
    parseEther : ethers.utils.parseEther,
    parseUnits : ethers.utils.parseUnits,
    decode (types,data) {
      return data == "0x" ? [null] : ethers.utils.defaultAbiCoder.decode(types, data)
    }
  }
  const read = () => app.eth.contracts.read;

  let {chainId, name} = await provider.getNetwork()
  app.net = {chainId, name}
  console.log(app.net)

  //pull a batch of ids from an NFT 
  app.eth.getNFTIdBatch = async function (nftAddress) {
      let F = this.contracts.read.ERC721Utilities.getNFTIdBatch
      let ids = (await F(nftAddress,address)) || []
      return ids.map(bn => bn.toNumber()) 
    }

  //pull a batch of stats from a singular nft 
    app.eth.getBatchOfStats = async function (stats, nft, id, isBytes) {
      let read = this.contracts.read, F, calldata;

      //functions and call data depend upon chain 
      if(chainId == 250){
        F = isBytes ? read.StatsBytesUtilities.getBatchOfStats : read.ERC721Utilities.getBatchOfStats
        calldata = [isBytes ? CONTRACTS[chainId].StatsBytes : CONTRACTS[chainId].Stats, stats, nft, id]
      }
      else {
        F = read.ERC721Utilities.getBatchOfStats
        calldata = [stats, nft, id]
      }

      //return call 
      return await F(...calldata)  
    }

    //pull a stat from a batch of nfts 
    app.eth.getStatsOfIdBatch = async function (stat, nft, ids, isBytes) {
      let read = this.contracts.read, F, calldata;

      //functions and call data depend upon chain 
      if(chainId == 250){
        F = isBytes ? read.StatsBytesUtilities.getStatsOfIdBatch : read.ERC721Utilities.getStatsOfIdBatch
        calldata = [isBytes ? CONTRACTS[chainId].StatsBytes : CONTRACTS[chainId].Stats, stat, nft, ids]
      }
      else {
        F = read.ERC721Utilities.getStatsOfIdBatch
        calldata = [stat, nft, ids]
      }

      //return call 
      return await F(...calldata)
    }

    //check for the claims of a shard 
    app.eth.checkShardClaims = async function (shard) {
      if (chainId == 250) return  
      let MC = MAYCLAIM[chainId] || {}
      let F = read().ShardFeatureClaimPoll.lastClaimBatch

      //lastClaimBatch (uint256 sid, address[] calldata _claims, uint256[] calldata fids)
      let _i = [], claims=[];
      //collect ids and claim addresses
      shard._features.filter(f => Object.keys(MC).map(Number).includes(f.wi))
        .forEach(f => {
          _i.push(f.i)
          claims.push(MC[f.wi])
        })      

      //call chain data 
      let calldata = [shard.id, claims, _i] 
      let times = (await F(...calldata)).map(bn => bn.toNumber())
      //set times
      shard.featureClaimTimes = {_i,times}
    }

    //claim cosmic for a shard 
    app.eth.claimCosmic = async function (shard) {
      let F = chainId == 250 ? this.contracts.sig.ShardCosmicClaim.claim : this.contracts.sig.ShardCosmic.claim; 
      let calldata = chainId == 250 ? [shard._721, shard.id] : [shard.id];

      //claim it - handle tx notification
      F(...calldata).then(tx => this.handleTx(tx,"Claim"))
    }

    //claim cosmic for a shard 
    app.eth.txCosmic = async function (fromShard, toShard, val) {
      let F = chainId == 250 ? this.contracts.sig.TransferCosmic.transfer : this.contracts.sig.ShardCosmic.transfer; 
      let calldata = chainId == 250 ? [fromShard._721,fromShard.id,toShard._721,toShard.id,app.eth.parseUnits(val)] : [fromShard.id,toShard.id,app.eth.parseUnits(val)]

      //transfer
      F(...calldata).then(tx => this.handleTx(tx,"Transfer"))
    }

    //handle a tx respose for every eth tx 
    app.eth.handleTx = async function (tx, text) {
      let {hash} = tx

        //log and notification
        text += " Submitted: " + hash
        console.log(text)
        app.simpleNotify(text, "info", "center")

        tx.wait(1).then(res=>{
          let _text = " Confirmed: " + res.blockNumber
          console.log(_text)
          app.simpleNotify(_text, "info", "center")

          return
        }
        )
    }

  //if there is a nft balance poll for data 
  const checkShards = async (nft) => {
    let _ids = nft.id == "GenR" ? await checkRarity(address) : await app.eth.getNFTIdBatch(nft.address)

    //call for cosmic
    let _cosmic = (await app.eth.getStatsOfIdBatch(chainId == 250 ? "SRD.COSMIC" : "COSMIC",nft.address,_ids,false))
      .map(res => {
        let bn = chainId == 250 ? res : app.eth.decode(["uint256"],res)[0] || 0
        return Number(ethers.utils.formatUnits(bn))
      })

    nft.owned = _ids.map((id,i) => {
      let isOwned = true
      //generate and save 
      let shard = app.shard.byContract(nft.address,id,{isOwned}) 

      return {
        id,
        cosmic : _cosmic[i],
        hash : shard.hash,
        _721 : nft.address
      }
    })

    _cosmic.forEach((val,i) => app.shard.byContract(nft.address,_ids[i]).cosmic = val)
  }

  const checkAlly = async (nft) => {
    let _ids = await app.eth.getNFTIdBatch(nft.address)
    let _people = await app.eth.getStatsOfIdBatch("people",nft.address,_ids,true)

    nft.owned = _ids.forEach((id,i)=> {
      let ally = app.ally.byContract(nft.address,id)
      ally.isOwned = true
      ally._people = _people[i]

      return {id,hash:ally.key}
    })
  }

  //check address for NFT balance
  const checkNFTBalance = async (id) => {
    let nft = NFT[id] = NFT[id] || {
      id,
      owned : [],
      address : NFTIDS[chainId][id],
      cost : 0
    }

    if(["Gen0","GenR","GenE"].includes(id)) {
      checkShards(nft).catch(console.log)  
    }
    else if (id == "Ally") {
      checkAlly(nft).catch(console.log)
    }
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
      let chainData = NETDATA[app.net.chainId] || [chainId,"??",4,-1]
      app.UI.main.setAddress(address, chainData)
    }
    //block 
    let block = await provider.getBlockNumber()
    //get balance 
    let balance = Number(ethers.utils.formatUnits(await signer.getBalance()))

    //check if the chain exists
    if(!CONTRACTS[chainId])
      return

    app.eth.mayClaim = MAYCLAIM[chainId] ? Object.keys(MAYCLAIM[chainId]).map(Number) : []

    //check nfts 
    Object.keys(NFTIDS[chainId]).forEach(cid => checkNFTBalance(cid))

    //get owned nfts  
    let myShards = app.shard.myShards()

    app.UI.main.setState({block, balance, NFT, myShards})
  },4000)
} 

export {EVMManager}
