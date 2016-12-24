		  	// Christmas lights.
			  var hexables = ['0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'];
			  var hexablesMini = ['1', '4', '7', 'a', 'd'];
			  var test = '000000';
			  var colors = []; // ie {13, '#f231fk'}
		  	var numColors = 4000;
		  	var numChristmasLights = 100;
		  	var windowWidth = $(document).width();
		  	//make em dance
		  	function updateRandomWithRandom(max, colors) {
		  	  var index = getRandomNumber(max);
		  	 $('#light-'+index)
		  	 	.fadeOut('100')
		  	 	.css({"background-color": getRandomColor})
		  	 	.fadeIn('100');
		  	}
		  	function getRandomNumber(max) {
		  	  return Math.floor(Math.random() * max);
		  	}
			  // http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
			  function getRandomColor() {
			      var letters = '0123456789ABCDEF'.split('');
			      var color = '#'; //'#';
			      for (var i = 0; i < 6; i++ ) {
			          color += letters[Math.floor(getRandomNumber(letters.length))];
			      }
			      return color;
			  }
			  function celebrateChristmas() {
			  	// colorize nav
			  	$('.following.bar').addClass('nativity-nav');

			  	// hang christmas lights
			  	$('#christmas-lights-container-box').show();
			  	$('#christmas-lights-container-box').css({'height': windowWidth/numChristmasLights});
		  	  for (var i=1;i<numChristmasLights-1;i++) {
		  	  	console.log('hanging light');
		  	  	var div = document.createElement("div");
		  	  	$(div).attr('id', 'light-' + i.toString())
		  	  		.attr('class','christmas-light')
		  		  	.css({
		  		  		"background-color": getRandomColor(),
		  		  		"width": windowWidth/numChristmasLights,
		  		  		"margin-bottom": windowWidth/numChristmasLights,
		  		  		"border-radius": '50%' });
		  	  	$('#christmas-lights-container-box').append(div);
		  	  }
  	  	  // createPalette(hexables);
  	    	var clockIt = function () {
  	    	  updateRandomWithRandom(numChristmasLights, colors);
  	    	  setTimeout(clockIt, 200); // Tick.
  	    	};
  	    	setTimeout(clockIt, 200);
			  }