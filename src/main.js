//localforage
import "../lib/localforage.1.7.1.min.js"
//chance
import "../lib/chance.min.js"

//Preact
import {h, Component, render} from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// Initialize htm with Preact
const html = htm.bind(h);

//ethereum 
import {EVMManager} from "./eth.js"

//Main APP object
let app = {
  d3,
  chance: new Chance(),
  //Save db for Indexed DB - localforage
  DB: localforage.createInstance({
    name: "Endless",
  }),
  //name generator
  //names: generateNames(),
  UI: {
    h, Component, render, html
  },
  _rarity: [1048576, 1572864, 1835008, 1966080, 2031616, 2064384, 2080768, 2088960, 2093056, 2095104, 2096128, 2096640, 2096896, 2097024, 2097088, 2097120, 2097136, 2097144, 2097148, 2097150],
  rarity(hash) {
    let r = parseInt(hash.slice(2, 8), 16) % (2097150)
    return 1 + this._rarity.findIndex(v=>r < v)
  },
  init() {
  },
  // ----------- NOTIFY ------------------------------ //
  notify(text, opts) {
    let {layout="bottomCenter", type="info", timeout=1000, buttons=[]} = opts
    new Noty({
      text,
      layout,
      type,
      timeout,
      theme: "relax",
      buttons
    }).show()
  },
  simpleNotify(text, type="info", layout="center") {
    this.notify(text, {
      type,
      timeout: 2500,
      layout
    })
  },
}

EVMManager(app)

//People / Creatures
import {CreatureManager} from "./creature.js"
CreatureManager(app)

//Culture
import {CultureManager} from "./culture.js"
CultureManager(app)

//Settlement
import {SettlementManager} from "./settlement.js"
SettlementManager(app)

//handle hex creation
import {HexFactory} from "./hex.js"
HexFactory(app)

//handle shard creation
import {ShardFactory} from "./shard.js"
ShardFactory(app)

//UI
import {UI} from "./UI.js"
UI(app)

app.UI.main.genShard()