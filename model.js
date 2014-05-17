var hex2hsv = function(hex){
  var r = parseInt("0x"+hex.substr(1,2)),
      g = parseInt("0x"+hex.substr(3,2)),
      b = parseInt("0x"+hex.substr(5,2)),
      h, s, v;
  var max = Math.max(r,Math.max(g,b)), min = Math.min(r,Math.min(g,b));

  v = max/255.;
  if(min===max) h = 0;
  else if(min===b) h = 60*((g-r)/(max-min))+60;
  else if(min===r) h = 60*((b-g)/(max-min))+180;
  else if(min===g) h = 60*((r-b)/(max-min))+300;
  else h = 0;
  s = (max-min)/max;

  // h:[0,360], s:[0,1], v:[0,1]
  return {h: h, s: s, v: v};
};

var Color = function(hex){
  this.hex = hex;
  this.hsv = hex2hsv(hex);
  this.rgb = {
    r: parseInt("0x"+hex.substr(1,2)),
    g: parseInt("0x"+hex.substr(3,2)),
    b: parseInt("0x"+hex.substr(5,2))
  }
}

var Idol = function(data){
  this.name = data.name;
  this.id = data.id;
  this.region = data.region;
  this.part = data.part;
  this.color = new Color(data.color);
  this.selected = false;
  this.objOnHS = null;
  this.objOnHV = null;
}
