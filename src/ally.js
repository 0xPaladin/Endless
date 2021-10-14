//ether Random js 
import {random, integer, dice, pickone, weighted, shuffle, abiBytes, keccak256} from "./ETHRandom.js"

const GENBASE = "But God..."

const AllyFactory = (app)=>{
  let decode = app.eth.decode
  //app object 
  app.ally = {}
  let all = app.shard.all = {}

  /*
    Class
  */
  class Ally {
    constructor (_721, id = 0, opts = {}) {
      this._721 = _721
      this.id = id 

      this.nftid = keccak256(["address", "uint256"], [_721, id])
      //hash 
      this.key = keccak256(["string", "address", "uint256"], [GENBASE, _721, id])
      let hash = this.hash = opts.hash || this.key

      //is owned
      this.isOwned = opts.isOwned || false 
    }
    get people () {
      let [base,seed,culture] = decode(["uint256","uint256","bytes32"],this._people)
      return {
        base : base.toNumber(),
        seed : seed.toNumber(),
        culture
      }
    }
  }

  /*
    Game Functions
  */

  const add = (_721, id, key, opts)=>{
    all[key] = new Ally(_721, id, opts)
    return all[key]
  }

  const byContract = app.ally.byContract = (_721, id, opts) => {
    id=Number(id)
    //hash 
    let key = keccak256(["string", "address", "uint256"], [GENBASE, _721, id])
    return all[key] || add(_721, id, key, opts)
  }
  app.ally.byHash = (hash) => all[hash];
  app.ally.myAllies = () => Object.values(all).filter(s => s.isOwned).map(s => s.key);

  /*
    UI
  */

  let {h, Component, render, html, Shard} = app.UI;
  let sig = ()=>app.eth.contracts.sig;

  const AllySingle = ({key}) => {
    let {id} = all[key]

    return html`
    <div>Ally ${id}</div>
    `
  }

  //main Shard UI
  class UIAlly extends Component {
    constructor() {
      super();
    }
    // Lifecycle: Called whenever our component is created
    componentDidMount() {
      app.UI.Ally = this
    }
    render(props, state) {
      let _allies = app.ally.myAllies()

      return html`
        <div>
          <h3 class="m-0">Allies</h3>
          <div>${_allies.map(key => AllySingle({key}))}</div>
        </div>
      `;
    }
  }
  app.UI.Ally = UIAlly
}

export {AllyFactory}
