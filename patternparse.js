var numRows = 0;
var pattern = new Array();

$(document).ready(function(){
	$("#newRow").click(function(){
		var success = parseRow();

		if(success){
			notifyError("");
			numRows ++;
			createNextRow();
		}

	});
});

function parseRow(){
	pattern[numRows] = new Array();

	var input = $("input[name='r" + numRows + "']").val();
	input = input.trim();
	input = input.toLowerCase();

	if(numRows == 0){
		return parseFirstRow(input);
	}

	for(var i=0; i<input.length; i++){

	}
};

function parseFirstRow(input){
	var num;

	if(input.indexOf("chain ") == 0){
		num = input.substring(6, input.length);
	} else if (input.indexOf("ch ") == 0){
		num = input.substring(3, input.length);
	} else {
		notifyError('Foundation needs to be in form of "ch x" or "chain x"');
		return false;
	}

	num = Number(num);
	if(posInt(num) == -1){
		notifyError('Number of chains needs to be a positive integer.');
		return false;
	}

	pattern[0][0] = num;
	console.log(pattern[0][0]);
	return true;
};

function notifyError(message){
	$("#feedback").html("<strong>" + message + "</strong>");
}

function createNextRow(){
	$nextRow = $('<tr><td>Row' +  numRows + ':</td>' +
			'<td><input type="text" name="r' + numRows + '"></input><td></tr>');
	$("#patternTable").append($nextRow);
	$nextRow.append($("#newRow"));
	$nextRow.append($("#feedback"));
}

function posInt(num){
	num = Number(num);
	if (isNaN(num)) return -1;
	else if (num %1 != 0) return -1;
	else if (num <= 0) return -1;
	else return num;
}