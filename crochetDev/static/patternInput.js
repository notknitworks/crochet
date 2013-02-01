var numRows = 0;
var pattern = new Array();

$(document).ready(function(){
	$("#addRowButton").click(function(){
		createNextRow();
	});

	$(".edit").keyup(function(event){
		editHandler($(this));

	});

});

	function editHandler($row) {
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			event.preventDefault();
		} else if (keycode == '8'){
			var sel = window.getSelection();
			var anchor = sel.anchorNode;

			if(sel.anchorNode.nodeType == 3) {
				var removed = $row.children('addedStitch').last();
				// return;
			}
			if(sel.anchorNode.nodeType == 1){
				event.preventDefault();
				var removed = $row.children('span')[sel.anchorOffset-1];
				// console.log("HI");
				// $(removed).remove();
			}
			var deletedY = $row.children().not(":contains('sk')").toArray().indexOf(removed);
			var deletedX = $('.edit').toArray().indexOf($row[0]);
			editPattern("", deletedX, deletedY, false);

		} else if(! (keycode == '13' || keycode == '188')) return;
		userEnter($(this));
	}

	function loadPatternText() {
		$('.edit').focus();
		var pattern = $("#interface").data("pattern");
		if (pattern[0].length == 0 && !(1 in pattern)) {
			return;
		}
		for (i in pattern) {
			var rowText = $($('.edit')[i]);
			var row = [];
			for (j in pattern[i]) {
				if (pattern[i][j].length == 0) {
					row.push("sk");
				} else {
					for (st in pattern[i][j]) {
						if (st == 0) {
							row.push(pattern[i][j][st].toLowerCase());
						} else {
							row.push(pattern[i][j][st].toLowerCase() + " in same stitch");
						}
					}
				}
			}
			rowText.html(row.join(","));
			userEnter(rowText, rowText.contents().last()[0]);
			createNextRow();
		}
	}

	/*
	takes in an object with a stitch type (string), row number, stitch y number,
	cluster number, and boolean for add or delete
	*/
	function editPattern(stitch, x, y, add) {
		var data = $("#interface").data("pattern");
		var index = getClusterNum(x, y);
		if (add) {
			data[x][index.cluster].splice(index.clusterNum, 0, stitch);
		} else {
			data[x][index.cluster].splice(index.clusterNum, 1);
		}

		curX = x;
		curY = y;
		curCluster = index.cluster;
		if (x % 2 == 0) {
			toRight = true;
		} else {
			toRight = false;
		}

		removeStitchesAfter(getStitchY(x, y));
		for (i in rows) {
			if (i > x ) {
				delete rows[i];
			} else if (y == 0 && i == x) {
				delete rows[x];
				curX--;
			} else if (i == x) {
				for (j in rows[x]) {
					if (j == index.cluster) {
						rows[x]['stitches'] -= rows[x][j].length - index.clusterNum;
						rows[x][j] = rows[x][j].slice(0, index.clusterNum);
					} else if (j > index.cluster) {
						rows[x]['stitches'] -= rows[x][j].length;
						delete rows[x][j];
					}
				}
			}
		}

		parsePattern(x, y);
	}

	/*
	from data, given a stitch.x and stitch.y, calculate its cluster and and cluster index.
	modifies data and stitches to add an array
	*/
	function getClusterNum(x, y) {
		var data = $("#interface").data("pattern");
		if (x < 0 || y < 0) {
            console.log("error getting stitch "+y+" row "+row);
            return null;
        } else if (!(x in data)) {
        	//create a new row
        	data[x] = {
        		0: []
        	}
        	return {
        		'cluster' : 0,
        		'clusterNum' : 0
        	};
        }
        var clusters = data[x][0].length;
        var cur = 0;
        try {
	        while (y >= clusters) {
	        	cur++;
	        	clusters += data[x][cur].length;
	        }
	    } catch(err) {
        	//create a new cluster
        	console.log("creating cluster");
        	data[x][cur] = [];
        	rows[x][cur] = [];
        	return {'cluster' : cur,
        			'clusterNum' : 0};
    	}

		return {'cluster' : cur,
        			'clusterNum' : data[x][cur].length - (clusters - y)};
	}

	function parsePattern(x, y) {
		var pattern = $("#interface").data("pattern");

		while (x in pattern) {
			if (! (x in rows)) {
				addRow();
			}
			while (curCluster in pattern[x]) {
				console.log("entering cluster")
				if (pattern[x][curCluster].length == 0) {
					skipStitch();
				} else {
					for (var i=0; i < pattern[x][curCluster].length; i++) {
						addStitch(new Stitch(pattern[x][curCluster][i]));
						console.log("stitch added");
					}
					addCluster();
				}
			}
			x++;
		}
		curCluster--;
	}
/* creates a new row in the table that contains the pattern instructions
    each row conains a <div> element with contenteditable set to true; this
    is where the user would type in new stitches*/
function createNextRow(){
	numRows ++;
	$nextRow = $('<tr><td>Row ' + numRows + ':</td>' +
				'<td><div contenteditable="true" class="edit" style="width:500px;border:1px solid black;"></div></td');
	//latest row has the addrow button and feedback div
	$nextRow.append($("#addRowButton"));
	$nextRow.append($("#feedback"));
	$nextRow.focus();
	$("#patternTable").append($nextRow);

	//set up the enter handler
	$nextRow.find('.edit').keyup(function(event){
		editHandler($(this));
	});

	addRow();
	$("#interface").data("pattern")[curX] = { 0: new Array() };
};

function savePattern() {
	$.ajax({
		type: "POST",
		data: $("#interface").data("pattern"),
		dataType: "JSON",
		success: function(data) {
			console.log("pattern saved");
		},
		error: function(data) {
			console.log("error saving pattern");
		}
	});
}

/*handler that every input box needs to have as its keyup event
  for ever new input, adds a span in the following configuration:

  <span class="addedStitch [[right or wrong]]">
		<span>Stitch name</span>
		<span class="delStitch">x</span>
   </span>

   Then goes on to assign the apprpriate handlers to each of the spans.

   1. put in html into the proper row
   2. focus on the row input
   3. find text node by doing $('.edit').contents().last()[0]
   4. that text node becomes the second argument


   */
function userEnter(newRow, textnode){
	if (textnode == null){
		textnode = window.getSelection().anchorNode;
	} else if (textnode == "") {
		return;
	}
	var node = textnode;
	var text = node.textContent;
	var stitches = text.split(",");

	for(x in stitches){
		stitch = stitches[x].trim();
		if(stitch == "") continue;
		var parsedStitch = new parseInput(stitch);

		var newBox = document.createElement('span');
		var stitchBox = document.createElement('span');
		var xBox = document.createElement('span');

		stitchBox.innerHTML = parsedStitch.html;
		newBox.classList.add("addedStitch");
		newBox.classList.add("btn");
		newBox.classList.add(parsedStitch.valid);
		xBox.innerHTML = "x";
		xBox.classList.add("delStitch");

		$(xBox).click(function(){ delParent($(this));});
		$(stitchBox).click(function(){
			makeEditable($(this))
		});
		$(stitchBox).keyup(function(){
			stitchkeyup($(this));
		});
		$(stitchBox).blur(function(){
			makeUneditable($(this));
		});

		newBox.appendChild(stitchBox);
		newBox.appendChild(xBox);

		newBox.setAttribute("contenteditable", "false");

		if(document.activeElement.tagName == 'DIV'){
			try{
				(newRow.get(0)).insertBefore(newBox, node);
			} catch(err){ return; }

		} else if (document.activeElement.tagName == 'SPAN'){
			//(newRow.get(0)).replaceChild(newBox, document.activeElement.parentNode);
			(newRow.get(0)).insertBefore(newBox, document.activeElement.parentNode);
			//(newRow.get(0)).removeChild(document.activeElement.parentNode);
		}
	}

	node.replaceWholeText("");

	if (document.activeElement.tagName == 'SPAN'){
		(newRow.get(0)).removeChild(document.activeElement.parentNode);
	}
};


function parseInput(text){
	if(text == "" || text == ",") return "";
	//(
	//ch, ch #, sc, hdc, tr, htr, dc, dtr, sk, sk #
	//) # times, in same stitch, in next stitch
	var chainPattern = /^ch(\s+\d+)?$/;
	var stitchPattern = /^(sc|hdc|tr|htr|dc|dtr)(\s+in same stitch|\s+in next stitch|\s+in chain space)?$/;
	var skipPattern = /^sk(\s+\d+)?$/

	var matching = text.match(chainPattern);
	if(matching != null){
		var numChain = 1;
		if(matching[1] != undefined){
			numChain = parseInt(matching[1], 10);
		}
		//TODO make the CH object with numChain
		for (var i=0; i < numChain; i++) {
			addChain();
		}
		//return '<input type="text" class="right" value="ch ' + numChain + '     x" readonly>'
		//return getHTMLBox("ch " + numChain, true);
		this.html = "ch " + numChain;
		this.valid = "right";
		return;
	}

	matching = text.match(stitchPattern);
	if(matching != null){
		//if start of pattern, add first row
		if (!(0 in rows)) {
			addRow();
			$("#interface").data("pattern", {
				0: {
					0: new Array()
				}
			});
		}
		//name of the stitch
		var stitch = matching[1];
		var location = ""

		var rowData = $("#interface").data("pattern")[curX];
		if (matching[2] != null) {
			if (matching[2].trim() == "in same stitch") {
				removeCluster();
				rowData[curCluster].push(stitch.toUpperCase());
				delete rowData[curCluster+1];
			} else {
				rowData[curCluster] = [stitch.toUpperCase()];
			}
		} else {
			rowData[curCluster] = [stitch.toUpperCase()];
		}

		addStitch(new Stitch(stitch.toUpperCase()));
		addCluster();

		this.html = matching.slice(1).filter(function(x) {
			return x != null;
		}).reduce(function(x, y) {
			return x.trim() + " "+y.trim();
		});

		//this.html = stitch;
		this.valid = "right";
		return;
	}

	matching = text.match(skipPattern);
	if(matching != null){
		var numSkip = "";
		if(matching[1] != undefined){
			numSkip = parseInt(matching[1]);
		}
		//return getHTMLBox("sk " + numSkip, true);
		skipStitch();
		var rowData = $("#interface").data("pattern")[curX];
		if (!(curCluster-1 in rowData)) {
			rowData[curCluster-1] = new Array();
		}
		rowData[curCluster] = new Array();
		this.html = "sk " + numSkip;
		this.valid = "right";
		return;
	}

	//return getHTMLBox(text, false);
	this.html = text;
	this.valid = "wrong";
	return;

};

function delParent(obj){
	obj.parent().remove();
};

function makeEditable(obj){
	obj.attr("contenteditable", "true");
	obj.parent().parent().attr("contenteditable", "false");
	//console.log(obj.parent().parent());
};

function makeUneditable(obj){
	obj.attr("contenteditable", "false");
	obj.parent().parent().attr("contenteditable", "true");
};

function stitchkeyup(obj){
	var parsedStitch = new parseInput(obj.html());
	obj.parent().removeClass("right");
	obj.parent().removeClass("wrong");
	obj.parent().addClass(parsedStitch.valid);

};