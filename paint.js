// Settings
var hexables = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
var mutedHexables = hexables.slice(12,15);
var darkHexables = hexables.slice(0,8);
var numCellsPerRow = 100;
var defaultColor = "ff4422";
var tickRate = 20; // milliseconds
var totalMoves = 0;
var totalMovesAllowed = 10000;
var frame = $("#picture-frame");

// Computed globals
var allowedWidth = $(frame).width();
var allowedHeight = $(frame).height();
var hw_ratio = allowedHeight/allowedWidth;
var rows_num = Math.floor(hw_ratio*numCellsPerRow);

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
	return [getRandomNumber(numCellsPerRow), getRandomNumber(rows_num)];
}
function getRandomFromArray(arr) {
	return arr[Math.floor(Math.random()*arr.length)]
}
function getRandomColor(letters) {
    var color = ''; 
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(getRandomNumber(letters.length))];
    }
    return color;
}
// given 'a' returns '9' or 'b'
function getNearHex(hex, palette) {
	var l = palette.length;
	var i = palette.indexOf(hex);
	var inc = getRandomFromArray([-1,1]);
	var j = i + inc;
	return palette[j]; // pallete[-1] --> last, -2 second-last, &c
}
// given 'ffffff' returns 'ff0fff'
function getNearColor(color, palette) {
	var i = getRandomFromArray([0,1,2,3,4,5]);
  var colorArr = color.split("");
  var char = colorArr[i];
  var newTint = getNearHex(char, palette);
  colorArr[i] = newTint;
  var nearColor = colorArr.join("");
  return nearColor;
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
	$('#light-'+x.toString()+y.toString())
		// .fadeOut(tickRate)
		.css({"background-color": "#" + color})
		// .fadeIn(tickRate)
		;	
}

function setGrid(callback) {
	
	// center picture frame
	frame.center();
	frame.css({"background-color": "#" + defaultColor});

	for (var y = 1; y < rows_num + 1; y++) {
	  for (var x = 1; x < numCellsPerRow + 1; x++) {
	  	var div = document.createElement("div");
	  	$(div).attr('id', 'light-' + x.toString() + y.toString())
	  		.attr('class','cell')
		  	.css({
		  		"background-color": "#" + defaultColor,
		  		"width": 100/numCellsPerRow + '%',
		  		"height": 100/rows_num + "%"
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
	if (s[0] > numCellsPerRow || s[1] > rows_num || s[0] < 0 || s[1] < 0) {
		s = getRandomCoord();
	}
	colorizeCell(s[0], s[1], color);
	return s;
}

$(function () {
  setGrid(null);
	pathIndex = getRandomCoord();
	var moves = [-1,0,1];
	var color = getRandomColor(hexables);
  var draw = function () {
  	if (totalMoves < totalMovesAllowed) {
  		var r = [getRandomFromArray(moves), getRandomFromArray(moves)];
  		
  		// if (Math.random() < 0.05) {
  		// 	pathIndex = getRandomCoord();
  		// }
  		
  		color = getNearColor(color, hexables);
  		pathIndex = drawNext(pathIndex, r, color);	
  		totalMoves++;
  		setTimeout(draw, tickRate);	
  	}
  }
  setTimeout(draw, tickRate);

});








