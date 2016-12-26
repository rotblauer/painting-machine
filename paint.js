// Settings
var allHues = ['r', 'R', 'g', 'G', 'b', 'B'];
var allTints = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
var lightTints = allTints.slice(12,15);
var darkTints = allTints.slice(0,8);

var defaultColor = "ffffff";
var tickRate = 1; // milliseconds
var totalMoves = 0;
var totalMovesAllowed = 10000;
var frame = $("#picture-frame");

// Computed globals




// x_rex = 100
var x_Resolution = 100;
// width = 100
var frameWidth = frame.width();
// cell_width = 1
var cellWidth = frameWidth/x_Resolution;
// heigth = 70
var frameHeight = frame.height();
// cell_height = 1
var cellHeight = cellWidth; // for now
// y_res = 100/70 * 100
var y_Resolution = Math.floor(frameHeight/frameWidth * x_Resolution);

var fill_Resolution = x_Resolution*y_Resolution;


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
	var inc = Math.random() < 0.5 ? 1 : -1;  // either + or - the tint
	var j = i + inc;
  if (j < 0) {
    j = getRandomNumber(tintSet.length);
  }
  var tt = tintSet[j % tintSet.length];
  // console.log('tint', tt);
	return tt; // pallete[-1] --> last, -2 second-last, &c
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
  // console.log("nearcolor:", colorArr.join(""));
  return colorArr.join("");
}
function sumArrayElements(){
  // console.log('args', arguments);
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
   // console.log('results', results);
   return results;
}

function colorizeCell(x, y, color) {
	$('#cell-'+x.toString()+y.toString())
		// .fadeOut(tickRate)
		.css({"background-color": "#" + color})
		// .fadeIn(tickRate)
		;	
}

function paintCell(x, y, color) {
  var c = document.createElement("div");
  $(c).attr("id", "cell-" + x.toString() + "-" + y.toString())
    .attr("class", "cell")
    .css({
      "background-color": "#" + color,
      "width": cellWidth,
      "height": cellHeight,

      "left": (x-1)*cellWidth,
      "top": (y-1)*cellHeight
    })
    ;
    $("#cell-container-box").append(c);
}

function setGrid(callback) {
	
	// center picture frame
	frame.center();
	frame.css({"background-color": "#" + defaultColor});

	// for (var y = 1; y < y_Resolution + 1; y++) {
	//   for (var x = 1; x < x_Resolution + 1; x++) {
	//   	var div = document.createElement("div");
	//   	$(div).attr('id', 'cell-' + x.toString() + y.toString())
	//   		.attr('class','cell')
	// 	  	.css({
	// 	  		"background-color": "#" + defaultColor,
	// 	  		"width": 100/x_Resolution + '%',
	// 	  		"height": 100/y_Resolution + "%"
	// 	  	})
	// 	  	// .text(x.toString() + "," + y.toString())
	// 	  	;
	//   	$('#cell-container-box').append(div);
	//   }	
	// }
	callback;
}
function updateRandomWithRandom(max, colors) {
  var index = getRandomNumber(max);
  var index2 = getRandomNumber(max);
 	colorizeCell(index, index2, getRandomColor(colors));
}

function drawNext(coords, incrementArray, color) {
  // console.log("dn coords", coords);
	var s = sumArrayElements(coords, incrementArray);
	
	// wrap if extends beyond painting
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
	// colorizeCell(s[0], s[1], color);
  paintCell(s[0], s[1], color); 
  // console.log('s', s);
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
}
Painting.prototype.Drips = function () {
  this.movement = [0,1];
  this.brush = getNearColor(this.brush, this.tints, this.hues);
  // this.brush = '990000';
  this.pathIndex = drawNext(this.pathIndex, this.movement, this.brush);
  // console.log('pathIndex', this.pathIndex);
  // console.log('movesTaken: ', this.movesTaken);
  this.movesTaken++
}

$(function () {

  // console.log('xres', x_Resolution);
  // console.log('yres', y_Resolution);
  

  // var blindman1 = new Painting(100, [0,0], '112233', allTints, 'rRgGbB').BlindMansRainbow();
  var p1 = new Painting(fill_Resolution, [1,1], 'bf0000', allTints, 'rR');
  function x () {
    var paintDrips = function () {
      if (p1.movesTaken < p1.maxMoves) {
        p1.Drips();
      }
      setTimeout(paintDrips, tickRate);
    }
    setTimeout(paintDrips, tickRate);  
  }
  setGrid(x());
  
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








