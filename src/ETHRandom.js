//ethers js 
import {ethers} from "../lib/ethers-5.0.min.js"
const BN = ethers.BigNumber
let utils = ethers.utils

const abiBytes = (types, data) => {
  return utils.defaultAbiCoder.encode(types, data)
}
const keccak256 = (types, data) => {
  return utils.keccak256(abiBytes(types, data))
}

const integer = (hash, max) => {
  return BN.from(hash).mod(max).toNumber()
}

const random = (hash) => {
  const max = 16**5
  let mod = BN.from(hash).mod(max).toNumber()
  return mod/max
}

//console.log(Array.from({length:100},()=>integer("0x"+chance.hash(), 256**4)))

const d = (hash, _d) => {
  return 1+integer(hash, max)
}

const dice = (hash, ndb) => {
  let [nd,b=0] = ndb.split("+")
  let [n,d] = nd.split("d")
  let sum = Number(b)+0, r = [];

  for(let i = 0; i < Number(n); i++){
    let rHash = keccak256(["bytes32","uint256"],[hash,i])
    let _r = 1+integer(rHash, Number(d))
    sum+=_r
    r.push(_r)
  }

  return {r,sum}
}

const shuffle = (hash, arr) => {
  let _arr = arr.slice()

  for (let i = arr.length-1; i > 0; i--) {
    let _hash = keccak256(["bytes32","uint256"],[hash,i]);
    let j = integer(_hash, i+1);
    [_arr[i],_arr[j]] = [_arr[j],_arr[i]]
  }

  return _arr
}

//console.log(shuffle("0x"+chance.hash({length:64}),[1,2,3,4,5,6]))

const pickone = (hash, arr) => {
  let i = integer(hash, arr.length)
  return arr[i]  
}

const weighted = (hash, arr, p) => {
  let n = p.length;
  let pSum = [];

  for(let i = 0; i < n; i++){
    pSum[i] = p[i] + (i==0 ? 0 : pSum[i-1])  
  }

  let rand = integer(hash, pSum[n-1])
  let j = -1;
  for(let i = 0; i < n; i++){
    if(rand <= pSum[i]) {
      j = i;
      break;
    }
  }

  return arr[j]       
}

//keccak256(["address","uint256"], [contract, id])

export {random, integer, dice, pickone, weighted, shuffle, abiBytes, keccak256}