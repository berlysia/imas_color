"use strict";


var _idols = [];
IDOLS_DATA.forEach(function(idol){
  _idols.push(new Idol(idol));
});

// from underscore
var range = function(start, stop) {
  if (arguments.length <= 1) {
    stop = start || 0;
    start = 0;
  }

  var length = Math.max(Math.ceil(stop - start), 0);
  var idx = 0;
  var range = new Array(length);

  while(idx < length) {
    range[idx++] = start;
    start += 1;
  }

  return range;
};

createjs.Graphics.prototype.drawArc = function(x,y,radius,startAngle,endAngle) {
	this.moveTo(x,y).lineTo(x+radius*Math.cos(startAngle),y+radius*Math.sin(startAngle)).arc(x,y,radius,startAngle,endAngle);
}

HSView.prototype = new createjs.Container();
function HSView (side,pad){
  createjs.Container.call(this);
  var _this = this;
  this.width = side;
  this.height = side;
  this.padding = pad || 50;
  this.radius = this.width/2-this.padding;

  var base = new createjs.Shape();
  this.addChild(base);
  base.graphics.beginFill(baseColor).drawCircle(0,0,this.radius+10);

  this.addIdol = function(idol){
    if(!idol.objOnHS){
      var plot = new createjs.Shape(), scale = idol.color.hsv.s;
      if(idol.part==="AS") plot.graphics.beginFill(idol.color.hex).drawPolyStar(0,0,P_RADIUS*1.7,5,0.6,-90);
      else plot.graphics.beginFill(idol.color.hex).drawCircle(0,0,P_RADIUS);
      plot.y = Math.sin(idol.color.hsv.h*(Math.PI/180))*_this.radius*scale;
      plot.x = Math.cos(idol.color.hsv.h*(Math.PI/180))*_this.radius*scale;
      idol.objOnHS = plot;
    }
    _this.addChild(idol.objOnHS);
  };

  this.removeIdol = function(idol){
    _this.removeChild(idol.objOnHS);
  }
}

HVView.prototype = new createjs.Container();
function HVView (width,height,pad){
  createjs.Container.call(this);
  var _this = this;
  this.padding = pad || 50;
  this.width = width;
  this.height = height;
  this.theta = 120;
  this.radius = height - this.padding*2;
  this.power = 1;
  this.center = {x:this.width/2, y:this.height-this.padding};

  var base = new createjs.Shape();
  this.addChild(base);
  base.graphics
  .beginFill(baseColor)
  .drawArc(
    this.center.x,
    this.center.y,
    this.radius+10,
    (270-this.theta/2)*(Math.PI/180),
    (270+this.theta/2)*(Math.PI/180)
  );

  this.addIdol = function(idol){
    if(!idol.objOnHV){
      var plot = new createjs.Shape(), scale = Math.pow(idol.color.hsv.v,_this.power);
      if(idol.part==="AS") plot.graphics.beginFill(idol.color.hex).drawPolyStar(0,0,P_RADIUS*1.7,5,0.6,-90);
      else plot.graphics.beginFill(idol.color.hex).drawCircle(0,0,P_RADIUS);
      plot.y = _this.center.y + Math.sin((210+idol.color.hsv.h/3.)*(Math.PI/180))*_this.radius*scale;
      plot.x = _this.center.x + Math.cos((210+idol.color.hsv.h/3.)*(Math.PI/180))*_this.radius*scale;
      idol.objOnHV = plot;
    }
    _this.addChild(idol.objOnHV);
  };

  this.removeIdol = function(idol){
    _this.removeChild(idol.objOnHV);
    idol.objOnHV = null;
  };
}

function MainStage (canvas){
  var stage = new createjs.Stage(canvas);

  var hsView = this.hsView = new HSView(400,25);
  hsView.x = hsView.width/2;
  hsView.y = hsView.height/2;

  var hvView = this.hvView = new HVView(700,400,25);
  hvView.x = hsView.width+10;
  hvView.y = 0;

  stage.addChild(hsView);
  stage.addChild(hvView);

  stage.addIdol = function(idol){
    hsView.addIdol(idol);
    hvView.addIdol(idol);
  }

  stage.removeIdol = function(idol){
    hsView.removeIdol(idol);
    hvView.removeIdol(idol);
  }

  return stage;
}

function main() {
  var canvas = document.getElementById('canvas');
  canvas.addEventListener('selectstart',function(e){e.preventDefault()},false);
  var view = window.view = new MainStage(canvas);
  var activeidols = {
    list: [],
    update: function(){
      this.list = _idols.filter(function(idol){return idol.selected;});
    },

  };

  createjs.Ticker.addEventListener('tick', function(){
    view.update();
  });

  _idols.forEach(function(idol,index){
    var target = document.getElementById(idol.region),
        input = document.createElement('input'),
        label = document.createElement('label');
    input.type = 'checkbox';
    input.id = label.for = "idol_"+idol.id;
    input.dataset.idolId = idol.id;
    label.appendChild(input);
    label.appendChild(document.createTextNode(idol.name));
    target.appendChild(label);

    input.addEventListener('click',function(){
      _idols[this.dataset.idolId-1].selected = this.checked;
      var curr = _idols[this.dataset.idolId-1];
      if(this.checked) view.addIdol(curr);
      else view.removeIdol(curr);
      activeidols.update();

      if(activeidols.list.length == 2){
        var ta = document.getElementById('textarea');
        var p = activeidols.list[0], s = activeidols.list[1];
        var arr = [];

        arr.push("\nh distance: ");
        arr.push(Math.abs(p.color.hsv.h - s.color.hsv.h));
        arr.push("\ns distance: ");
        arr.push(Math.abs(p.color.hsv.s - s.color.hsv.s));
        arr.push("\nv distance: ");
        arr.push(Math.abs(p.color.hsv.v - s.color.hsv.v));

        ta.innerText = arr.join("");
      }
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('#group input')).forEach(function(input){
    input.addEventListener('click',function(){
      if(this.dataset.type === "list"){
        var cbList = this.dataset.idolList.split(',').map(function(id){
          return document.querySelector("#idol_"+id);
        });
        if(this.checked && cbList.every(function(input){return input.checked})) cbList.forEach(function(input){input.click();});
        else if(this.checked) cbList.forEach(function(input){if(!input.checked) input.click();})
        else cbList.forEach(function(input){if(input.checked) input.click();})
      }else if(this.dataset.type === "all"){
        var cbList = range(1,51).map(function(id){return document.querySelector("#idol_"+id);});
        if(this.checked && cbList.every(function(input){return input.checked})) cbList.forEach(function(input){input.click();});
        else if(this.checked) cbList.forEach(function(input){if(!input.checked) input.click();})
        else cbList.forEach(function(input){if(input.checked) input.click();})
      }
    });
  })

  _idols = _idols.sort(function(a,b){return a.id - b.id;});

  var permutation = [];
  for (var i = 0; i < 50; i++) {
    for (var j = i+1; j < 50; j++) {
      var p = _idols[i], s = _idols[j];
      var result = {
        idol1: _idols[i].name,
        idol2: _idols[j].name,
        h: (function(){var foo = Math.abs(p.color.hsv.h - s.color.hsv.h);return (180<=foo) ? Math.abs(foo-360) : foo;})(),
        s: Math.abs(p.color.hsv.s - s.color.hsv.s),
        v: Math.abs(p.color.hsv.v - s.color.hsv.v),
        toString: function(){
          return this.idol1+"-"+this.idol2+", h: "+this.h.toFixed(3)+", s: "+this.s.toFixed(3)+", v: "+this.v.toFixed(3);
        }
      };

      permutation.push(result);
    }
  }

  document.getElementById('permutation').innerText = permutation
                                                    .filter(function(r){
                                                      var h = 180-r.h%180<7.2, s = r.s<0.02, v = r.v<0.02;
                                                      return (h&&s)||(s&&v)||(v&&h);
                                                    })
                                                    .sort(function(a,b){return b.h-a.h})
                                                    .map(function(obj){return obj.toString()})
                                                    .join("\n");

}

main();
