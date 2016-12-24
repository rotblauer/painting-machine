$(function () {
    // Config
    var totalColumnsNum = 100;

    // Major elements
    var h = $(document).height();
    var w = $(document).width();
    var main = $('.main');

    var cells = [];

    // Calculate rows num
    var hw_ratio = h/w;
    var rows_num = Math.floor(hw_ratio*totalColumnsNum);

    function randomCell() {
    	var randX = Math.floor(Math.random()*totalColumnsNum);
    	var randY = Math.floor(Math.random()*rows_num);
        return [randX+1, randY+1];
    }

    function appendColumn(n) {
        var d = document.createElement('div');

        $(d).addClass('column');

        for (var i=1; i<rows_num+1; i++) {
            var r = document.createElement('div');

            $(r).attr('id', n.toString() + ',' + (i).toString());
            $(r).addClass('row');
            $(r).css({height: 100/rows_num+ "%"});

            cells.push(r);
            $(d).append($(r));
            main.append($(d));
        }
        // $(d).css({'height': 100/totalColumnsNum+"%"});
        // main.append($(d));
    }
    // set em up
    function setEmUp (callback) {
        for (var n=1; n<totalColumnsNum+2; n++) {
            if (n != totalColumnsNum + 2) {
                appendColumn(n);    
            } else {
                callback;        
            }
        }    
    }
    
    function changeBackgrounds() {
        console.log('changing backgrounds');
        console.log('cells', cells);
        for (var a=0; a<10; a++) {
            // cells[Math.floor(Math.random() * cells.length)].hide();
        }    
    }
    setEmUp(changeBackgrounds());
    // setTimeout(changeBackgrounds, 1000);
    
    // $('.testes').hide(); // .css({"background-color":"blue"});
    // setTimeout($('.testes').hide().css({"background-color": "blue"}).show(), 1000);
    
    
});