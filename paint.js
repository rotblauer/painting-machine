// Settings
var allHues = ['r', 'R', 'g', 'G', 'b', 'B'];
var allTints = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
var lightTints = allTints.slice(12,15);
var darkTints = allTints.slice(0,8);
var xSize = 100;
var defaultColor = "ffffff";
var tickRate = 20; // milliseconds
var totalMoves = 0;
var totalMovesAllowed = 10000;
var frame = $("#picture-frame");

// Computed globals
var allowedWidth = frame.width();
var allowedHeight = frame.height();
var hw_ratio = allowedHeight/allowedWidth;
var ySize = Math.floor(hw_ratio*xSize);

// Placeholders
var pathIndex = [];
var lineIndex = 0;

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
	return [getRandomNumber(xSize), getRandomNumber(ySize)];
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
	var inc = Math.random() < 0.5 ? 1 : -1;  // either + or - the tint
	var j = i + inc;
	return tintSet[j]; // pallete[-1] --> last, -2 second-last, &c
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
function sumArrayElements(a1, a2){
	// ASSUME [a,b] & [c,d]
	// return [a1[0] + a2[0], a1[1] + a2[1]];
   
   var arrays  = arguments, 
   		 results = [], 
   		 count   = arrays[0].length, 
   		 L       = arrays.length, 
   		 sum, 
   		 next    = 0, 
   		 i;
   while(next<count){
       sum= 0, i= 0;
       while(i<L){
           sum+= Number(arrays[i++][next]);
       }
       results[next++]= sum;
   }
   return results;
}

function colorizeCell(x, y, color) {
	$('#cell-'+x.toString()+y.toString())
		// .fadeOut(tickRate)
		.css({"background-color": "#" + color})
		// .fadeIn(tickRate)
		;	
}

function setGrid(callback) {
	
	// center picture frame
	frame.center();
	frame.css({"background-color": "#" + defaultColor});

	for (var y = 1; y < ySize + 1; y++) {
	  for (var x = 1; x < xSize + 1; x++) {
	  	var div = document.createElement("div");
	  	$(div).attr('id', 'cell-' + x.toString() + y.toString())
	  		.attr('class','cell')
		  	.css({
		  		"background-color": "#" + defaultColor,
		  		"width": 100/xSize + '%',
		  		"height": 100/ySize + "%"
		  	})
		  	// .text(x.toString() + "," + y.toString())
		  	;
	  	$('#cell-container-box').append(div);
	  }	
	}
	callback;
}
function updateRandomWithRandom(max, colors) {
  var index = getRandomNumber(max);
  var index2 = getRandomNumber(max);
 	colorizeCell(index, index2, getRandomColor(colors));
}

function drawNext(coords, incrementArray, color) {
	var s = sumArrayElements(coords, incrementArray);
	
	// wrap if extends beyond painting
	if (s[0] > xSize || s[1] > ySize || s[0] < 0 || s[1] < 0) {
		s = getRandomCoord();
	}
	colorizeCell(s[0], s[1], color);
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
  this.possibleMoves = [-1,0,1];
  this.movement = [getRandomFromArray(this.possibleMoves), getRandomFromArray(this.possibleMoves)];
  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.pathIndex = drawNext(this.pathIndex, this.movement, this.brush);
  this.movesTaken++;
  if (this.movesTaken == this.maxMoves) { return; }
  // this.BlindMansRainbow();
}
Painting.prototype.Drips = function () {
  this.movement = [0,1];
  this.brush = getNearColor(this.brush, this.tints, this.hues);
  this.pathIndex = drawNext(this.pathIndex, this.movement, this.brush);
  console.log('pathIndex', this.pathIndex);
  console.log('movesTaken: ', this.movesTaken);
  this.movesTaken++
  // return this.movesTaken;
}

$(function () {
  setGrid(null);

  // var blindman1 = new Painting(100, [0,0], '112233', allTints, 'rRgGbB').BlindMansRainbow();
  var p1 = new Painting(100, getRandomCoord(), 'bf0000', allTints, 'rR');

  var paintDrips = function () {
    if (p1.movesTaken < p1.maxMoves) {
      p1.Drips();
    }
    setTimeout(paintDrips, tickRate);
  }
  setTimeout(paintDrips, tickRate);
	// pathIndex = getRandomCoord();
	
	// // var color = getRandomColor(allTints);
 //  var color = getNearColor(defaultColor, lightTints, [0,1,2]);

 //  var draw1 = function () {
 //  	if (totalMoves == totalMovesAllowed) return;
	  
 //    var possibleMoves = [-1,0,1];	
 //    var movement = [getRandomFromArray(possibleMoves), getRandomFromArray(possibleMoves)];
		
	// 	// if (Math.random() < 0.05) {
	// 	// 	pathIndex = getRandomCoord();
	// 	// }
		
	// 	color = getNearColor(color, allTints, [0,1,2,3,4,5]);
	// 	pathIndex = drawNext(pathIndex, movement, color);	
	// 	totalMoves++;
	// 	setTimeout(draw1, tickRate);	
 //  }
  
  
  
  // setTimeout(p, tickRate);
  // setTimeout(draw1, tickRate);
  // var draw2 = function () {
  //   var tintSet = [0,1,2]; // rrg
  //   var lineLength = 10;

  //   if (totalMoves == totalMovesAllowed) return;

  //   var movement = [0, 1];
  //   color = getNearColor(color, lightTints, tintSet);
  //   pathIndex = drawNext(pathIndex, movement, color);
  //   lineIndex++;

  //   if (lineIndex == lineLength) {
  //     pathIndex = getRandomCoord();
  //     lineIndex = 0;
  //   }
  //   setTimeout(draw2, tickRate);
  // }
  // setTimeout(draw2, tickRate);

});








