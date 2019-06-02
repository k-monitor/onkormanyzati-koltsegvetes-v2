(function ($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 72)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function () {
    $('.navbar-collapse').collapse('hide');
  });

  // Remove focus
  $('.js-scroll-trigger').click(function () {
    $(this).blur();
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 75
  });

  // Collapse Navbar
  var navbarCollapse = function () {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-scrolled");
    } else {
      $("#mainNav").removeClass("navbar-scrolled");
    }
  };
  // Collapse now if page is not at top
  navbarCollapse();
  // Collapse the navbar when page is scrolled
  $(window).scroll(navbarCollapse);

})(jQuery); // End of use strict

function groupNums(v, ns) {
  var s = ['', 'e', 'M', 'Mrd'];
  var i = 0;
  v = Number(v);
  while (ns && i < s.length && v > 1000) {
    v /= 1000;
    i++;
  }
  v = Math.round(v);
  var vs = (v + '').replace(/\d(?=(?:\d{3})+(?:\.|$))/g, function ($0, i) { return $0 + ' ' });
  return (vs + ' ' + s[i] + ' Ft').trim();
}

function intro() {
  setTimeout(function () {
    introJs()
      .setOption("doneLabel", "Kilépés")
      .setOption("nextLabel", "Tovább")
      .setOption("prevLabel", "Vissza")
      .setOption("showBullets", false)
      .setOption("showProgress", false)
      .setOption("showStepNumbers", false)
      .setOption("skipLabel", "Kilépés")
      .start();
  }, 1000);
}