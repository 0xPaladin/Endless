//ether Random js 
import {random, integer, dice, pickone, weighted, abiBytes, keccak256} from "./ETHRandom.js"

const ASPECT = ["war/discord","hate/envy","power/strength","trickery/dexterity","time/constitution","lore/intelligence","nature/wisdom","culture/charisma","luck/fortune","love/admiration","peace/balance","glory/divinity"]
const Aspect = (hash) => {
  return pickone(keccak256(["bytes32","string"], [hash, "aspect"]), ASPECT)
}
const ELEMENTS = [["void","death/darkness","fire/metal/smoke","earth/stone/vegetation","water/ice/mist","air/wind/storm","life/light","stars/cosmos"],[1,1,2,2,2,2,1,1]]
const Element = (hash) => {
  return weighted(keccak256(["bytes32","string"], [hash, "element"]), ...ELEMENTS)
}
const MAGIC = ["necromancy","evocation/destruction","evocation/destruction","conjuration/summoning","illusion/glamour","enchantment/artifice","transformation","warding/binding","*element","*element","restoration/healing","divination/scrying"]
const Magic = (_hash) => {
  let hash = keccak256(["bytes32","string"], [_hash, "magic"])
  let m = pickone(hash, MAGIC)
  return m == "*element" ? Element(hash) : m 
}
const ODDITY = ["bright/garish/harsh","geometric/concentric","web/network","crystalline/glassy","fungal/slimy/moldy","gaseous/misty/illusory","volcanic/explosive","magnetic/repellant","multilevel/tiered","absurd/impossible"]
const Oddity = (_hash) => {
  let hash = keccak256(["bytes32","string"], [_hash, "oddity"])
  let roll = 1+integer(hash, 12)
  
  return roll > 10 ? pickone(keccak256(["bytes32","string"], [hash, "one"]), ODDITY)+" & "+pickone(keccak256(["bytes32","string"], [_hash, "two"]), ODDITY) : ODDITY[roll-1]
}

export {Aspect,Element,Magic,Oddity}