(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 100
    });

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Offset for Main Navigation
    $('#mainNav').affix({
        offset: {
            top: 50
        }
    })

    $(window).resize(function(){
        insertBackgroundVideo();
    });

    insertBackgroundVideo();

    function insertBackgroundVideo() {
        if ($(window).width() > 1024) {
            $('#video-bg').empty();
            $('#video-bg').append('<video src="img/mable.mp4" autoplay loop></video>');
        } else {
            $('#video-bg').empty();
        }
    }

})(jQuery); // End of use strict
