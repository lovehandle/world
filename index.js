var createGame = require('voxel-engine')
var highlight = require('voxel-highlight')
var player = require('voxel-player')
var voxel = require('voxel')
var walk = require('voxel-walk')

var urls = {
  "twitter" : "https://twitter.com/_lovehandle_",
  "github": "https://github.com/lovehandle",
  "linkedin": "https://www.linkedin.com/profile/view?id=AAMAAAwSbPEB3pQs5bP3yElEoSX-jAs5gdq8u3Y",
  "lovehandle": "https://lovehandle.me",
  "pubkey": "https://lovehandle.me/pub.asc"
}

var slides = Object.keys(urls)

var opts = {
  container: document.getElementById('container'),
  texturePath: "./images/",
  playerSkin: "./images/player.png",
  materials: ["yellow"].concat(slides),
  materialFlatColor: false,
  generateVoxelChunks: false,
  chunkDistance: 1,
  generate: voxel.generator['Valley'],
  worldOrigin: [0, 0, 0],
  controls: { discreteFire: true }
}

// Game
var game = createGame(opts)
game.appendTo(opts.container)
if (game.notCapable()) return game

// Player
var createPlayer = player(game)
var avatar = createPlayer(opts.playerSkin)
avatar.possess()
avatar.yaw.position.set(2, 14, 4)
avatar.toggle();

// Movement
var target = game.controls.target()
game.on('tick', function() {
  walk.render(target.playerSkin)
  var vx = Math.abs(target.velocity.x)
  var vz = Math.abs(target.velocity.z)
  if (vx > 0.001 || vz > 0.001) walk.stopWalking()
  else walk.startWalking()
})

// Block interation 
var blockPosPlace, blockPosErase
var hl = game.highlighter = highlight(game, { color: 0xff0000 })
var currentMaterial = 1

hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
hl.on('remove', function (voxelPos) { blockPosErase = null })
hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

game.on('fire', function (target, state) {
  var position = blockPosPlace
  if (position) {
    game.createBlock(position, currentMaterial)
  }
  else {
    position = blockPosErase
    if (position) game.setBlock(position, 0)
  }
})

// Insert slides
var z = -5
var y = 3
slides.map(function(slide) {
  game.setBlock([0, y, z], slide)
  z += 2
  if (z > 5) {
    z = -5
    y += 2
  }
})

// Open URLs
game.on('setBlock', function(pos, val, old) {
  if (old === 1 || val === 1) return
  var url = urls[slides[old - 2]]
  var win = window.open(url)
})

game.interact.on('attain', function () {
  start(false);
})

function start (attain) {
  var el = document.getElementById('explanation')
  el.style.display = 'none';

  if (!!attain) {
    game.interact.emit('attain');
  }
}

window.start = start;

window.onload = function () {
  var ready = document.getElementById('ready');
  var loading = document.getElementById('loading');
  ready.style.display = 'block';
  loading.style.display = 'none';
}
