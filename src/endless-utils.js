const Capitalize = (text)=>{
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const hashPercent = (_hash)=>{
  return hashToDecimal(_hash, 0, 8) / (16 ** 8)
}

const hashToDecimal = (_hash,start,stop)=>{
  return parseInt(_hash.slice(start, stop), 16)
}

const hashPickone = (_hash,arr)=>{
  //random pick from hash 
  let i = arr.length * hashToDecimal(_hash, 0, 8) / (16 ** 8)
  return arr[Math.floor(i)]
}

const hashWeighted = (_hash,what,weights)=>{
  let sums = []
  //sum weights 
  weights.forEach((val,i)=>sums.push(i > 0 ? sums[i - 1] + val : val))
  let maxRange = sums[sums.length - 1]

  //random pick from hash 
  let n = maxRange * hashToDecimal(_hash, 0, 8) / (16 ** 8)
  //determine index based upon n 
  let i = sums.reduce((wi,v,i)=>wi == -1 && n <= v ? i : wi, -1)

  return what[i]
}

const Roll = (dice,RNG=chance)=>{
  if (dice == 1)
    return 1
  let[nd,b] = dice.split("+")
  b = b || 0

  return Number(b) + RNG.rpg(nd, {
    sum: true
  })
}

const DiceTablePick = (table,RNG=chance)=>{
  let roll = Roll(table.dice, RNG)
  let i = Object.keys(table.steps).map(Number).reduce((wi,v)=>wi == -1 && roll <= v ? v : wi, -1)
  return table.steps[i]
}

export {Capitalize, DiceTablePick, Roll, hashWeighted, hashPickone, hashPercent, hashToDecimal}
