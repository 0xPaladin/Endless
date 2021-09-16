//utils
import {Capitalize} from "./endless-utils.js"

const UI = (app)=>{
  let sig = ()=>app.eth.contracts.sig;
  let {h, Component, render, html, Shard} = app.UI;

  class Transfer extends Component {
    constructor() {
      super();
      this.state = {
          gen : "",
          id : 0,
          val : 0
      }
    }
    setSelect = (key,evt)=>{
      let s = {}
      s[key] = event.target.value
      this.setState(s);
    }
    transferToken() {
      let NFT = app.UI.main.state.NFT
      let {data} = this.props
      let {gen, id, val} = this.state 

      let C = sig().TransferCosmic
      
      //handles transfer 
      //transfer(address fromNFT, uint256 fromId, address toNFT, uint256 toId, uint256 val) 
      C.transfer(data.nft, data.id, NFT[gen].address, id, app.eth.parseUnits(val)).then(async tx=>{
        let {hash} = tx

        //log and notification
        let text = "Transfer Submitted: " + hash
        console.log(text)
        app.simpleNotify(text, "info", "center")

        tx.wait(1).then(res=>{
          let text = "Transfer Confirmed: " + res.blockNumber
          console.log(text)
          app.simpleNotify(text, "info", "center")
        }
        )
      }
      )
      console.log(this.props, this.state)
    }
    render({data}, state) {
        let main = app.UI.main
        let {nft, id, what, max} = data

        return html`
            <div class="row mx-2">
              <div class="input-group mb-2">
                <div class="input-group-prepend">
                  <span class="input-group-text">Destination</span>
                </div>
                <select class="custom-select" value=${state.gen} onchange=${(e)=>this.setSelect("gen", e)}>
                  ${Object.keys(main.state.NFT).map(id=>html`<option value=${id}>${id}</option>`)}
                </select>
                <div class="input-group-prepend">
                  <span class="input-group-text">#</span>
                </div>
                <input type="number" class="form-control" min="0" value=${state.id} onInput=${(e)=>this.setSelect("id", e)} />
                <div class="input-group-prepend">
                  <span class="input-group-text">Amt</span>
                </div>
                <input type="number" class="form-control" min="0" max=${max} step="0.01" value=${state.val} onInput=${(e)=>this.setSelect("val", e)} />
                <div class="input-group-append">
                  <button class="btn btn-outline-success" type="button" disabled=${state.val > max} onClick=${()=>this.transferToken()}>Transfer</button>
                </div>
              </div>
            </div>
          `
    }
  }

  class App extends Component {
    constructor() {
      super();
      this.state = {
        shard: {},
        time: Date.now(),
        network: "",
        block: 0,
        address: "",
        nFixed: 0,
        balance: 0,
        cost: 1,
        reveal: 0,
        myShards: [],
        NFT: {},
        gen: "Gen0",
        sid: 0,
        transfer: {},
        tfrVal: 0
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

    setSelect = (key,evt)=>{
      let s = {}
      s[key] = event.target.value
      this.setState(s);
    }

    setAddress(_address, _network) {
      let[id,name,nFixed,cost] = _network

      this.setState({
        address: _address,
        network: name,
        nFixed,
        cost
      });
    }

    setShard(c, id) {
      let shard = app.shard.byContract(c, id)
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
      this.setShard(hash, chance.natural())
    }

    getGenAddress() {
      let {NFT, gen} = this.state
      return NFT[gen] ? NFT[gen].address : ""
    }

    shortAddress() {
      let {address} = this.state
      return address.slice(0, 5) + "..." + address.slice(-4)
    }

    //buy the nft 
    commit(id) {
      let reveal = this.state.reveal
      let {address} = sig()[id]
      let what = reveal != 0 ? "reveal" : "commit"
      let C = sig().ERC721CommitReveal
      let overrides = {
        gasLimit: reveal != 0 ? "500000" : "200000"
      }

      //buy it - handle tx notification
      C[what](address, overrides).then(async tx=>{
        let {hash} = tx

        //log and notification
        let text = [what, id, "submitted:", hash].join(" ")
        console.log(text)
        app.simpleNotify(text, "info", "center")

        tx.wait(1).then(res=>{
          let text = [what, id, "confirmed:", res.blockNumber].join(" ")
          console.log(text)
          app.simpleNotify(text, "info", "center")
        }
        )
      }
      )
    }

    //buy the nft 
    buy(id) {
      let {cost} = this.state
      let {address} = app.eth.contracts[id]
      let C = sig().ERC721Buyer
      let overrides = {
        value: app.eth.parseEther(cost.toString())
      }

      //buy it - handle tx notification
      C.buy(address, overrides).then(async tx=>{
        let {hash} = tx

        //log and notification
        let text = "Buy " + id + " Submitted: " + hash
        console.log(text)
        app.simpleNotify(text, "info", "center")

        tx.wait(1).then(res=>{
          let text = "Buy " + id + " Confirmed: " + res.blockNumber
          console.log(text)
          app.simpleNotify(text, "info", "center")
        }
        )
      }
      )
    }

    //create a buy button for every NFT 
    commitRevealButton() {
      let id = "GenE"
      let {network, reveal, block} = this.state

      let button;
      if (reveal != 0 && block - reveal < 255) {
        button = html`<button type="button" class="btn btn-success btn-block" onClick=${()=>this.commit(id)} disabled=${block - reveal < 7}>Claim a ${id} Shard [gas only]</button>`
      } else {
        button = html`<button type="button" class="btn btn-info btn-block" onClick=${()=>this.commit(id)}>Commit to Claim a ${id} Shard [2 tx, gas only]</button>`
      }
      return button
    }

    claimCosmic(_721, id) {
      let C = sig().ShardCosmicClaim

      //claim it - handle tx notification
      //claim(address nft, uint256 id)
      C.claim(_721, id).then(async tx=>{
        let {hash} = tx

        //log and notification
        let text = "Claim Submitted: " + hash
        console.log(text)
        app.simpleNotify(text, "info", "center")

        tx.wait(1).then(res=>{
          let text = "Claim Confirmed: " + res.blockNumber
          console.log(text)
          app.simpleNotify(text, "info", "center")
        }
        )
      }
      )
    }

    ownedShards() {
      let {myShards, NFT, transfer} = this.state

      let perShard = (key)=>{
        let shard = app.shard.byHash(key)
        let {gen, id, title, _721, _hex} = shard
        let cosmic = NFT["Gen" + gen] ? NFT["Gen" + gen].owned.find(nft=>nft.id == id).cosmic : 0

        return html`
            <div class="row">
                <div class="col" align="left" onClick=${()=>this.setShard(_721, id)}>[g${gen}.${id}] <span class="link">${Capitalize(title)}</span></div>
                <div class="col-1">${_hex.size}</div>
                <div class="col">${cosmic.toFixed(1)} C</div>
                <div class="col-1">
                    <div class="dropdown">
                        <button class="btn btn-light mx-2" type="button" data-toggle="dropdown"><img src="media/md-menu.svg" height="20" width="20"></img></button>
                        <div class="dropdown-menu">
                            <a class="dropdown-item" href="#" onClick=${()=>this.claimCosmic(_721, id)}>Claim Cosmic</a>
                            <a class="dropdown-item" href="#" onClick=${()=>this.setState({
          transfer: {
            nft: _721,
            id,
            what: "Cosmic",
            max: cosmic,
          }
        })}>⇒ Cosmic</a>
                        </div>
                    </div>
                </div>
            </div>
            ${transfer.nft && transfer.nft == _721 && transfer.id == id ? html`<${Transfer} data=${transfer}><//>` : ""}
        `
      }

      let out = html`
        <h3 class="mt-2 mb-0">My Shards</h3>
        <div class="row font-weight-bold">
            <div class="col">Shard</div>
            <div class="col-1">Size</div>
            <div class="col">Cosmic</div>
            <div class="col-1"></div>
        </div>
        ${myShards.map(key=>perShard(key))}
      `

      return myShards.length == 0 ? "" : out
    }

    render(props, {shard, address, network, balance, nFixed, NFT, gen, myShards}) {
      let Gen0 = NFT.Gen0

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
              ${!["FTM", "gETH"].includes(network) ? html`
                <p class="rounded bg-danger text-white p-2" align="center">
                  Endless is not available on this chain. Please change to the Fantom Network.
                </p>
              ` : ""}
              <div class="row">
                ${["FTM"].includes(network) ? html`
                <div class="col">
                    ${this.commitRevealButton()}
                </div>
                ` : ""}
                ${Gen0 ? html`
                <div class="col">
                    <button type="button" class="btn btn-success btn-block" onClick=${()=>this.buy('Gen0')}>Buy a Gen0 Shard [${Gen0.cost} ${network}]</button>
                </div>
                ` : ""}
              </div>
              ${this.ownedShards()}
              <div class="input-group mb-2">
                <div class="input-group-prepend">
                  <span class="input-group-text">View Any Shard</span>
                </div>
                <select class="custom-select" value=${this.state.gen} onChange=${(e)=>this.setSelect("gen", e)}>
                  ${Object.keys(NFT).map(id=>html`<option value=${id}>${id}</option>`)}
                </select>
                <div class="input-group-prepend">
                  <span class="input-group-text">#</span>
                </div>
                <input type="number" class="form-control" min="0" value=${this.state.sid} onChange=${(e)=>this.setSelect("sid", e)} />
                <div class="input-group-append">
                  <button class="btn btn-outline-success" type="button" onClick=${()=>this.setShard(this.getGenAddress(), this.state.sid)}>View</button>
                </div>
              </div>
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
