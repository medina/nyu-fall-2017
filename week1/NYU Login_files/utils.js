//scroll to hide address bar on mobile devices
var scrollPosition = window.scrollY || window.pageYOffset || $(window).scrollTop();
if (!scrollPosition) {
	window.scrollTo(0, 1);
}

$(document).ready(function() {
	$("#netid").blur(function() {
		lowerCase();	
	});
	
	//clicking on terms link
	$(".nav-terms").click(function(e) {
		e.preventDefault();
		$(".nav-terms, .error, .help, .login, .logout").hide();
		$(".nav-login").parent().addClass("right");
		$(".nav-login, .terms").show();	
	});
	
	//clicking on help link
	$(".nav-help").click(function(e) {
		e.preventDefault();
		$(".nav-help, .error, .login, .logout").hide();
		$(".help").show();
		$(".nav-login").parent().addClass("left");
		$(".nav-login").show();	

		if ($(window).width() <= 600) {
			$(".terms").hide();	
		}
		
		//if help is showing, change the top margin for terms to be better aligned
		if ($(".help").is(":visible")) {	
			$(".terms").animate({
				"marginTop": "20px"								
			}, "slow").css({
				"min-height": "200px"
			});
		}
		
	});		
	
});

function lowerCase() {
	var input=document.getElementById("netid").value
	document.getElementById("netid").value=input.toLowerCase()
}
