//ether Random js 
import {random, integer, dice, pickone, weighted, shuffle, abiBytes, keccak256} from "./ETHRandom.js"
//utils
import {Capitalize} from "./endless-utils.js"
//Tables 
import*as TableGen from "./endless-tables.js"
//Hex

const ZEROBYTES = "0x0000000000000000000000000000000000000000000000000000000000000000"

/*
  Track generation of shards 
*/

const GEN = {
  "base": "But God...",
  "721": {
    "0xB60794c2fcbc7a74672D273F80CE1CA5050435a8": 0
  }
}

/*
  SIZE
*/

const SIZE = {
  ids: [[0, 1, 2, 3, 4], [45, 35, 15, 4, 1]],
  gen: {
    "0": [[0, 1], [1, 1]]
  },
  text: ["small", "sizable", "large", "expansive", "vast"],
  regions: ["1d3+1", "2d6", "3d8", "4d10", "5d12"],
  // avg n = 2, 7, 13, 22, 32
  max: [4, 12, 24, 40, 60],
  safetyM: [1, 3, 6, 11, 16]
}

const Size = (_hash,gen)=>{
  //based on generation 
  let _size = weighted(keccak256(["bytes32", "string"], [_hash, "size"]), ...SIZE.gen[gen])
  //number of regions 
  let _nR = dice(keccak256(["bytes32", "string"], [_hash, "nRegions"]), SIZE.regions[_size]).sum
  //features 
  let _nF = 2 + dice(keccak256(["bytes32", "string"], [_hash, "nFeatures"]), SIZE.regions[_size]).sum
  return {
    _size,
    _nR,
    _nF
  }
}

/*
  SAFETY
*/

const ALIGNMENT = {
  id: [0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 4],
  text: ["evil", "chaotic", "neutral", "lawful", "good"]
}
const SAFETY = {
  id: [0, 1, 1, 2, 2, 2, 2, 2, 2, 3],
  text: ["safe", "unsafe", "dangerous", "perilous"],
  stepCost: [5000, 4000, 2500, 0],
  alignmentMod: [3, 5, 0, -5, -3]
}

const Safety = (seed)=>{
  //first alignment 
  let _alignment = pickone(keccak256(["bytes32", "string"], [seed, "alignment"]), ALIGNMENT.id)

  //next safety based on alignment 
  let safeHash = keccak256(["bytes32", "string"], [seed, "safety"])
  let safeRoll = 1 + integer(safeHash, 12) + SAFETY.alignmentMod[_alignment]
  let _safety = safeRoll < 1 ? 0 : safeRoll > 10 ? 3 : SAFETY.id[safeRoll - 1]
  let _safeMod = 3 - _safety

  return {
    _alignment,
    _safety,
    _safeMod
  }
}

/*
  FEATURES
*/

const FEATURES = {
  what: ["creature", "hazard", "obstacle", "area", "named place", "site", "faction presence", "settlement"]
}

const RESOURCE = ["game/hide/fur", "timber/clay", "herb/spice/dye", "copper/tin/iron", "silver/gold/gems", "magical"]

//dungeons ["caves/caverns", "ruined settlement", "prison", "mine", "crypt/tomb", "lair/den/hideout", "stronghold/fortress", "temple/sanctuary", "archive/laboratory", "origin unknown"]
const SITES = {
  "what": [["dungeon", "lair", "ruin", "outpost", "landmark", "resource"], [2, 2, 2, 2, 2, 2]],
  "lair": [["inhabited ruin", "inhabited cave", "den/burrow/hideout", "hive/aerie/nest", "hovel/hut/encampment", "farmstead/homestead"], [3, 3, 2, 1, 1, 2]],
  "lair.d": [1, 0, 5, 5, 1, 1],
  "ruin": [["tomb/crypt/necropolis", "shrine/temple", "mine/quarry/excavation", "shrine/temple", "ancient outpost", "ancient settlement"], [2, 2, 2, 2, 2, 2]],
  "ruin.d": [4, 7, 0, 7, 6, 1],
  "outpost": [["planar/magical", "faction outpost", "tollhouse/checkpoint", "meeting/trading post", "camp/roadhouse/inn", "tower/fort/base"], [1, 2, 2, 3, 3, 1]],
  "outpost.d": [9, 5, 1, 1, 5, 6],
  "landmark": [["oddity-based", "plant/tree-based", "earth/rock-based", "water-based", "faction-based", "megalith/obelisk/statue", "magical"], [1, 3, 3, 2, 1, 1, 1]],
  "resource": [RESOURCE, [3, 2, 2, 2, 1, 1]]
}
const HAZARD = {
  "unnatural": [["taint/blight/curse", "Magic", "Element", "Aspect"], [5, 4, 2, 1]],
  "natural": [["Oddity", "tectonic/volcanic", "unseen pitfall (chasm, crevasse, abyss, rift)", "ensnaring (bog, mire, tarpit, quicksand, etc.)", "defensive (trap created by local creature /faction)", "meteorological (blizzard, thunderstorm, sandstorm, etc.)", "seasonal (fire, flood, avalanche, etc.)", "impairing (mist, fog, murk, gloom, miasma, etc.)"], [1, 1, 2, 2, 1, 3, 1, 1]]
}
const OBSTACLE = {
  "unnatural": [["Magic", "Element", "Aspect"], [7, 4, 1]],
  "natural": [["Oddity", "defensive (barrier created by local creature /faction)", "impenetrable (cliff, escarpment, crag, bluff, etc.)", "penetrable (dense forest/jungle, etc.)", "traversable (river, ravine, crevasse, chasm, abyss, etc.)"], [1, 2, 3, 3, 3]]
}
const AREA = {
  "unnatural": [["Magic", "Element", "Aspect"], [7, 4, 1]],
  "natural": [["Oddity", "hazard", "obstacle", "hunting/gathering ground of local creature", "claimed as territory by local faction", "difficult terrain (icefield, rocky land, dense forest, etc.)"], [1, 2, 2, 2, 2, 3]]
}
const FACTIONS = {
  types: ["commoner/peasant", "criminal/corrupt", "revolutionary", "military/mercenary", "religious/theological", "craft/guild", "trade/mercantile", "labor/industrial", "nationalist/loyalist", "outsider/foreign", "academic/arcane"],
  typeToSkill: [-1, 3, -1, 5, -1, 1, 1, -1, -1, -1, 3],
  goals: [["hunt/oppose faction", "hunt/oppose creature", "spy/sabotage/infiltrate", "hold territory", "expand territory", "establish outpost/base", "locate/exploit resource", "map territory", "establish/maintain trade", "seek knowledge"], [1, 1, 1, 1, 1, 1, 2, 1, 2, 1]],
  states: [["failing/shrinking", "nascent/incipient", "stable/sustained", "successful/expanding", "dominating"], [3, 2, 4, 2, 1]]
}

const Features = {
  hazard(hash) {
    let uHash = keccak256(["bytes32", "string"], [hash, "unnatural"])
    let unnatural = integer(uHash, 12) == 0 ? weighted(uHash, ...HAZARD.unnatural) : ""
    unnatural = TableGen[unnatural] ? TableGen[unnatural](uHash) : ""

    let nHash = keccak256(["bytes32", "string"], [hash, "natural"])
    let natural = weighted(nHash, ...HAZARD.natural)
    natural = natural == "Oddity" ? "Oddity: " + TableGen.Oddity(nHash) : natural

    return {
      what: [unnatural, natural].join(" ")
    }
  },
  obstacle(hash) {
    let uHash = keccak256(["bytes32", "string"], [hash, "unnatural"])
    let unnatural = integer(uHash, 12) == 0 ? weighted(uHash, ...OBSTACLE.unnatural) : ""
    unnatural = TableGen[unnatural] ? TableGen[unnatural](uHash) : ""

    let nHash = keccak256(["bytes32", "string"], [hash, "natural"])
    let natural = weighted(nHash, ...OBSTACLE.natural)
    natural = natural == "Oddity" ? "Oddity: " + TableGen.Oddity(nHash) : natural

    return {
      what: [unnatural, natural].join(" ")
    }
  },
  area(hash) {
    let uHash = keccak256(["bytes32", "string"], [hash, "unnatural"])
    let unnatural = integer(uHash, 12) == 0 ? weighted(uHash, ...AREA.unnatural) : ""
    unnatural = TableGen[unnatural] ? TableGen[unnatural](uHash) : ""

    let nHash = keccak256(["bytes32", "string"], [hash, "natural"])
    let natural = weighted(nHash, ...AREA.natural)
    //check for oddity and sub generation 
    natural = natural == "Oddity" ? "Oddity: " + TableGen.Oddity(nHash) : this[natural] ? [natural, this[natural](nHash).what].join(": ") : natural

    return {
      what: [unnatural, natural].join(" ")
    }
  },
  site(hash) {
    let what = weighted(hash, ...SITES.what)
    let site = what == "dungeon" ? "dungeon" : weighted(keccak256(["bytes32", "string"], [hash, "site-sub"]), ...SITES[what])
    let gen = ["dungeon", "lair", "ruin", "outpost"].includes(what) ? keccak256(["bytes32", "string"], [hash, "dungeon"]) : null
    let type = gen && SITES[what + ".d"] ? SITES[what + ".d"][SITES[what][0].indexOf(site)] : null

    return {
      what,
      site,
      gen,
      type
    }
  },
  faction(hash, parent) {
    let typeRoll = 1 + integer(hash, 12)
    let what = typeRoll == 12 ? pickone(hash, FACTIONS.types) + " & " + pickone(keccak256(["bytes32", "string"], [hash, "type2"]), FACTIONS.types) : FACTIONS.types[typeRoll - 1]

    let goal = weighted(keccak256(["bytes32", "string"], [hash, "goal"]), ...FACTIONS.goals)
    let state = weighted(keccak256(["bytes32", "string"], [hash, "state"]), ...FACTIONS.states)

    //culture
    let useParent = integer(keccak256(["bytes32", "string"], [hash, "useParent"]), 2) == 0
    let cH = culture(parent)

    //skill 
    let _baseSkills = shuffle(keccak256(["bytes32", "string"], [hash, "skills"]), SKILLGROUPS.id).slice(0, 2)
    if (typeRoll < 12 && FACTIONS.typeToSkill[typeRoll] != -1) {
      _baseSkills[0] = FACTIONS.typeToSkill[typeRoll]
    }

    return {
      what,
      goal,
      state,
      _culture: useParent && cH != ZEROBYTES ? cH : keccak256(["bytes32", "string"], [hash, "culture"]),
      _baseSkills,
      baseSkills: _baseSkills.map(id=>SKILLGROUPS.text[id])
    }
  },
  byIndex(seed, i) {
    let _hash = keccak256(["bytes32", "string", "uint256"], [seed, "feature", i])

    //get safety
    let {_alignment, _safety, _safeMod} = Safety(seed)

    //roll 
    //first two are set 
    let r = i < 2 ? [1, 5 + integer(_hash, 7)][i] : 1 + integer(_hash, 12) + _safeMod

    let what = ""
      , fHash = "";
    if (r <= 4) {
      what = "creature"
    } else if (r == 5) {
      what = "hazard"
    } else if (r == 6) {
      what = "obstacle"
    } else if (r <= 8) {
      what = "area"
    } else if (r <= 11) {
      what = "site"
    } else if (r == 12) {
      what = "faction"
    } else {
      what = "settlement"
    }
    fHash = keccak256(["bytes32", "string"], [_hash, what])

    return {
      i,
      what,
      hash: fHash,
      parent: seed
    }
  }
}

/*  
  CLIMATE TERRAIN
*/
const CLIMATE = {
  id: [0, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 0],
  text: ["frigid", "temperate", "torrid"]
}
const TERRAIN = {
  "boolWater": 4,
  "water": ["deepWater", "shallowWater"],
  0: ["mountains", "mountains", "mountains", "hills", "hills", "forest", "forest", "plains", "plains", "plains", "forest", "forest"],
  1: ["mountains", "mountains", "mountains", "mountains", "mountains", "hills", "forest", "forest", "forest", "swamp", "plains", "plains"],
  2: ["mountains", "mountains", "mountains", "hills", "hills", "forest", "forest", "forest", "swamp", "plains", "plains", "plains"]
}

const ClimateTerrain = (seed)=>{
  let hashClimate = keccak256(["bytes32", "string"], [seed, "climate"])
  let _climate = pickone(hashClimate, CLIMATE.id)

  //check if water 
  let isWater = integer(keccak256(["bytes32", "string"], [seed, "isWater"]), 10) < TERRAIN.boolWater
  let hashTerrain = keccak256(["bytes32", "string"], [seed, "terrain"])
  let _terrain = isWater ? pickone(hashTerrain, TERRAIN.water) : pickone(hashTerrain, TERRAIN[_climate])

  return {
    _climate,
    _terrain,
  }
}

/*
  seed = shard hash seed 
  T = major terrain id from ClimateTerrain()
  n = numer of major hex from Size()
*/
const generateTerrain = (seed,T,n)=>{
  let hash = keccak256(["bytes32", "string"], [seed, "hexTerrain"])

  //lands for sub hex 
  const lands = {
    "deepWater": ["deepWater", "forest", "deepWater", ["swamp", "desert", "hills"]],
    "shallowWater": ["shallowWater", "forest", "forest", ["swamp", "desert", "hills"]],
    "swamp": ["swamp", "plains", "forest", ["shallowWater"]],
    "desert": ["desert", "hills", "plains", ["shallowWater", "mountains"]],
    "plains": ["plains", "forest", "hills", ["shallowWater", "swamp", "desert"]],
    "forest": ["forest", "plains", "hills", ["shallowWater", "swamp", "mountains"]],
    "hills": ["hills", "mountains", "plains", ["shallowWater", "desert", "forest"]],
    "mountains": ["mountains", "hills", "forest", ["shallowWater", "desert"]]
  }
  //major terrain precent 6 out of 10 
  const majTP = 5

  //number of hexes - per major terrain 
  let majT = []
    , i = 0;
  while (majT.length < n) {
    let isMaj = integer(keccak256(["bytes32", "string", "uint256"], [hash, "isMaj", i]), 10) < majTP
    //
    if (isMaj) {
      //add to major T
      majT.push(T)
    } else {
      //weights for terrain selection if not major 
      let MajWt = ["deepWater", "shallowWater"].includes(T) ? [9, 1, 0, 0] : [13, 8, 2, 1]
      let rarity = weighted(keccak256(["bytes32", "string", "uint256"], [hash, "majT", i]), [0, 1, 2, 3], MajWt)
      let t = rarity === 3 ? pickone(keccak256(["bytes32", "string", "uint256"], [hash, "subMajT", i]), lands[T][3]) : lands[T][rarity]
      //add to major T
      majT.push(t)
    }
    //increment
    i++
  }

  //terrain for minor hex
  let minT = majT.map((t)=>{
    let MinWt = ["deepWater", "shallowWater"].includes(t) ? [20, 0, 0, 0] : [13, 8, 2, 1]
    //there are always 25 sub hexes per hex 
    let subt = []
    for (let i = 0; i < 25; i++) {
      let rarity = weighted(keccak256(["bytes32", "string", "uint256"], [hash, "minT", i]), [0, 1, 2, 3], MinWt)
      let st = rarity === 3 ? pickone(keccak256(["bytes32", "string", "uint256"], [hash, "subMinT", i]), lands[t][3]) : lands[t][rarity]
      subt.push(st)
    }

    return subt
  }
  )

  return {
    majT,
    minT
  }
}

const SKILLGROUPS = {
  "id": [0, 1, 2, 3, 4, 5],
  "text": ["Diplomat", "Engineer", "Explorer", "Rogue", "Scholar", "Soldier"]
}
const culture = (seed)=>{
  let hasCulture = integer(keccak256(["bytes32", "string"], [seed, "hasCulture"]), 2) == 1
  return hasCulture ? keccak256(["bytes32", "string"], [seed, "culture"]) : ZEROBYTES
}

const ShardFactory = (app)=>{
  let {d3} = app
  let canvas = d3.select("#display"), bbox, scale;

  //app object 
  app.shard = {
    resource: RESOURCE,
    feature: Features,
    size: Size,
    safety: Safety,
    terrain: ClimateTerrain,
    culture
  }
  let all = app.shard.all = {}

  /*
    Class
  */
  class Shard {
    constructor(_721, id=chance.natural(), opts={}) {
      this._721 = _721
      this.id = id 
      //get gen 
      let gen = this.gen = GEN["721"][_721] || 0
      //hash 
      let hash = this.hash = keccak256(["string", "address", "uint256"], [GEN.base, _721, id])

      //alignment
      let {_alignment, _safety} = Safety(hash)

      //Active safety dependent upon using patrols 
      let _safeMod = 3 - _safety

      //size 
      let {_size, _nR, _nF} = Size(hash, gen)
      let _features = Array.from({
        length: _nF
      }, (v,i)=>{
        return Features.byIndex(hash, i)
      }
      )

      //Hex layout 
      this._hex = new app.hex.Hex({
        seed: hash,
        size: _nR
      })

      //climate and terrain 
      let {_climate, _terrain} = ClimateTerrain(hash, gen)
      let tText = "deepWater" == _terrain ? "Deep Water" : "shallowWater" == _terrain ? "Shallow Water" : _terrain

      //now do terrains
      let {majT, minT} = generateTerrain(hash, _terrain, _nR, gen)
      this._hex._majT = majT.slice()
      this._hex._minT = minT.slice()

      this.is = "region"
      this.opts = opts
      this.seed = hash
      this._alignment = _alignment
      this.alignment = ALIGNMENT.text[_alignment]
      this._safety = _safety
      this.safety = SAFETY.text[_safety]
      this._climate = _climate
      this.climate = CLIMATE.text[_climate]
      this.terrain = tText
      this._size = _size
      this.size = SIZE.text[_size]
      this.sizeMax = SIZE.max[_size]
      this._features = _features
      this._culture = culture(this.seed)
    }
    get title() {
      let {terrain, climate, size, alignment, safety} = this
      return [terrain, climate, size, alignment, safety].join(", ")
    }
    get features() {
      let category = {
        "site": "Sites",
        "hazard": "Sites",
        "obstacle": "Sites",
        "area": "Sites",
        "creature": "Inhabitants",
        "settlement": "Settlements",
        "faction": "Settlements"
      }

      return this._features.reduce((F,f)=>{
        F[category[f.what]].push(f)
        return F
      }
      , {
        "Sites": [],
        "Inhabitants": [],
        "Settlements": []
      })
    }
    /*
      @param ri - index of region to focus on
      @param z - zoom : 0 to 3
    */
    canvasDisplay(ri=0, z=0) {
      canvas = d3.select("#display")

      let Hex = this._hex
      bbox = Hex.bbox
      let w = bbox[2] - bbox[0]
      let h = bbox[3] - bbox[1]
      //get canvas dimensions for compare
      let cw = window.innerWidth < canvas.node().width ? window.innerWidth : canvas.node().width
      let ch = window.innerHeight < canvas.node().height ? window.innerHeight : canvas.node().height
      //find min scale dimensions
      scale = cw / w < ch / h ? cw / w : ch / h
      //new dimension 
      let newD = cw < ch ? cw : ch
      if (newD < 800) {
        canvas.attr("width", newD).attr("height", newD)
      }

      let tH = Hex.threeHex()

      //canvas context
      let ctx = canvas.node().getContext("2d")
      //reset & clear
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, cw, ch)
      //translate/scale accordingly
      ctx.scale(scale, scale);
      ctx.translate(-bbox[0], -bbox[1]);

      //heightmap colors 
      let hexDraw = app.hex.draw
      let hColor = d3.scaleSequential(d3.interpolateRdYlGn)
      //run hexes 
      tH.forEach((hex,i)=>{
        hexDraw(ctx, hex.points)
        ctx.fillStyle = ["deepWater", "shallowWater"].includes(hex.t) ? "aqua" : hColor(1 - (hex.h - 1) / 30)
        ctx.fill()
      }
      )

      //remove spinner
      d3.select("#spinner").attr("class", "lds-dual-ring hidden")
      //handle click 
      canvas.node().removeEventListener("click tap", canvasClick)
      canvas.on("click tap", canvasClick)
    }
  }

  /*
    Game Functions
  */

  const add = (_721, id, hash)=>{
    all[hash] = new Shard(_721, id)
    return all[hash]
  }

  const byContract = app.shard.byContract = (_721, id) => {
    //hash 
    let hash = keccak256(["string", "address", "uint256"], [GEN.base, _721, id])
    return all[hash] || add(_721, id,hash)
  }
  app.shard.byHash = (hash) => all[hash]; 

  /*
    UI
  */
  let {h, Component, render, html} = app.UI

  //main Shard UI
  class UIShard extends Component {
    constructor() {
      super();
    }
    render({shard}, state) {
      let sites = shard.features ? shard.features.Sites : []
      let ppl = shard.features ? shard.features.Inhabitants : []
      let stlmt = shard.features ? shard.features.Settlements : []

      return html`
        <div>
          <h3 class="m-0" align="left">${shard.title ? Capitalize(shard.title) : ""}</h3>
          <div class="mx-2 font-sm" align="left">Gen ${shard.gen} #${shard.id}, ${shard.hash}</div>
          <div class="row mx-1" align="left">
              <${UISites} sites=${sites}><//>
              <${UIInhabitants} ppl=${ppl}><//>
              <${UISettlements} all=${stlmt}><//>
          </div>
          <canvas id="display" height="600" width="600"></canvas>
        </div>
      `;
    }
  }
  app.UI.Shard = UIShard

  /*
    Settlements
  */
  function UISettlements({all}) {   
    let setUI = app.settlement.UI

    return html`
      <div class="col rounded bg-light p-2 m-1">
        <h4 class="m-0">Settlements</h4>
        <div>
          ${all.map(s=> {
            if(s.what == "faction") 
              return html`<${UIFaction} data=${s}><//>`
            else if(s.what == "settlement") 
              return html`<${setUI} data=${s}><//>`
          })}
        </div>
      </div>
    `;
  }

  const UIFaction = ({data}) => {
    let {what, hash, parent} = data
    let faction = Features.faction(hash, parent)
    let {state, goal, _culture} = faction
    let culture = app.culture.byHash(_culture)
    let {alignment, baseSkills, _people} = culture

    //pull UI function from creature.js 
    let cUI = app.creature.UI
    
    return html`
      <div>
        <h5 class="m-0">Faction</h5>
        <div>${faction.what}, ${state}, ${goal}</div>
        <div class="px-1">C${culture.seed}: ${alignment}; +${baseSkills[0]}/-${baseSkills[1]}</div>
        ${_people.map(hash=> html`<${cUI} hash=${hash}><//>`)}
      </div>
    `
  }

  /*
    Inhabitants
  */
  function UIInhabitants({ppl}) {
    //pull UI function from creature.js 
    let cUI = app.creature.UI

    return html`
      <div class="col rounded bg-light p-2 m-1">
        <h4 class="m-0">Inhabitants</h4>
        <div>
          ${ppl.map(p=> html`<${cUI} hash=${p.hash}><//>`)}
        </div>
      </div>
    `;
  }

  /*
    Site UI 
  */

  //Site Subsection UI
  function UISites({sites}) {
    return html`
      <div class="col rounded bg-light p-2 m-1">
        <h4 class="m-0">Sites</h4>
        <div>
          ${sites.map(site=> html`<${UISite} data=${site}><//>`)}
        </div>
      </div>
    `;
  }
   
  //individual site UI
  const UISite = ({data})=>{
    let {what, hash, parent} = data
    let site = Features[what](hash, parent)

    if (['area', 'hazard', 'obstacle'].includes(what)) {
      return html`<div>${Capitalize(what)}, ${site.what}</div>`
    } else {
      return html`<div>${site.what == 'dungeon' ? Capitalize(site.what) : Capitalize(site.what) + ': ' + site.site}</div>`
    }
  }

  
  /*
    Canvas Functionality
  */

  //set up click 
  function canvasClick() {
    ///delta conversion - r display to r of outlands
    let coords = d3.mouse(this)
    let x = bbox[0] + coords[0] / scale
      , y = bbox[1] + coords[1] / scale;
    let hi = app.planes.within(x, y)
    app.planes.clickFind(hi)
  }

}

export {ShardFactory}
