		  $(function () {

		  	/// SEASONALS
		  	/// ///////////////////

		  	// Christmas lights.
			  var hexables = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
			  var hexablesMini = ['1', '4', '7', 'a', 'd'];
			  var test = '000000';
			  var colors = []; // ie {13, '#f231fk'}
		  	var numColors = 4000;
		  	var numChristmasLights = 100;
		  	var windowWidth = $(document).width();

		  	var tickRate = 20;

		  	var mutedHexables = hexables.slice(12,15);
		  	var darkHexables = hexables.slice(0,8);

		  	// Major elements
		  	var h = $(document).height();
		  	// Calculate rows num
		  	var hw_ratio = h/windowWidth;
		  	var rows_num = Math.floor(hw_ratio*numChristmasLights);


		  	//make em dance
		  	function updateRandomWithRandom(max, colors) {
		  	  var index = getRandomNumber(max);
		  	 $('#light-'+index)
		  	 	.fadeOut(tickRate)
		  	 	.css({"background-color": getRandomColor(darkHexables)})
		  	 	.fadeIn(tickRate);
		  	}
		  	function getRandomNumber(max) {
		  	  return Math.floor(Math.random() * max);
		  	}
			  // http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
			  function getRandomColor(letters) {
			      // var letters = '0123456789ABCDEF'.split('');
			      var color = '#'; //'#';
			      for (var i = 0; i < 6; i++ ) {
			          color += letters[Math.floor(getRandomNumber(letters.length))];
			      }
			      return color;
			  }
			  function celebrateChristmas() {

			  	// set size of box
			  	$('#christmas-lights-container-box').css({'height': '100vh'});// windowWidth/numChristmasLights});

			  	for (var j = 1; j < rows_num+1; j++) {
		  		  for (var i=1;i<numChristmasLights+1;i++) {
		  		  	var div = document.createElement("div");
		  		  	$(div).attr('id', 'light-' + (i*j).toString())
		  		  		.attr('class','christmas-light')
		  			  	.css({
		  			  		"background-color": getRandomColor(mutedHexables),
		  			  		"width": windowWidth/numChristmasLights,
		  			  		// "margin-bottom": windowWidth/numChristmasLights,
		  			  		"height": 100/rows_num+ "%"
		  			  		// "border-radius": '50%' 
		  			  	});
		  		  	$('#christmas-lights-container-box').append(div);
		  		  }	
			  	}
			  	 
  	  	  // createPalette(hexables);
  	    	var clockIt = function () {
  	    	  updateRandomWithRandom(numChristmasLights * rows_num, colors);
  	    	  setTimeout(clockIt, tickRate); // Tick.
  	    	};
  	    	setTimeout(clockIt, tickRate);
			  }

			  celebrateChristmas();

		  });