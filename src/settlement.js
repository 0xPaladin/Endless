//ether Random js 
import {random, integer, dice, pickone, weighted, abiBytes, keccak256} from "./ETHRandom.js"

const ZEROBYTES = "0x0000000000000000000000000000000000000000000000000000000000000000"

const SIZE = {
  id: [0, 0, 0, 0, 1, 1, 1, 2, 2, 3, 3, 4],
  text: ["hamlet", "village", "keep", "town", "city"],
  features: [1, 2, 3, 4, 5],
  problems: [1, 1, 2, 3, 4],
  hamlet: {
    features: ["aspect", "aspect", "landmark", "landmark", "event", "person"],
    problems: ["", "", "resource", "resource", "disease", "threat"]
  }
}

const SettlementManager = (app)=>{
  app.settlement = {}
  let all = app.settlement.all = {}

  const culture = (seed,parent)=>{
    let useParent = integer(keccak256(["bytes32", "string"], [seed, "useParent"]), 2) == 0
    let hash = app.shard.culture(parent)

    return useParent && hash != ZEROBYTES ? hash : keccak256(["bytes32", "string"], [seed, "culture"])
  }

  const size = (seed,parent)=>{
    //get safety of shard - helps set size of settlement
    let {_alignment, _safety, _safeMod} = app.shard.safety(parent)

    let sizeRoll = 1 + integer(keccak256(["bytes32", "string"], [seed, "size"]), 12) + _safety
    let _size = sizeRoll > 12 ? 4 : SIZE.id[sizeRoll - 1]
    let nFeatures = SIZE.features[_size]

    return {
      _size,
      nFeatures
    }
  }

  const byHash = (seed,parent,opts={})=>{
    let _culture = culture(seed, parent)

    let {_size, nFeatures} = size(seed, parent)

    let settlement = {
      _culture,
      _size,
      size: SIZE.text[_size],
      nFeatures,
      problems: [],
      districts: []
    }

    if (opts.app)
      app.active[seed] = settlement
    return settlement
  }

  /*
    Game Functions
  */

  const add = (hash, parent)=>{
    all[hash] = byHash(hash, parent)
    return all[hash]
  }
  let _byHash = app.settlement.byHash = (hash,parent)=>all[hash] || add(hash, parent);

  /*
    UI
  */
  let {h, Component, render, html} = app.UI

  app.settlement.UI = ({data}) => {
    let {what, hash, parent} = data
    let settlement = _byHash(hash, parent)
    let {size, _culture, features} = settlement
    let culture = app.culture.byHash(_culture)
    let {alignment, baseSkills, _people} = culture

    //pull UI function from lifeform.js 
    let cUI = app.lifeform.UI

    return html`
      <div>
        <h5 class="m-0">${size}</h5>
        <div class="px-1">C<sup>${culture.seed}</sup>: ${alignment}; 
          <span class="mx-2">
            <span class="font-green">${baseSkills[0]}</span>/ 
            <span class="font-red">${baseSkills[1]}</span>.
          </span>
          ${_people.map(hash=> html`<${cUI} hash=${hash} i=${-1}><//>`)}
        </div>
      </div>
    `
  }

}

export {SettlementManager}
