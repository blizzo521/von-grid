/*
	Example tile class that constructs its geometry for rendering and holds some gameplay properties.

	@author Corey Birnbaum https://github.com/vonWolfehaus/
*/
vg.Tile = function(config) {
	config = config || {};
	var settings = {
		cell: null, // required vg.Cell
		geometry: null, // required threejs geometry
		material: null // not required but it would improve performance significantly
	};
	settings = vg.Tools.merge(settings, config);

	if (!settings.cell || !settings.geometry) {
		throw new Error('Missing vg.Tile configuration');
	}

	this.cell = settings.cell;
	if (this.cell.tile && this.cell.tile !== this) this.cell.tile.dispose(); // remove whatever was there
	this.cell.tile = this;

	this.uniqueID = vg.Tools.generateID();

	this.geometry = settings.geometry;
	this.material = settings.material;
	if (!this.material) {
		this.material = new THREE.MeshPhongMaterial({
			color: vg.Tools.randomizeRGB('30, 30, 30', 13)
		});
	}

	this.objectType = vg.TILE;
	this.entity = null;
	this.userData = {};

	this.selected = false;
	this.highlight = '0x0084cc';

	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.userData.structure = this;

	// create references so we can control orientation through this (Tile), instead of drilling down
	this.position = this.mesh.position;
	this.rotation = this.mesh.rotation;

	// rotate it to face "up" (the threejs coordinate space is Y+)
	this.rotation.x = -90 * vg.DEG_TO_RAD;
	this.mesh.scale.set(settings.scale, settings.scale, 1);

	if (this.material.emissive) {
		this._emissive = this.material.emissive.getHex();
	}
	else {
		this._emissive = null;
	}

	this.customizeTile();
};

vg.Tile.prototype = {
	select: function() {
		if (this.material.emissive) {
			this.material.emissive.setHex(this.highlight);
		}
		this.selected = true;
		return this;
	},

	deselect: function() {
		if (this._emissive !== null && this.material.emissive) {
			this.material.emissive.setHex(this._emissive);
		}
		this.selected = false;
		return this;
	},

	toggle: function() {
		if (this.selected) {
			this.deselect();
		}
		else {
			this.select();
		}
		return this;
	},

  customizeTile: function() {
    this.updateTerrain();
    this.updateCity();
  },


  // setters
  setTerrain: function(terrain) {
	  this.cell.userData.terrain = terrain;
	  this.customizeTile();
  },

  setCity: function(name) {
    this.cell.userData.city = this.cell.userData.city || {};
    this.cell.userData.city.name = name;
    this.customizeTile();
  },

  setCityPosition: function(position) {
    this.cell.userData.city = this.cell.userData.city || {};
    this.cell.userData.city.position = position;
    this.customizeTile();
  },

  // customizers
  updateTerrain: function() {
	  var terrain = this.cell.userData.terrain;
    var colorString = "rgb(30, 30, 30)";

    if(terrain === "forest") {
      colorString = "rgb(89, 160, 72)";
    } else if(terrain === "farm") {
      colorString = "rgb(237, 208, 23)";
    } else if(terrain === "hills") {
      colorString = "rgb(183, 160, 115)";
    }

    this.material.color = new THREE.Color( colorString );
  },

  updateCity: function() {
    var city = this.cell.userData.city;
    if (city && city.name && city.name.length > 0) {
      var spriteConfig = {
        container: board.group,
        url: '../examples/img/water.png',
        scale: 3,
        heightOffset: 2
      };

      this.sprite = this.sprite || new Sprite(spriteConfig);
      this.sprite.activate(0, 3, 0);

      var xOffset = 0;
      var zOffset = 0;

      if (city && city.position) {
        if (city.position === 1) {
          xOffset = 5;
          zOffset = -9;
        } else if (city.position === 2) {
          xOffset = 10;
          zOffset = 0;
        } else if (city.position === 3) {
          xOffset = 5;
          zOffset = 9;
        } else if (city.position === 4) {
          xOffset = -5;
          zOffset = 9;
        } else if (city.position === 5) {
          xOffset = -10;
          zOffset = 0;
        } else if (city.position === 6) {
          xOffset = -5;
          zOffset = -9;
        }
      }

      console.log("xOffset: ", xOffset);
      console.log("zOffset: ", zOffset);
      board.setEntityOnTileWithOffset(this.sprite, this, xOffset, zOffset);
    }
  },

	dispose: function() {
		if (this.cell && this.cell.tile) this.cell.tile = null;
		this.cell = null;
		this.position = null;
		this.rotation = null;
		if (this.mesh.parent) this.mesh.parent.remove(this.mesh);
		this.mesh.userData.structure = null;
		this.mesh = null;
		this.material = null;
		this.userData = null;
		this.entity = null;
		this.geometry = null;
		this._emissive = null;
	}
};

vg.Tile.prototype.constructor = vg.Tile;
