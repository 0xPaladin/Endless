/*
  Much taken from Redblob Gams 
*/

const AXIALNEIGHBORS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]]
const AXIALSUBHEX = [[2, -3], [-1, -2], [0, -2], [1, -2], [2, -2], [-1, -1], [0, -1], [1, -1], [2, -1], [3, -1], [0, 0], [-2, 0], [-1, 0], [1, 0], [2, 0], [-3, 1], [-2, 1], [-1, 1], [0, 1], [1, 1], [-2, 2], [-1, 2], [0, 2], [1, 2], [-2, 3]]

let hexNeighbors = (q,r)=>{
  return AXIALNEIGHBORS.map(n=>[n[0] + q, n[1] + r])
}
let subQR = (q,r)=>{
  //calculate sub hex qr 
  return AXIALSUBHEX.map(qr=>[(q*5) + qr[0], (r*5) + qr[1]])
}

let hexPoints = (c,R)=>{
  let a, arad, p = [];
  for (let i = 0; i < 6; i++) {
    a = 60 * i - 30
    arad = a * Math.PI / 180
    p.push([c.x + R * Math.cos(arad), c.y + R * Math.sin(arad)])
  }
  return p
}

let hexCentroid = (q,r,R)=>{
  return {
    x: R * (Math.sqrt(3) * q + r * Math.sqrt(3) / 2),
    y: R * r * 3 / 2
  }
}

let hexPlacement = (q,r,R)=>{
  let c = hexCentroid(q, r, R)

  return {
    _qr: [q, r],
    qr: [q, r].join(","),
    centroid: c,
    R : R,
    points: hexPoints(c, R),
    neighbors: hexNeighbors(q,r),
    _subQR: subQR(q,r)
  }
}

let generateHexes = (seed,n)=>{
  let RNG = new Chance(seed)
  let hexids = ["0,0"]

  //pick random neighbors to build hex area
  let current = [0, 0]
  let next = null
  let N = null
  while (hexids.length < n) {
    N = hexNeighbors(...current)
    next = RNG.pickone(N)
    if (!hexids.includes(next.join(",")))
      hexids.push(next.join(","))

    //now reset
    next = null
    current = RNG.pickone(hexids).split(",").map(Number)
  } 

  //have to turn back into array
  return hexids.map(qr=>qr.split(",").map(Number))
}

let hexDraw = (ctx, points) => {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for(let i = 1; i < points.length; i++){
    ctx.lineTo(...points[i]);  
  }
  ctx.closePath();
}

let HexFactory = (app)=>{

  /*
    Core Class
  */

  class Hex {
    constructor(opts) {
      opts = opts || {}

      this.seed = opts.seed || chance.hash()
      this.size = opts.size || 25
      this.R = opts.R || 20

      //generate hex qr 
      this._hexqr = generateHexes(this.seed, this.size)

      //major hexes
      this._major = this._hexqr.map(qr => hexPlacement(...qr, this.R))

      //create noise for elevation
      this._noise = new SimplexNoise(this.seed)
    }
    get bbox() {
      //get bounding box 
      let R = this.R*1.2
      return this._major.reduce((b,h)=>{
        if (h.centroid.x - R < b[0])
          b[0] = h.centroid.x - R
        if (h.centroid.y - R < b[1])
          b[1] = h.centroid.y - R
        if (h.centroid.x + R > b[2])
          b[2] = h.centroid.x + R
        if (h.centroid.y + R > b[3])
          b[3] = h.centroid.y + R

        return b
      }, [0, 0, 0, 0])
    }
    within(x, y) {
      return this._major.findIndex(h=>{
        let dx = h.centroid.x - x
        let dy = h.centroid.y - y
        return (dx * dx + dy * dy) < h.R * h.R
      }
      )
    }
    //hex data for THREEJS use 
    //takes radius 
    threeHex(hR) {
      hR = hR || this.R
      
      let minT = this._minT
      let majT = this._majT
      let noise = (x,y)=>{
        return this._noise.noise3D(x, y, 0)
      }
      const HEIGHTS = {
        "deepWater": {base:-1, d:0, peak: 0},
        "shallowWater": {base:0, d:0, peak: 0},
        "swamp": {base:0.1, d:0.1, peak: 0},
        "desert": {base:0.5, d:0.25, peak: 0},
        "plains": {base:0.5, d:0.25, peak: 0},
        "forest": {base:0.5, d:0.25, peak: 0},
        "hills": {base:2, d:1, peak: 4},
        "mountains": {base:12, d:2, peak: 16}
      }

      //for all major hexes loop to get hex data
      return this._hexqr.reduce(function(all, qr, i) {
        let hp = hexPlacement(...qr, hR)
        let T = majT[i]
        let HT = HEIGHTS[T]

        hp._subQR.forEach(function(sqr, j) {
          //terrain 
          let t = minT[i][j]
          //push sub hex 
          let sh = hexPlacement(...sqr, hR/5)
          let height = HT.base + (HT.d * noise(...sqr)) + (HEIGHTS[t].peak * (0.5+noise(...sqr)/2)) 
          all.push({
            _ij: [i, j],
            _qr: sh._qr,
            qr: sh.qr,
            points : sh.points,
            centroid: sh.centroid,
            neighbors: sh.neighbors,
            R: hR/5,
            t: t,
            h: ["deepWater", "shallowWater"].includes(t) ? 1 : 1+height
          })
        })

        return all
      }, [])
    }
  }

  /*
    App Object
  */
  app.hex = {
    Hex,
    generateHexes : generateHexes,
    place : hexPlacement,
    draw : hexDraw,
  }
}

export {HexFactory}



/*
  THREE JS Hex
*/

/*

const TERRAINCOLORS = {
  "deepWater": "blue",
  "shallowWater": "lightblue",
  "swamp": "cadetblue",
  "desert": "tan",
  "plains": "lightgreen",
  "forest": "green",
  "hills": "brown",
  "mountains": "darkgray"
}

//setup container for base hex
    mesh : {},
    findingMesh : {},
  
  var hexShape = new THREE.Shape();

  //create hex at 0 0 
  let baseHex = hexPlacement(0, 0, 100)
  
  //create the basic shape by running through baseHex points
  baseHex.points.forEach((p,i)=>{
    if (i === 0)
      hexShape.moveTo(...p)
    else
      hexShape.lineTo(...p)
  }
  )
  //at the end close 
  hexShape.lineTo(...baseHex.points[0])
  //extrusion settings
  var extrudeSettings = {
    steps: 2,
    depth: 1,
    bevelEnabled: false,
  };
  //create geometry
  var hexGeo = new THREE.ExtrudeBufferGeometry(hexShape,extrudeSettings);
  //rotate to aling wiht three axes 
  hexGeo.rotateX(-Math.PI / 2)

  //now for each terrain create a new mesh 
  for (let t in TERRAINCOLORS) {
    let material = new THREE.MeshLambertMaterial({
      color: TERRAINCOLORS[t]
    })
    if (["deepWater", "shallowWater"].includes(t))
      material = new THREE.MeshPhongMaterial({
        color: TERRAINCOLORS[t]
      })
    //now create the mesh 
    app.hexMesh[t] = new THREE.Mesh(hexGeo.clone(),material)
  }

  //create a mesh for every finding type
  let findingColors = ["gold","purple","darkslategray","orange"]
  let findingTypes = ["resource","luxury","tool","character"]
  findingTypes.forEach((w,i) => {
    let geometry = new THREE.BoxBufferGeometry( 10, 10, 10 );
    let material = new THREE.MeshLambertMaterial( {color:findingColors[i] } );
    app.findingMesh[w] = new THREE.Mesh( geometry, material );
  })

  //now create a hex display, given a hex data
  app.hexDisplay = (hex, clickCB)=>{
    let scene = app.scene
    //clear scene 
    if (scene) {
      while (scene && scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }
      //add lights
      // lights
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(1, 1, 1);
      scene.add(light);

      var light = new THREE.DirectionalLight(0x002288);
      light.position.set(-1, -1, -1);
      scene.add(light);

      var light = new THREE.AmbientLight(0x222222);
      scene.add(light);
    }

    //display the hexes 
    hex.threeHex().forEach(h=>{
      let mesh = app.hexMesh[h.t].clone()
      let ns = h.R / 100
      //scale based on R 
      mesh.scale.set(ns, h.h, ns)
      //position based on centroid
      let c = h.centroid
      mesh.position.set(c.x, 0, c.y)
      //add click
      h.onClick = clickCB
      //add to scene
      //add hex data 
      mesh.userData = h
      if (scene)
        scene.add(mesh)
    }
    )
  }
*/
