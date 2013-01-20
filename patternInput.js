var numRows = 0;
var pattern = new Array();

$(document).ready(function(){
	$("#addRowButton").click(function(){
		numRows ++;
		createNextRow();
	});

	$(".edit").keyup(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(! (keycode == '13' || keycode == '188')) return;
		userEnter($(this));
	});

	$(".edit").keydown(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			event.preventDefault();
		}if (keycode == '8'){
			var sel = window.getSelection();
			var anchor = sel.anchorNode;

			if(sel.anchorNode.nodeType == 3) return;
			if(sel.anchorNode.nodeType == 1){
				event.preventDefault();
				var removed = $(this).children('span')[sel.anchorOffset-1];
				$(removed).remove();
			}
		}
	});

	// $.ajax({
	// 	type: "GET",
	// 	dataType: "JSON",
	// 	data: {"pattern":"pattern 2"},
	// 	success: function(data) {
	// 		$("#interface").data("pattern", data);
	// 		parsePattern(data);
	// 		console.log("pattern loaded");
	// 	},
	// 	error: function() {
	// 		console.log("error loading pattern");
	// 	}
	// })

	// $.getJSON("/accounts/login/", {"pattern":"pattern"},
	// 	function(data){
	// 		$("#interface").data("pattern", data);
	// 		parsePattern(data);
	// 		console.log("pattern loaded");
	// });

	function parsePattern(pattern) {
		var row = 0;
		var cluster = 0;

		while (row in pattern) {
			addRow();
			while (cluster in pattern[row]) {
				if (pattern[row][cluster].length == 0) {
					skipStitch();
				} else {
					for (var i=0; i < pattern[row][cluster].length; i++) {
						addStitch(new Stitch(pattern[row][cluster][i]));
					}
					addCluster();
				}
				cluster++;
			}
			cluster = 0;
			row++;
		}
		curCluster--;
	}

	//example format for saving patterns
	// var testData = {
	// 	0:{
	// 		0:["HDC"],
	// 		1:["HDC"],
	// 		2:["HDC"],
	// 		3:["HDC"],
	// 	},
	// 	1: {
	// 		0:["HDC", "HDC"],
	// 		1:[],
	// 		2:["HDC"],
	// 		3:["HDC"]
	// 	},
	// 	2: {
	// 		0:["HDC", "HDC"],
	// 	}
	// };
	$(".pattern").load(function() {
			$("#interface").data("pattern", $(this).attr("pattern"));
			console.log($("#interface").data("pattern"));
	parsePattern($("#interface").data("pattern"));
	});
});


/* creates a new row in the table that contains the pattern instructions
    each row conains a <div> element with contenteditable set to true; this
    is where the user would type in new stitches*/
function createNextRow(){
	$nextRow = $('<tr><td>Row ' + numRows + ':</td>' +
				'<td><div contenteditable="true" class="edit" style="width:500px;border:1px solid black;"></div></td');
	//latest row has the addrow button and feedback div
	$nextRow.append($("#addRowButton"));
	$nextRow.append($("#feedback"));
	$("#patternTable").append($nextRow);

	//set up the enter handler
	$nextRow.find('.edit').keyup(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(! (keycode == '13' || keycode == '188')) return;
		userEnter($(this));
	});

	$nextRow.find('.edit').keydown(function(event){
		var keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == '13'){
			event.preventDefault();
		}if (keycode == '8'){
			var sel = window.getSelection();
			var anchor = sel.anchorNode;

			if(sel.anchorNode.nodeType == 3) return;
			if(sel.anchorNode.nodeType == 1){
				event.preventDefault();
				var removed = $(this).children('span')[sel.anchorOffset-1];
				$(removed).remove();
			}
		}
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

   Then goes on to assign the apprpriate handlers to each of the spans. */
function userEnter(newRow){
	var node = window.getSelection().anchorNode;
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
		var numChain = "";
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
		//name of the stitch
		var stitch = matching[1];
		var location = ""

		if(matching[2] != undefined){
			location = matching[2];
			this.html = stitch.trim() + " " + location.trim();
			this.valid = "right";
			return;
		}
		//TODO make the Stitch object with numChain
		addStitch(new Stitch(stitch.toUpperCase()));
		$("#interface").data("pattern")[curX][curCluster].push(stitch.toUpperCase());
		//return getHTMLBox(stitch, true);

		this.html = stitch;
		this.valid = "right";
		return;
	}

	matching = text.match(skipPattern);
	if(matching != null){
		var numSkip = "";
		if(matching[1] != undefined){
			numSkip = parseInt(matching[1], 10);
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