"use strict";

function validateEmail(email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{1,4})?$/;
    if (!emailReg.test(email)) {
        return false;
    } else {
        return true;
    }
}

function validateContactNumber(number) {
    var numberReg = /^((\+)?[1-9]{1,3})?([-\s\.])?((\(\d{1,4}\))|\d{1,4})(([-\s\.])?[0-9]{1,12}){1,2}$/;
    if (!numberReg.test(number)) {
        return false;
    } else {
        return true;
    }
}

function validateTextOnly(text) {
    var textReg = /^[A-z]+$/;
    if (!textReg.test(text)) {
        return false;
    } else {
        return true;
    }
}

function validateNumberOnly(number) {
    var numberReg = /^[0-9]+$/;
    if (!numberReg.test(number)) {
        return false;
    } else {
        return true;
    }
}

function checkElementValidation(child, type, check, error) {

    child.parent().find('.error-message').remove();

    if ( child.val() == "" && child.attr("data-required") == "required" ) {
        child.addClass("error");
        child.parent().append('<span class="error-message">' + child.parents("form").attr("data-required") + '</span>');
        child.parent().find('.error-message').css("margin-left", -child.parent().find('.error-message').innerWidth()/2);
        return false;
    } else if( child.attr("data-validation") == type && 
        child.val() != "" ) {

        if( !check ) {
            child.addClass("error");
            child.parent().append('<span class="error-message">' + error + '</span>');
            child.parent().find('.error-message').css("margin-left", -child.parent().find('.error-message').innerWidth()/2);
            return false;
        }
    }

    child.removeClass("error");
    return true;
}

function checkFormValidation(el) {
    var valid = true,
        children = el.find('input[type="text"], textarea');

    children.each(function(index) {
        var child = children.eq(index);
        var parent = child.parents("form");

        if( !checkElementValidation(child, "email", validateEmail(child.val()), parent.attr("data-email")) ||
            !checkElementValidation(child, "phone", validateContactNumber(child.val()), parent.attr("data-phone")) ||
            !checkElementValidation(child, "text_only", validateTextOnly(child.val()), parent.attr("data-text")) ||
            !checkElementValidation(child, "number", validateNumberOnly(child.val()), parent.attr("data-number")) 
        ) {
            valid = false;
        }
    });

    return valid;
}

jQuery.fn.serializeObject = function()
{
var o = {};
var a = this.serializeArray();
$.each(a, function() {
    if (o[this.name]) {
        if (!o[this.name].push) {
            o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
    } else {
        o[this.name] = this.value || '';
    }
});
return o;
};

$(function() {

  /* Top bar */

  function topBarSize() {
    var el = $('.top-bar .container');
    el.css( {
      'display' : 'none',
      'height'  : 'auto' 
    }).attr('data-height', el.height()).attr('style', 'height: 0;').parent().removeClass('open');
  }

  $('.top-bar .close').on('click', function() {
    var el = $('.top-bar');
    var child = $('.top-bar .container');
    el.toggleClass('open');  

    if( el.hasClass('open') ) {
      child.height(child .attr('data-height'));
    } else {
      child.attr('style', 'height: 0;');
    }
  });

  topBarSize();

  $(window).resize(function() {
    topBarSize();

    siteNavigationSizing();
  });

  /* Site navigation dropdown */

  function siteNavigationSizing() {
    var el = $('.site-navigation > ul > li.menu-item-has-children, .site-navigation > ul > li.menu-item-has-children-parent');
    el.each(function(index) {
      var child = el.eq(index).children(".sub-menu");
      child.css({
        'display' : 'none',
        'height'  : 'auto'
      });

      child.attr('data-height', child.height());
      child.attr('style', '');
      el.addClass('menu-item-has-children-parent');
      el.removeClass('menu-item-has-children');
    });
  }

  siteNavigationSizing()

  var navInterval = ""

  $('.site-navigation > ul > li').hover(function() {
    if( $('body').width() > 767 ) {
      var el = $(this).children(".sub-menu");
      el.css('height', el.attr('data-height'));
      navInterval = setInterval(function() {
        el.css("overflow", "visible");
        clearInterval(navInterval);
      }, 300 );
    }
  }, function() {
    $(this).children(".sub-menu").attr('style', '');
    clearInterval(navInterval);
  });

  /* Site search */

  $('.nav-wrap .fa-search').on('click', function() {
    $("html, body").animate({ scrollTop: 0 }, "slow");
    $('.site-search .container').toggleClass('open');
  })

  $('.site-search .close').on('click', function() {
    $('.site-search .container').removeClass('open');;
  })

  /* Mobile navigation */

  $('.navbar-toggle').on('click', function() {
    $('.site-navigation').toggleClass('open');
  })

  /* Tabs */

  $('.nav-tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  });


  /* Contact Form on SUBMIT */

  $('input[type="text"], textarea').on("blur", function(){
      var parent = $(this).parents("form");

      if( !checkElementValidation($(this), "email", validateEmail($(this).val()), parent.attr("data-email")) ||
          !checkElementValidation($(this), "phone", validateContactNumber($(this).val()), parent.attr("data-phone")) ||
          !checkElementValidation($(this), "text_only", validateTextOnly($(this).val()), parent.attr("data-text")) ||
          !checkElementValidation($(this), "number", validateNumberOnly($(this).val()), parent.attr("data-number"))) {
      }
  });

  $('[data-form="submit"]').on('click', function(e) {
      $(this).parents('form.contact-form').submit();
      e.preventDefault();
  });

  $("form.contact-form").on("submit", function(e) {
      $(".contact-success").remove();
      var el = $(this);
      var formData = el.serializeObject();

      if(checkFormValidation(el)) {
          try {
              $.ajax({
                  type: "POST",
                  url: 'http://localhost/altus/assets/php/mail.php',
                  data: {
                      form_data : formData,
                  }
              }).success(function(msg) {
                $("form.contact-form").append('<div class="row"><div class="col-md-12"><div class="alert alert-success contact-success"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><i class="fa fa-check"></i>' + $("form.contact-form").attr("data-success") + '</div></div></div>');
              });
          } catch(e) { console.log(e); }
      }

      e.preventDefault();
      return false;
  });

  /* Contact Form on Clear */

  $('[data-form="clear"]').on('click', function() {
      var el = $(this).parents('form.contact-form').find('input[type="text"], textarea');
      el.each(function(index) {
          el.eq(index).val("");
          el.eq(index).removeClass("error");
          el.eq(index).parent().find(".error-message").remove();
      });

      if( $(this).parents('form.contact-form').next().hasClass("success") ) {
          $(this).parents('form.contact-form').next().remove();
      }

      return false;
  });  

  /* Portfolio */
  try {
    var $container = $('.isotope');
    if($container.length) {
      var first_scroll = true;
      $(window).scroll(function() {
          if(first_scroll) {
              $container.isotope();
              first_scroll = false;
          }
      });
      $(window).focus(function(){
          $container.isotope();
      });
      $container.isotope({
          itemSelector : '.isotope li',
          layoutMode: 'fitRows',
          animationOptions: {
              duration: 750,
              queue: false,
          }
      });
      $('.filter button').on('click', function() {
          $('.filter button').removeClass('selected');
          $(this).addClass("selected");
          var item = "";
          if( $(this).attr('data-filter') != '*' ) {
              item = ".";
          }
          item += $(this).attr('data-filter');
          $container.isotope({ filter: item });
      });
      $(window).smartresize(function(){
          var item = "";
          if( $('.filter button.selected').attr('data-filter') != '*' ) {
              item = ".";
          }
          item += $('.filter button.selected').attr('data-filter');
          $container.isotope({ filter: item });
          $(".isotope").isotope('reLayout');
      });

      $(document).ready(function(){
        $(window).load(function() {
          $(".isotope").isotope('reLayout');
        });
      });
    }
  } catch (e) { }

  /* Sticky menu */
  var sticky = $('.nav-wrap');

  $(window).scroll(function() {
    if( $(window).scrollTop() > $('.site-search').height() + $('.top-bar').height() ) {
       sticky.addClass('active');
    } else {
        sticky.removeClass('active');
    }
  });
});