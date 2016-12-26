// Settings
var dotSelection = ['∙', '•','・','◦','●','○','◎','◉','⦿','⁌','⁍','⁃','-','✢','✣','✤','✥','✦','✧','★','☆','⭐︎','✯','✡','✩','✪','✫','✬','✭','✮','✶','✷','✵','✸','✹','✺','❊','✻','✽','✼','❉','✱','✲','✾','❃','❋','✳︎','✴︎','❇︎','❈','※','❅','❆','❄︎','⚙','✿','❀','❁','❂','✓','✔︎','✕','✖︎','✗','✘','﹅','﹆','❍','❤︎','☙','❧','❦','❡']; // WIP
var dotSelectionJustDots = dotSelection.slice(0,8);

var allHues = ['r', 'R', 'g', 'G', 'b', 'B'];
var allTints = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
var lightTints = allTints.slice(12,15);
var darkTints = allTints.slice(0,8);

var defaultColor = "ffffff";
var tickRate = 1; // milliseconds
var defaultTotalMovesAllowed = 10000;

var frame = $("#picture-frame");
var canvass = $('#cell-container-box');

// Computed globals
// x_res = 100
var x_Resolution = 50; // TODO: move to per painting config
// width = 100
var frameWidth = frame.width();
// cell_width = 1
var cellWidth = frameWidth/x_Resolution;
// height = 70
var frameHeight = frame.height();
// cell_height = 1
var cellHeight = cellWidth; // for now
// y_res = 100/70 * 100
var y_Resolution = Math.floor(frameHeight/frameWidth * x_Resolution);

var fill_Resolution = x_Resolution*y_Resolution;


// http://stackoverflow.com/questions/210717/using-jquery-to-center-a-div-on-the-screen
(function($){
    $.fn.extend({
        center: function () {
            return this.each(function() {
                var top = ($(window).height() - $(this).outerHeight()) / 2;
                var left = ($(window).width() - $(this).outerWidth()) / 2;
                $(this).css({position:'absolute', margin:0, top: (top > 0 ? top : 0)+'px', left: (left > 0 ? left : 0)+'px'});
            });
        }
    });
})(jQuery);

// return all neighboring elements for a given coord
// returns [[14,31],[45,12]];
function getExistingNeighborCoords(coords) {
  var neighbors = getNeighborCoords(coords);
  var out = [];
  for (i in neighbors) {
      var neighbor = $("#cell-" + neighbors[i][0] + "-" + neighbors[j][1]);
      if (neighbor.length) {
        out.push([neighbors[i][0],neighbors[j][1]]);
      }
  }
  return out;
}

function getNeighborCoords(coords) {
  var a = [-1,0,1];
  var out = [];
  for (i in a) {
    for (j in a) {
      if (a[i] + a[j] != 0) {
        out.push(sumArrayElements(coords, [a[i],a[j]]));
      }
    }
  }
  return out;
}

function getRandomNumber(min,max) {
  return Math.floor(Math.random() * max) + min;
}
function getRandomCoord() {
  return [getRandomNumber(0,x_Resolution), getRandomNumber(0,y_Resolution)];
}
function getRandomFromArray(arr) {
	return arr[Math.floor(Math.random()*arr.length)]
}
function getRandomColor(tints) {
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += tints[Math.floor(getRandomNumber(0,tints.length))];
    }
    return color;
}
// given 'a' returns '9' or 'b'
function getNearTint(tint, tintSet) {
	var l = tintSet.length;
	var i = tintSet.indexOf(tint);
  if (i < 0) {
    return getRandomFromArray(tintSet);
  }
	var inc = Math.random() < 0.5 ? 1 : -1;  // either + or - the tint, TODO: argue near-increment and/or variabilty
	var j = i + inc;
  if (j < 0) {
    j = getRandomNumber(0,tintSet.length);  // TODO: there are many more ways to handle this case
  }
	return tintSet[j % tintSet.length];
}

// color: 'ffffff'
// returns 'ff0fff'
// tintSet: allTints, lightTints, &c
// hueSet: rRgGbB --- sets rrggbb locations to mess with; ie [0,1,2] is rrg, [3,5,6] is gbb
//
function getNearColor(color, tintSet, hueString) {
  var hueSet = hueString.split(""); // 'rRg' -> ['r', 'R', 'g']
	var i = getRandomFromArray(hueSet); // ie 'r', 'G', ...
  var hueIndex = allHues.indexOf(i); // 1, 0, 4, ...
  var colorArr = color.split("");
  var char = colorArr[hueIndex];
  var newTint = getNearTint(char, tintSet);
  colorArr[hueIndex] = newTint;
  return colorArr.join("");
}
function sumArrayElements(){
  var arrays  = arguments,
    results   =   [],
    count     =   arrays[0].length,
    L         =   arrays.length,
    sum,
    next      =   0,
    i;
  while(next < count){
    sum = 0, i = 0;
    while(i < L){
      sum += Number(arrays[i++][next]);
    }
    results[next++] = sum;
  }
  return results;
}
// http://stackoverflow.com/questions/12376870/create-an-array-of-characters-from-specified-range
// Use: rangeBetween('A', 'Z')
function rangeBetween(start,stop) {
  var result=[];
  for (var idx=start.charCodeAt(0),end=stop.charCodeAt(0); idx <=end; ++idx){
    result.push(String.fromCharCode(idx));
  }
  return result;
};

function colorizeCell(x, y, color) {
	$('#cell-'+x.toString()+y.toString())
		// .fadeOut(tickRate)
		.css({"background-color": "#" + color})
		// .fadeIn(tickRate)
    ;
}

function paintCell(x, y, color, styleOptions, content) {
  // set defaults for optional options
  if (typeof(styleOptions) === 'undefined') styleOptions = {};
  if (typeof(content) === 'undefined') content = "";

  var c = document.createElement("div");
  var styleOpts = {
    "left": (x-1)*cellWidth, // TODO: move this to this.pathIndex[0]?
    "top": (y-1)*cellHeight,
    "background-color": "#" + color,
    "width": cellWidth,
    "height": cellHeight
  };
  // var opts = $.extend({}, defaultOptions, options);
  var styleOpts  = $.extend(styleOpts, styleOptions);
  $(c).attr("id", "cell-" + x.toString() + "-" + y.toString())
    .attr("class", "cell")
    .css(styleOpts)
    .text(content);
    ;
    $("#cell-container-box").append(c);
}

function setGrid(callback) {
	frame.center();
	frame.css({
    "background-color": "#" + defaultColor,

    // fix rounding issue leaving a margin
    "height": cellHeight*y_Resolution
  });
	callback;
}

function updateRandomWithRandom(max, colors) {
  var index = getRandomNumber(0,max);
  var index2 = getRandomNumber(0,max);
 	colorizeCell(index, index2, getRandomColor(colors));
}

function stepNext(coords, incrementArray, isBoundedByFrame) {
  if (typeof(isBoundedByFrame) === 'undefined') isBoundedByFrame = true;

	var s = sumArrayElements(coords, incrementArray);

  if (!isBoundedByFrame) {

    // // one way to wrap if extends beyond painting
    // if (s[0] > x_Resolution) {
    //   s[0] = 1;
    //   s[1]++;
    // }
    // if (s[1] > y_Resolution) {
    //   s[0]++;
    //   s[1] = 1
    // }

  } else {

      if (s[0] > x_Resolution || s[0] < 1) {
        s[0] = getRandomCoord()[0];
      }
      if (s[1] > y_Resolution || s[1] < 1) {
        s[1] = getRandomCoord()[1];
      }

  }
  return s;
}

function Painting (maxMoves, startingPoint, startColor, tints, hues) {
  this.maxMoves = maxMoves;
  this.movesTaken = 0;
  this.pathIndex = startingPoint;
  this.brush = startColor;
  this.movement = [];
  this.tints = tints;
  this.hues = hues;
}
// can extend beyond bounds of canvas
Painting.prototype.BlindMansRainbow = function (styleOptions, content) {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush, styleOptions, content);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [getRandomFromArray([-1,0,1]), getRandomFromArray([-1,0,1])];
  this.pathIndex = stepNext(this.pathIndex, this.movement, false); // becuase life at the limits (how to stepnext) may be important for the individual painters here; same for brush
  this.movesTaken++;
}
// constrained to canvas
Painting.prototype.DrunkardsPacing = function (styleOptions, content) {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush, styleOptions, content);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [getRandomFromArray([-1,0,1]), getRandomFromArray([-1,0,1])];
  this.pathIndex = stepNext(this.pathIndex, this.movement, true); // becuase life at the limits (how to stepnext) may be important for the individual painters here; same for brush
  this.movesTaken++;
}
// like typewriter
Painting.prototype.Drips = function (styleOptions, content) {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush, styleOptions, content);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [0,1];
  this.pathIndex = stepNext(this.pathIndex, this.movement, true);
  this.movesTaken++;
}
// like a sideways typewriter
Painting.prototype.Stripes = function () {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [1,0];
  this.pathIndex = stepNext(this.pathIndex, this.movement);
  this.movesTaken++;
}

function saveImage() {
  html2canvas($("#picture-frame"), {
    onrendered: function(canvas) {
      theCanvas = canvas;
      window.location = canvas.toDataURL("image/png");
      // canvas.toBlob(function(blob) {
        // saveAs(blob, "painting.png");
      // });
    }
    // , background: "#" + 'bf0000'
  });
}


$(function () {

  $("#saveImageButton").click(saveImage);

  // var blindman1 = new Painting(100, [0,0], '112233', allTints, 'rRgGbB').BlindMansRainbow();
  var dripPainting = new Painting(fill_Resolution, [1,1], 'bf0000', allTints, 'rR');
  var paintDrips = function (callback) {
    while (dripPainting.movesTaken < dripPainting.maxMoves) {
      dripPainting.Drips();
    }
    callback;
  }

  var blindmanPainting = new Painting(fill_Resolution, [1,1], 'ffffff', allTints, 'rRgGbB');
  var paintBlindly = function (callback) {
    while (blindmanPainting.movesTaken < blindmanPainting.maxMoves) {
      blindmanPainting.BlindMansRainbow();
    }
    callback;
  }

  var blindmanPainting2 = new Painting(fill_Resolution, getRandomCoord(), '000000', allTints, 'rRgGb');
  var paintBlindly2 = function (callback) {
    canvass.css({"background-color": "gold"});
    while (blindmanPainting2.movesTaken < blindmanPainting2.maxMoves) {
      blindmanPainting2.DrunkardsPacing(styleOpt4());
    }
    callback;
  }

  // these must be functions so they're dynamic. otherwise the variables (Math.random(), &c) will be one-offs
  var styleOpt0 = function () {
    return {
      "width": cellWidth,
      "height": cellHeight
    };
  }
  var styleOpt1 = function () {
    return {
      "width": cellWidth * (Math.random()+1),
      "height": cellHeight * (Math.random()+1),
      "border-radius": "50%",
      "transform":
      "scale("+ (Math.random() < 0.5 ? 1 : -1) * Math.random()*1+  "," + (Math.random() < 0.5 ? 1 : -1) * Math.random()*1 + ") " +
        "skew(" + (Math.random() < 0.5 ? 1 : -1) * getRandomNumber(0,20) + "deg," + (Math.random() < 0.5 ? 1 : -1) * getRandomNumber(0,20) + "deg)" +
        "rotate(" + Math.floor(Math.random() * 360) + "deg)",
      "color": "#ffffff"
    };
  };
  var styleOpt2 = function () {
    return {
      "width": cellWidth,
      "height": cellHeight,
      "border-radius": "50%",
      "transform":
      "scale("+ Math.random()+2 + ") ",
        // "rotate(" + Math.floor(Math.random() * 360) + "deg)",
      "color": getRandomColor(allTints),
      "vertical-align":"top",
      "font-size":"smaller"
    };
  };

  var styleOpt3 = function (x) {
    return {
      "width": cellWidth,
      "height": cellHeight,
      "border-radius": getRandomNumber(25,50) + "%",
      "transform":
      "translate(0, " + Math.sin((x)/(x_Resolution+1)*Math.PI)*y_Resolution + getRandomNumber(0,20) + "px)"
        + " scaleY(" + getRandomNumber(0,9) + ")"
      ,
      // "scale("+ Math.random()*2 + ") ",
      // "rotate(" + Math.floor(Math.random() * 360) + "deg)",
      "color": getRandomColor(allTints),
      "opacity": Math.random().toString(),
      "vertical-align":"top",
      "text-align":"center",
      "font-size":"smaller"
    };
  };

  var styleOpt4 = function (x) {
    return {
      "width": cellWidth,
      "height": cellHeight,
      "border-radius": getRandomNumber(25,50) + "%",
      "filter": "blur(" + getRandomNumber(1,4) + "px)",
      "transform":
      // "translate(0, " + Math.sin((x)/(x_Resolution+1)*Math.PI)*y_Resolution + getRandomNumber(0,20) + "px)"
      "scale(" + getRandomNumber(0,4) + "," + getRandomNumber(0,4) + ")"
      // + "scale(" + Math.random()*2 + ") "
      + "rotate(" + Math.floor(Math.random() * 360) + "deg)",
      "color": getRandomColor(allTints),
      "opacity": Math.random().toString(),
      "vertical-align":"top",
      "text-align":"center",
      "font-size":"smaller"
    };
  };

  var dripPainting2 = new Painting(fill_Resolution, [1,1], 'bf0000', allTints.slice(7,15), 'rgGbB');
  var paintDrips2 = function (callback) {
    while (dripPainting2.movesTaken < dripPainting2.maxMoves) {
      // dripPainting2.Drips(styleOpt1(), getRandomFromArray(rangeBetween('a','z')));
      dripPainting2.Drips(styleOpt2(), getRandomFromArray(dotSelection));
    }
    callback;
  }

  var dripPainting3 = new Painting(fill_Resolution, [1,1], getRandomColor(allTints), allTints, 'rgGb');
  var paintDrips3 = function (callback) {
    while (dripPainting3.movesTaken < dripPainting3.maxMoves) {
      // dripPainting3.Drips(styleOpt1(), getRandomFromArray(rangeBetween('a','z')));
      dripPainting3.Drips(styleOpt3(dripPainting3.pathIndex[0])); // getRandomFromArray(dotSelectionJustDots))
    }
    callback;
  }

  // setGrid(paintBlindly());
  // setGrid(paintDrips());
  // setGrid(paintDrips(paintBlindly()));
  // setGrid(paintBlindly(paintDrips()));
  // setGrid(paintDrips2());
  // setGrid(paintDrips3());
  setGrid(paintBlindly2())
});
