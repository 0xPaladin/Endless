//ether Random js 
import {random, integer, dice, pickone, weighted, shuffle, abiBytes, keccak256} from "./ETHRandom.js"

const CULTURE = {
  n : 256**5,
  alignment: {
    id: [0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 4],
    text: ["evil", "chaotic", "neutral", "lawful", "good"]
  },
  nPeople : [[1,2,3],[7,2,1]],
  "skillGroups" : {
    "id" : [0,1,2,3,4,5],
    "text" : ["Diplomat","Engineer","Explorer","Rogue","Scholar","Soldier"]
  } 
}

const alignment = (seed)=>{
  return pickone(keccak256(["uint256", "string"], [seed, "alignment"]), CULTURE.alignment.id) 
}

const people = (seed)=> {
  let np = weighted(keccak256(["uint256", "string"], [seed, "nPeople"]), ...CULTURE.nPeople)

  return Array.from({length:np},(v,i)=> keccak256(["uint256", "string","uint256"], [seed, "people", i]))
}

const hashToSeed = (hash) => {
  //seed range is a distribution - 50% < 100; 90% < 1000
  let seedRange = weighted(hash, [100,1000,CULTURE.n], [50,40,10])
  //get seed based upon range
  let _hashSeed = keccak256(["bytes32", "string"], [hash, "seed"])
  return integer(_hashSeed, seedRange)
}

const bySeed = (seed) => {
  let _alignment = alignment(seed)

  let _baseSkills = shuffle(keccak256(["uint256","string"], [seed, "baseSkills"]), CULTURE.skillGroups.id).slice(0,2)

  return {
    seed,
    _people : people(seed),
    _alignment,
    alignment : CULTURE.alignment.text[_alignment],
    _baseSkills,
    baseSkills: _baseSkills.map(id => CULTURE.skillGroups.text[id])
  }
}

const byHash = (hash) => Object.assign({hash}, bySeed(hashToSeed(hash)));

const CultureManager = (app) => {
  app.culture = {}
  let all = app.culture.all = {}
  
  const add = (hash) => {
    all[hash] = byHash(hash)
    return all[hash]
  } 
  const _byHash = app.culture.byHash = (hash) => all[hash] || add(hash);

}


export {CultureManager}

