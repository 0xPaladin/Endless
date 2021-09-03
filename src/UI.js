const UI = (app)=>{
  let {h, Component, render, html, Shard} = app.UI

  class App extends Component {
    constructor() {
      super();
      this.state = {
        shard: {},
        time: Date.now(),
        network: "",
        address: "",
        nFixed : 0,
        balance : 0,
        cost : 1,
        NFT : {},
        viewShard : ""
      };
    }

    // Lifecycle: Called whenever our component is created
    componentDidMount() {
      app.UI.main = this
      // update time every second
      this.timer = setInterval(()=>{
        this.setState({
          time: Date.now()
        });
      }
      , 1000);
    }

    // Lifecycle: Called just before our component will be destroyed
    componentWillUnmount() {
      // stop when not renderable
      clearInterval(this.timer);
    }

    setViewShard = (event) => {
      this.setState({viewShard: event.target.value});
    }

    setBalance(balance) {
      this.setState({balance});
    }

    setAddress(_address, _network) {
      let [id,name,nFixed,cost] = _network

      this.setState({
        address: _address,
        network: name,
        nFixed,
        cost
      });
    }

    setNFT(NFT) {
      this.setState({NFT});
    }

    setShard (hash) {
      let shard = app.shard.byHash(hash);
      this.setState({
        shard
      });
      shard.canvasDisplay(0, 0)
      console.log(shard)
    }

    genShard() {
      let hash = "0x" + chance.hash({
        length: 40
      })
      let shard = app.shard.byContract(hash, chance.natural()) 
      this.setShard(shard.hash)
    }

    shortAddress () {
      let {address} = this.state
      return address.slice(0,5)+"..."+address.slice(-4)
    }

    //buy the nft 
    buy (id) {
      let {cost} = this.state
      let {address} = app.eth.contracts[id]
      let C = app.eth.contracts.ERC721Buyer
      let overrides = {
        value : app.eth.parseEther(cost.toString())
      }

      //buy it - handle tx notification
      C.buy(address,overrides).then(async tx => {
        let {hash} = tx
        console.log("Buy "+id+" Submitted: "+hash)

        tx.wait(1).then(res => {
          console.log("Buy "+id+" Confirmed: "+res.blockNumber)
        })
      })
    }

    //create a buy button for every NFT 
    buyButtons (id) {
      let {cost, network, balance, NFT} = this.state
      let [max,n,nOwned,owned] = NFT[id]
      let button = html`<button type="button" class="btn btn-success btn-block my-2" onClick=${() => this.buy(id)}>Buy a ${id} Shard [${cost} ${network}] [${max-n} remain] </button>`
      return balance >= cost ? button : ""
    }

    //select list for owned nfts 
    nftList () {
      let list = Object.values(this.state.NFT).map(e => e[3]).flat().map(app.shard.byHash)
      //provide nothing if no claims 
      if(list.length == 0) return

      return html`
        <div class="input-group mb-2">
          <div class="input-group-prepend">
            <span class="input-group-text" id="basic-addon1">My Shards</span>
          </div>
          <select class="custom-select" value=${this.state.viewShard} onChange=${this.setViewShard}>
            ${list.map(shard => html`
              <option value=${shard.hash}>Gen ${shard.gen} #${shard.id}</option>
            `)}
          </select>
          <div class="input-group-append">
            <button class="btn btn-outline-success" type="button" onClick=${() => this.setShard(this.state.viewShard)}>View</button>
          </div>
        </div>
      ` 
    }

    render(props, {shard, address, network, balance, nFixed, NFT}) {
      return html`
          <div class="app">
            <div class="d-flex justify-content-between align-items-center">
              <h1 class="m-1 p-1">Endless</h1>
              <div class="mx-2" align="center">
                <span class="rounded bg-light p-2 mx-1">${balance.toFixed(nFixed)} ${network}</span> 
                <span class="rounded bg-light p-2 mx-1">${this.shortAddress()}</span>
              </div>
            </div>
            <div class="container" align="center">
              <p class="rounded bg-light px-2" align="left">Countless worlds were shattered at the end of the last cosmic war. 
                Saved from total destruction, these shards now float in a dimension known as 
                the Outlands.
              </p>
              <p class="rounded bg-light px-2" align="left">Shards vary in size, shape, climate, terrain, population, ruins and much more. 
                Part game, part generative art - this site let's you claim randomly generated shards.  
                Each is represented by a unique 64 character hexadecimal string that the site 
                uses to generate the same shard every time.
              </p>
              ${!["FTM","gETH"].includes(network) ? html`
                <p class="rounded bg-danger text-white p-2" align="center">
                  Endless is not available on this chain. Please change to the Fantom Network.
                </p>
              ` : ""}
              ${Object.keys(NFT).map(id => this.buyButtons(id))}
              ${this.nftList()}
              <${Shard} shard=${shard}><//>
            </div>
          </div>
        `;
    }
  }

  const Header = ({name})=>html`<h1>${name} List</h1>`

  const Footer = props=>html`<footer ...${props} />`

  render(html`<${App}/>`, document.body);

}

export {UI}
