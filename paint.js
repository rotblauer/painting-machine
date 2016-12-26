// Settings
var allHues = ['r', 'R', 'g', 'G', 'b', 'B'];
var allTints = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
var lightTints = allTints.slice(12,15);
var darkTints = allTints.slice(0,8);

var defaultColor = "ffffff";
var tickRate = 1; // milliseconds
var defaultTotalMovesAllowed = 10000;

var frame = $("#picture-frame");

// Computed globals
// x_res = 100
var x_Resolution = 100;
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

function getRandomNumber(max) {
  return Math.floor(Math.random() * max);
}
function getRandomCoord() {
	return [getRandomNumber(x_Resolution), getRandomNumber(y_Resolution)];
}
function getRandomFromArray(arr) {
	return arr[Math.floor(Math.random()*arr.length)]
}
function getRandomColor(tints) {
    var color = '';
    for (var i = 0; i < 6; i++ ) {
        color += tints[Math.floor(getRandomNumber(tints.length))];
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
    j = getRandomNumber(tintSet.length);  // TODO: there are many more ways to handle this case
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

function paintCell(x, y, color, options) {
  var c = document.createElement("div");
  var opts = {
    "left": (x-1)*cellWidth, // TODO: move this to this.pathIndex[0]?
    "top": (y-1)*cellHeight,
    "background-color": "#" + color
  };
  // var opts = $.extend({}, defaultOptions, options);
  var opts = $.extend(opts, options);
  $(c).attr("id", "cell-" + x.toString() + "-" + y.toString())
    .attr("class", "cell")
    .css(opts)
    .text(getRandomFromArray(rangeBetween('A','Z')))
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
  var index = getRandomNumber(max);
  var index2 = getRandomNumber(max);
 	colorizeCell(index, index2, getRandomColor(colors));
}

function stepNext(coords, incrementArray) {
  // console.log("dn coords", coords);
	var s = sumArrayElements(coords, incrementArray);

	// one way to wrap if extends beyond painting
  if (s[0] > x_Resolution) {
    s[0] = 1;
    s[1]++;
  }
  if (s[1] > y_Resolution) {
    s[0]++;
    s[1] = 1
  }
	// if (s[0] > x_Resolution || s[1] > y_Resolution || s[0] < 0 || s[1] < 0) {
	// 	s = getRandomCoord();
	// }

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
Painting.prototype.BlindMansRainbow = function () {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [getRandomFromArray([-1,0,1]), getRandomFromArray([-1,0,1])];
  this.pathIndex = stepNext(this.pathIndex, this.movement); // becuase life at the limits (how to stepnext) may be important for the individual painters here; same for brush
  this.movesTaken++;
}
Painting.prototype.Drips = function (options) {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush, options);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [0,1];
  this.pathIndex = stepNext(this.pathIndex, this.movement);
  this.movesTaken++;
}
Painting.prototype.Stripes = function () {
  paintCell(this.pathIndex[0], this.pathIndex[1], this.brush);

  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.movement = [1,0];
  this.pathIndex = stepNext(this.pathIndex, this.movement);
  this.movesTaken++;
}

function saveImage() {
  html2canvas($("#cell-container-box"), {
    onrendered: function(canvas) {
      theCanvas = canvas;
      canvas.toBlob(function(blob) {
        saveAs(blob, "painting.png");
      });
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

  var opt1 = function () {
    return {
      "width": cellWidth * (Math.random()+1),
      "height": cellHeight * (Math.random()+1),
      "border-radius": "50%",
      "transform":
      "scale("+ (Math.random() < 0.5 ? 1 : -1) * Math.random()*2+  "," + (Math.random() < 0.5 ? 1 : -1) * Math.random()*2 + ") " +
        "skew(" + (Math.random() < 0.5 ? 1 : -1) * getRandomNumber(20) + "deg," + (Math.random() < 0.5 ? 1 : -1) * getRandomNumber(20) + "deg)" +
        "rotate(" + Math.floor(Math.random() * 360) + "deg)",
      "color": "#ffffff"
    };
  };

  var dripPainting2 = new Painting(fill_Resolution, [1,1], 'bf0000', allTints.slice(7,15), 'rgGbB');
  var paintDrips2 = function (callback) {
    while (dripPainting2.movesTaken < dripPainting2.maxMoves) {
      dripPainting2.Drips(opt1());
    }
    callback;
  }

  // setGrid(paintBlindly());
  // setGrid(paintDrips());
  // setGrid(paintDrips(paintBlindly()));
  // setGrid(paintBlindly(paintDrips()));
  setGrid(paintDrips2());
});
