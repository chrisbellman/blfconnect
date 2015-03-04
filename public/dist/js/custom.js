function colorChange(button, color) {
	var element = $(button).parents('.panel').find('#panel-background');
	element.removeClass('user-panel-green');
	element.removeClass('user-panel-yellow');
	element.removeClass('user-panel-red');
	if (color === 'green')
		element.addClass('user-panel-green');
	else if (color === 'yellow')
		element.addClass('user-panel-yellow');
	else if (color === 'red')
		element.addClass('user-panel-red');
}

$(document).ready(function () {
	$('.green-button').click(function() {
		colorChange(this, 'green');
	});
	
	$('.yellow-button').click(function() {
		colorChange(this, 'yellow');
	});
	
	$('.red-button').click(function() {
		colorChange(this, 'red');
	});
});