//ether Random js 
import {random, integer, dice, pickone, weighted, shuffle, abiBytes, keccak256} from "./ETHRandom.js"

//utils
import {Capitalize, Roll} from "./endless-utils.js"
import*as TableGen from "./endless-tables.js"


const LIFEFORM = {
  "base": ["Human","Humanoid","Animal","Artificial","Alien"],
  "Humanoid": {
    "what" : [["rare", "uncommon", "common"], [2, 3, 7]],
    "rare" : [["UndeadMajor","Animal","Werebeast","tiny"],[2,5,2,3]],
    "uncommon" : [["large","UndeadMinor","small","Animal"],[3,3,3,3]],
    "common" : [["","small"],[7,5]]
  }, 
  "Animal": {
    "forms": [["w", "a", "e"], [2, 3, 7]],
    "wae": {
      "w": ['whale/narwhal', 'squid/octopus', 'dolphin/shark', 'alligator/crocodile', 'turtle', 'crab/lobster', 'fish', 'predatory fish', 'frog/toad', 'eel/snake', 'oyster/snail', 'jelly/anemone', 'insect/barnacle', 'amorphous', 'grass/vine', 'geometric/illusion'],
      "a": ['pteranadon', 'condor', 'eagle/owl', 'hawk/falcon', 'crow/raven', 'crane/stork', 'gull/waterbird', 'songbird/parrot', 'chicken/duck', 'bee/wasp', 'beetle', 'butterfly', 'locust/dragonfly', 'fly/mosquito', 'gaseous/web', 'particles'],
      "e": ['dinosaur/megafauna', 'elephant', 'ox/rhinoceros', 'bear/ape', 'deer/horse', 'lion/panther', 'wolf/boar', 'snake/lizard', 'rat/weasel', 'ant/centipede', 'slug/worm', 'beetle/beetle/termite/tick', 'tree/tree/bush/fungus', 'flower/grass/vine/cactus', 'amorphous/geometric', 'cubic/crystalline']
    },
  },
  "Monster": {
    "what": [["legendary", "supernatural", "fearsome"], [1, 2, 9]],
    "legendary": [["Oddity+huge", "Titan+Color", "Animal+Titan", "Titan", "Animal+huge"], [2, 2, 2, 3, 3]],
    "supernatural": [["OutsiderMajor", "Elemental", "Outsider", "UndeadMajor"], [1, 3, 4, 4]],
    "fearsome": [["Animal+Ability", "Animal+Oddity", "Animal+Animal", "slime/ooze", "plant/fungus"], [3, 2, 2, 3, 2]],
  },
  "Human" : {
    "size" : [2,6,2]
  },
  "Titan" : ["Dragon","Titan"],
  "Undead" : {
    "form" : [["Animal","Humanoid"],[1,3]],
    "major" : [["lich","vampire","ghost","mummy"],[1,2,1,1]],
    "minor" : [["skeleton","zombie","wight","wisp","wraith"],[2,2,2,1,2]]
  },
  "size" : {
    "id" : [0,1,1,2,2,2,2,2,2,3,3,4],
    "text" : ["tiny", "small", "medium", "large", "huge"]
  },
  "nApp" : {
    "id" : [
      [0,1,1,1,1,1,1,2,2,2,2,2],
        [0,0,1,1,1,1,1,1,1,2,2,2],
        [0,0,0,0,1,1,1,1,1,1,2,2],
        [0,0,0,0,0,0,0,0,0,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,1]
    ],
    "text" : ["solitary", "group", "throng"],
    "qty": [1, "1d6+1", "3d6+5"]
  },
  "hp": [[4, 2, 1], [6, 3, 2], [8, 6, 4], [16, 12], [32, 24]],
  "dmg": [["1d3", "1d2", 1], ["1d6", "1d4", "1d3"], ["1d8", "1d6", "1d6"], ["1d10", "1d8"], ["2d6", "1d10"]],
  "armor": [[0, 1, 2, 3, 4, 5], [40, 30, 20, 10, 5, 1]],
  "unique" : {
    "p" : [[0,1,2,3,4,5],[2,4,8,6,4,1]],
    "hpMod" : [0.5,0.75,1,1.5,2,4],
    "dmgMod" : [-2,-1,0,1,2,3]
  },
  "skillGroups" : {
    "id" : [0,1,2,3,4,5],
    "text" : ["Diplomat","Engineer","Explorer","Rogue","Scholar","Soldier"]
  } 
}

const SIZES = ["tiny", "small", "medium", "large", "huge"]

const Lifeform = { 
  size (hash) {
    return LIFEFORM.size.id[integer(keccak256(["bytes32","string"], [hash, "size"]),12)]
  },
  nApp (hash, size) {
    return LIFEFORM.nApp.id[size][integer(keccak256(["bytes32","string"], [hash, "nApp"]),12)]
  },
  skillMods (hash){
    //boost 
    let b = integer(keccak256(["bytes32","string"], [hash, "stat-boost"]),6)
    //penalty 
    let _p = 1 + integer(keccak256(["bytes32","string"], [hash, "stat-penalty"]),5)
    let p = b+_p > 5 ? b+_p-6 : b+_p;   
    return [b,p]
  },
  Werebeast (_hash) {
    let hash = keccak256(["bytes32","string"], [_hash, "werebeast"])
    let what = this.Animal(hash)

    return {
      "is" : "werebeast",
      "what" : what.what + " Werebeast"
    }
  },
  UndeadForm (_hash) {
    let hash = keccak256(["bytes32","string"], [_hash, "undeadForm"])

    let _what = weighted(hash, ...CREATURE.Undead.form)
    let what = "Humanoid"

    if(_what == "Animal") {
      what = this.Animal(keccak256(["bytes32","string"], [hash, "animal"])).what
    }

    let hashSize = keccak256(["bytes32","string"], [hash, "size"])
    let hashNApp = keccak256(["bytes32","string"], [hash, "nApp"])

    let _size = _what == "Animal" ? weighted(hashSize, [0, 1, 2, 3, 4], CREATURE.size.p) : weighted(hashSize, [1, 2, 3], [3,6,3])
    let _nApp = weighted(hashNApp, [0, 1, 2], CREATURE.nApp.p[_size])

    return {
      what, 
      _size,
      _nApp
    }    
  },
  UndeadMajor (_hash) {
    let hash = keccak256(["bytes32","string"], [_hash, "undeadMajor"])

    let {what, _size, _nApp} = this.UndeadForm(hash)
    let undead = weighted(hash, ...CREATURE.Undead.major)    

    return {
      "is" : "undead",
      what : what + " " + undead,
      _size,
      _nApp
    }
  },
  UndeadMinor (_hash) {
    let hash = keccak256(["bytes32","string"], [_hash, "undeadMinor"])

    let {what, _size, _nApp} = this.UndeadForm(hash)
    let undead = weighted(hash, ...CREATURE.Undead.minor)

    return {
      "is" : "undead",
      what : what + " " + undead,
      _size,
      _nApp 
    }
  },
  Titan (_hash) {
    let hash = keccak256(["bytes32","string"], [_hash, "titan"])
    let what = pickone(hash, CREATURE.Titan)

    return {
      "is" : "Titan",
      what
    }
  },
  AnimalType (_hash) {
    let hash = keccak256(["bytes32","string"], [_hash, "animal"])
    let wae = weighted(hash, ...LIFEFORM.Animal.forms)

    let hashForm = keccak256(["bytes32","string"], [hash, "form"])
    return {
      "is" : "animal",
      "what" : pickone(hashForm, LIFEFORM.Animal.wae[wae]),
    }
  },
  Animal (hash) {
    let _size = this.size(hash)
    let _nApp = this.nApp(hash, _size)

    return {
      "what" : Capitalize(this.AnimalType(hash).what),
      _size,
      _nApp,
      armor : weighted(keccak256(["bytes32","string"], [hash,"armor"]), ...LIFEFORM.armor)
    }
  },
  Artificial (hash) {
    let _size = this.size(hash)
    let _nApp = this.nApp(hash, _size)
    
    return {
      "what" : "Artificial",
      _size,
      _nApp,
      armor : weighted(keccak256(["bytes32","string"], [hash,"armor"]), ...LIFEFORM.armor)
    }
  },
  Alien (hash) {
    let _size = this.size(hash)
    let _nApp = this.nApp(hash, _size)

    return {
      "what" : "Alien",
      _size,
      _nApp,
      armor : weighted(keccak256(["bytes32","string"], [hash,"armor"]), ...LIFEFORM.armor)
    }
  },
  Humanoid(hash) {    
    let _size = this.size(hash)
    let _nApp = this.nApp(hash, _size)

    return {
      "what" : "Humanoid",
      _size,
      _nApp,
      armor : 0
    }
  },
  Human(hash) {
    let _size = 2
    let _nApp = this.nApp(hash, _size)

    return {
      "what" : "Human",
      _size,
      _nApp,
      armor : 0,
    }
  },
  /*
    Format final object
  */
  format (fHash, base, seed) {
    let _is = LIFEFORM.base[base]
    let hash = keccak256(["string","uint256"], [_is,seed])

    //basic lifeform data 
    let data = this[_is](hash)
   
    let _baseSkills = this.skillMods(hash).slice()

    let {_nApp,_size} = data

    //log check - TODO remove
    if(!data.what || data.what == "") console.log(data)

    let formatted = {
      is : _is,
      seed, 
      size: LIFEFORM.size.text[_size],
      nApp: LIFEFORM.nApp.text[_nApp],
      qty : LIFEFORM.nApp.qty[_nApp],
      hp: LIFEFORM.hp[_size][_nApp],
      dmg: LIFEFORM.dmg[_size][_nApp],
      baseSkills: _baseSkills.map(id => LIFEFORM.skillGroups.text[id])
    }

    return Object.assign({
      n() {
        return this.qty == 1 ? 1 : Roll(this.qty)
      }
    },data,formatted)
  },
  unique (hash) {

  }, 
  /* Generate 
    generate creature from seed 
  */
  byHash(hash, v=0) {
    const SEEDMAX = 256 ** 4
    //first is the base form of the creature
    let bp = integer(hash,100)
    let base = bp < 10 ? 0 : bp < 35 ? 1 : bp < 60 ? 2 : bp < 80 ? 3 : 4;

    //next is the seed for the type
    let rp = integer(keccak256(["bytes32", "string"], [hash, "seed-distribution"]),100)
    //seed range is a distribution - 50% < 100; 90% < 1000
    let _rangeMax = rp < 50 ? 100 : rp < 90 ? 1000 : SEEDMAX;
    //get seed based upon range
    let seed = integer(keccak256(["bytes32", "string"], [hash, "seed"]), _rangeMax)

    return this.format(hash, base, seed)
  }
}

const LifeformManager = (app) => {
  let sig = ()=>app.eth.contracts.sig;

  app.lifeform = {}
  let all =  app.lifeform.all = {}
  
  const add = (hash) => {
    all[hash] = Lifeform.byHash(hash)
    return all[hash]
  } 
  const byHash = app.lifeform.byHash = (hash) => all[hash] || add(hash);

  /*
    UI 
  */
  let {h, Component, render, html} = app.UI

  //submit claim 
  const EVMClaim = (nft, id, fi) => {
    if (app.net.chainId == "250") return

    let F = sig().ShardAlly.claim 
    let calldata = [id, fi]

      //claim it - handle tx notification
      //transfer
      F(...calldata).then(tx => app.eth.handleTx(tx,"Claim Ally").then( _ => {
        
      }))
  }

  const AllyClaim = (mayClaim, i, _creature) => {
    if(!mayClaim) return
    
    let modal = app.UI.modal
    let {_721, id, _features, _cosmic} = app.UI.Shard.props.shard
    let cost = [10,5,3][_creature._nApp]

    let body = html`
    <div align="center">
      <h5 align="left">Claim Ally: ${Capitalize(_creature.what)}</h5>
      <div class="d-flex justify-content-between">
        <div>Cost: ${cost}</div> 
      </div>
      <button class="btn btn-success mx-1" type="button" data-dismiss="modal" onClick=${()=>EVMClaim(_721, id, i)} disabled=${cost>_cosmic}>Yes</button>
      <button class="btn btn-light mx-1" type="button" data-dismiss="modal">No</button>
    </div>
    `

    //set modal and call 
    modal.setState({body})
    $('#mainModal').modal()
  }

  app.lifeform.UI = ({i,hash}) => {
    let shard = app.UI.Shard.props.shard
    let claimTime = i > -1 ? shard._features[i].claimTime : 0

    let _creature = byHash(hash)
    let {seed, what, size, nApp, baseSkills} = _creature 

    //claim conditions 
    let _mayClaim = i>-1 && shard.isOwned && (claimTime == 0 || (Date.now()/1000 - claimTime) > (60*60*24))
    let timer = shard.isOwned && i>-1 && !_mayClaim ? "🕐" : ""

    return html`
      <div onClick=${()=>AllyClaim(_mayClaim,i,_creature)}>
        <span>
          <span class=${_mayClaim ? 'link' : ''}>${timer} ${Capitalize(what)}</span>
          <span class="mx-1 font-sm">
            (${size}, ${nApp})
            [<span class="font-green">${baseSkills[0]}</span>/ 
            <span class="font-red">${baseSkills[1]}</span>].
          </span>
        </span>
      </div>
    `
  }
}

export {LifeformManager}
