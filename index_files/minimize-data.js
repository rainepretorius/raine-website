// Run when the page ready (before images and other resource)
jQuery(function($) {
  var rtl = $('html[dir=rtl]').length === 1;
  var $section = $('section.s123-page-data-products');
  var $mainImage = $section.find('.main-image > div');
  var $productOwlcarousel = $section.find('#productOwlcarousel');
  if ($section.length === 0) return;
  jQueryZoomInitialize($mainImage);
  $productOwlcarousel.owlCarousel({
    autoPlay: false,
    items: 4,
    margin: 10,
    stagePadding: 5,
    startPosition: 0,
    loop: false,
    center: false,
    nav: true,
    rtl: rtl,
    navText: ['<i class="fa fa-2x fa-angle-' + (rtl ? 'right' : 'left') + '" aria-hidden="true"></i>', '<i class="fa fa-2x fa-angle-' + (rtl ? 'left' : 'right') + '" aria-hidden="true"></i>'],
    dots: true
  });
  $productOwlcarousel.find('.item').click(function() {
    var $clickedImage = $(this).find('.item-image');
    var videoPath = '';
    if ($clickedImage.data('media-type') == 'video') {
      videoPath = $clickedImage.data('video-path');
    }
    jQueryZoomInitialize($clickedImage);
    $mainImage.css({
      backgroundImage: $clickedImage.css('background-image')
    });
  });

  function jQueryZoomInitialize($clickedImage) {
    if (!$mainImage || $mainImage.length === 0) return;
    if (!$clickedImage || $clickedImage.length === 0) return;
    if ($clickedImage.data('media-type') == 'video') {
      $mainImage.empty();
      $('<iframe data-player="site123" style="color:white;width:' + $mainImage.width() + 'px;height:' + $mainImage.height() + 'px" type="text/html" src="' + '/include/globalVideoPlayer.php?cad=1&url=' + $clickedImage.data('video-path') + (isMobile.any() ? '&autoplay=false' : '&autoplay=true') + '" frameborder="0" allowfullscreen=""></iframe>').appendTo($mainImage);
    } else {
      $mainImage.empty();
      var url = $clickedImage.data('zoom-image');
      if (isMobile.any()) return;
      $mainImage.trigger('zoom.destroy');
      var loading = $('<div style="position:absolute;width:100%;height:100%;z-index:99999;"></div>').appendTo($mainImage);
      $mainImage.zoom({
        url: url,
        magnify: 1,
        touch: true,
        callback: function() {
          loading.remove();
        },
      });
    }
  }
  (function() {
    var $productOptions = $section.find(".product-options");
    var $options = $productOptions.find('.p-o-container');
    if ($productOptions.length !== 0) {
      $options.filter('[data-type="color"]').each(function() {
        var $option = $(this);
        var $colors = $option.find('.p-o-color');
        $colors.click(function(event) {
          var $color = $(this);
          $colors.filter('.selected').removeClass('selected');
          $color.addClass('selected');
          $option.find('.p-o-item-value').html(fixQuotIssue($color.attr('title')));
          update();
        });
        $colors.first().trigger('click'); // default value
      });
      $options.filter('[data-type="list"]').each(function() {
        var $option = $(this);
        var $list = $option.find('.p-o-list');
        $list.change(function(event) {
          $option.find('.p-o-item-value').html(fixQuotIssue($list.val()));
          update();
        }).trigger('change'); // default value
      });
      update();
    }

    function update() {
      var po = [];
      var totalItemsPrice = 0.00;
      $options.each(function() {
        var $option = $(this);
        var pOption = new ProductOptions();
        pOption.id = $option.get(0).id;
        pOption.title = fixQuotIssue($option.data('title'));
        pOption.type = $option.data('type');
        switch ($option.data('type')) {
          case 'color':
            var $color = $option.find('.p-o-color.selected');
            if ($color.length === 0) return;
            pOption.item.id = $color.get(0).id
            pOption.item.title = fixQuotIssue($color.attr('title'));
            pOption.item.price = $color.data('price');
            break;
          case 'list':
            var $list = $option.find('.p-o-list');
            var $listSelectedOpt = $list.find('option:selected');
            if ($list.find('option').length === 0) return;
            pOption.item.id = $listSelectedOpt.get(0).id;
            pOption.item.title = fixQuotIssue($list.val());
            pOption.item.price = $listSelectedOpt.data('price');
            break;
        }
        totalItemsPrice += parseFloat(pOption.item.price);
        po.push(pOption);
      });
      $('#productOptions').html(JSON.stringify(po));
      addItemsPrice(totalItemsPrice);
    }

    function ProductOptions() {
      return {
        id: null,
        title: null,
        type: null,
        item: {
          id: null,
          title: null,
          price: 0
        }
      };
    }

    function addItemsPrice(totalItemsPrice) {
      var $productPrice = $section.find('#productPrice');
      var $price = $productPrice.find('[data-type="price"]');
      if (!$.isNumeric(totalItemsPrice)) return;
      if (parseFloat($productPrice.data('price')) +
        parseFloat(totalItemsPrice) == parseFloat($price.html())) return;
      var p = parseFloat($productPrice.data('price')) + parseFloat(totalItemsPrice);
      $price.html(p.toFixed(2));
    }
  })();
  (function() {
    var $ct = $section.find("#product-custom-text");
    var $ct_fieldTitle = $ct.find("#ct_fieldTitle");
    var $ct_charLimit = $ct.find("#ct_charLimit");
    var $orderButtonPopup = $section.find(".orderButtonPopup");
    $ct_fieldTitle.on('input', function(event) {
      var max = $ct.data('char-limit');
      var length = $ct_fieldTitle.val().length
      if (length > max) {
        $ct_fieldTitle.val($ct_fieldTitle.val().substring(0, max));
      } else {
        $ct_charLimit.html(max - length);
      }
    });
    $ct_fieldTitle.blur(function(event) {
      update();
    });
    $orderButtonPopup.click(function(event) {
      update();
    });

    function update() {
      var ct = new CustomText();
      ct.fieldTitle = fixQuotIssue($ct.data('field-title'));
      ct.value = $ct_fieldTitle.val();
      $('#customText').html(JSON.stringify(ct));
    }

    function CustomText() {
      return {
        fieldTitle: null,
        value: null
      };
    }
  })();

  function fixQuotIssue(value) {
    if (!value) return value;
    return value.toString().replace(/\&quot;/g, '\"');
  }
  $('.quantity_field').on('input', function() {
    var $this = $(this);
    if ($this.val().length > 0 && !$.isNumeric($this.val())) $this.val(1);
    if (!$.isNumeric($this.val())) $this.val($this.val().replace(/[^0-9]/g, ''));
    if ($.isNumeric($this.val()) && $this.val() <= 0) $this.val(1);
    if (parseInt($this.val()) > parseInt($this.prop('max'))) {
      $this.val($this.prop('max'));
      quantityPopover($this, translations.productQuntityLimit.replace('{{units_limitation}}', $this.prop('max')));
    } else if (parseInt($this.val()) < parseInt($this.prop('min'))) {
      $this.val($this.prop('min'));
      quantityPopover($this, translations.productQuntityLimitMin.replace('{{units_limitation}}', $this.prop('min')));
    }
    $section.find('.btn-buy-now.orderButtonPopup').data('quantity-amount', $this.val());
  });

  function quantityPopover($input, message) {
    $input.popover({
      container: $section,
      content: message,
      trigger: 'manual',
      template: '<div class="popover cart-validator-popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
      placement: function(popover, input) {
        return isMobile.any() ? 'auto' : 'bottom';
      }
    });
    $input.popover('show');
    clearTimeout($input.data('q-p-timeout'));
    $input.data('q-p-timeout', setTimeout(function() {
      $input.popover('destroy');
    }, 3000));
  }

  function updateQuantity($input, operator) {
    if ($input.closest('.quantity-container').data('disabled') == '1') return;
    var quantity = parseInt($input.val());
    var maxQuantity = parseInt($input.attr('max'));
    var minQuantity = parseInt($input.attr('min'));
    if (operator === 'plus' && (quantity + 1) > maxQuantity) {
      quantityPopover($input, translations.productQuntityLimit.replace('{{units_limitation}}', $input.prop('max')));
    } else if (operator === 'minus' && quantity !== 1 && (quantity - 1) < minQuantity) {
      quantityPopover($input, translations.productQuntityLimitMin.replace('{{units_limitation}}', $input.prop('min')));
    }
    if (operator === 'minus' && quantity > minQuantity) quantity = quantity - 1;
    if (operator === 'plus' && quantity < maxQuantity) quantity = quantity + 1;
    if (!$.isNumeric(quantity)) quantity = 1;
    $section.find('.btn-buy-now.orderButtonPopup').data('quantity-amount', quantity);
    $input.val(quantity);
  }
  $section.find('.quantity-plus-btn').off('click').on('click', function() {
    updateQuantity($(this).closest('.quantity-container').find('.quantity_field'), 'plus');
  });
  $section.find('.quantity-minus-btn').off('click').on('click', function() {
    updateQuantity($(this).closest('.quantity-container').find('.quantity_field'), 'minus');
  });
});
jQuery(function($) {
  var rtl = $('html[dir=rtl]').length === 1;
  var $section = $('section.s123-page-data.s123-module-events.s123-page-data-events');
  var $mainImage = $section.find('.main-image > div');
  var $productOwlcarousel = $section.find('.productOwlcarousel');
  if ($section.length === 0) return;
  $productOwlcarousel.owlCarousel({
    autoPlay: false,
    items: 4,
    margin: 10,
    stagePadding: 5,
    startPosition: 0,
    loop: false,
    center: false,
    nav: true,
    rtl: rtl,
    navText: ['<i class="fa fa-2x fa-angle-' + (rtl ? 'right' : 'left') + '" aria-hidden="true"></i>', '<i class="fa fa-2x fa-angle-' + (rtl ? 'left' : 'right') + '" aria-hidden="true"></i>'],
    dots: true
  });
  $productOwlcarousel.find('.item').click(function() {
    var $clickedImage = $(this).find('.item-image');
    var videoPath = '';
    if ($clickedImage.data('media-type') == 'video') {
      videoPath = $clickedImage.data('video-path');
    }
    $mainImage.css({
      backgroundImage: $clickedImage.css('background-image')
    });
  });
  googleMapPopUp.init({
    locationData: $section.find('.mapPopupActivator'),
    mapsDisplayDomain: $GLOBALS["maps-display-domain"],
    longFreeCustomer: longFreeCustomer,
    language: languageCode
  });
  $productOwlcarousel.find('.item').click(function() {
    var $clickedImage = $(this).find('.item-image');
    $mainImage.css({
      backgroundImage: $clickedImage.css('background-image')
    });
  });
  initializeTickets($section);
});
jQuery(function($) {
  $(document).on('s123.page.ready_data_pages', function(event) {
    ScheduleBookingInit();
  });
  ScheduleBookingInit();
});

function ScheduleBookingInit() {
  var $section = $('section.s123-page-data-schedule-booking');
  if ($section.length === 0) return;
  bookingInit($section);
}
jQuery(function($) {
  var rtl = $('html[dir=rtl]').length === 1;
  var $section = $('section.s123-page-data-forum');
  var $postDateTime = $section.find('.post-date-time');
  var $shareReplyBtn = $section.find('.share-reply-btn');
  var $topicContainer = $section.find('.topic-container');
  var $buttonsContainer = $section.find('.reply-buttons-container');
  var $suggestedTopics = $section.find('.f-suggested-topics');
  var $mainTopic = $topicContainer.find('.forum-main-topic');
  var $replies = $topicContainer.find('.f-replies');
  var itemUniqueID = $topicContainer.data('module-unique-id');
  var categoryUniqueID = $topicContainer.data('category-id') ? $topicContainer.data('category-id') : '';
  var topicUniqueID = $topicContainer.data('unique-id');
  var loginURL = $topicContainer.attr('data-login-url');
  var websiteID = $topicContainer.data('website-id');
  var dateTime = $topicContainer.data('date-time');
  var searchURL = $topicContainer.data('search-url');
  var w = $('#w').val();
  var replyID = $topicContainer.data('reply-id');
  var topicURL = $topicContainer.data('topic-url');
  var customLabels = $('.custom-labels').val();
  if ($section.length === 0) return;
  customLabels = jQuery.parseJSON(customLabels);
  $.ajax({
    type: "POST",
    url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/getTopicData.php",
    data: 'w=' + w + '&websiteID=' + websiteID + '&uniqueID=' + topicUniqueID + '&categoryUniqueID=' + categoryUniqueID,
    success: function(data) {
      var dataObj = jQuery.parseJSON(data);
      dateTime = dataObj.time;
      $buttonsContainer.each(function(index, buttonContainer) {
        var $buttonContainer = $(buttonContainer);
        var replyUniqueID = $buttonContainer.attr('data-reply-id') ? $buttonContainer.data('reply-id') : '';
        var $html = generateButtonsHTML(websiteID, topicUniqueID, itemUniqueID, dataObj, loginURL, replyUniqueID, index, customLabels);
        initializeButtons(websiteID, topicUniqueID, categoryUniqueID, $html, topicURL);
        $buttonContainer.prepend($html);
      });
      Forum_updateActivityDateTime(dateTime, $postDateTime);
      displayEditPostBtn(dateTime, $postDateTime, dataObj);
      var $sideMenuContainer = generateTopicSideMenu(dataObj, topicUniqueID, $topicContainer, websiteID, topicUniqueID, w, dateTime, itemUniqueID, customLabels);
      $topicContainer.append($sideMenuContainer);
      var topicsContainersHeight = $('#topicBox').outerHeight(); // OLD CODE: $replies.outerHeight() + $mainTopic.outerHeight();
      var sideMenuContainerHeight = $sideMenuContainer.outerHeight();
      updateSideMenuPosition($sideMenuContainer, topicsContainersHeight, sideMenuContainerHeight);
      $(window).scroll(function() {
        updateSideMenuPosition($sideMenuContainer, topicsContainersHeight, sideMenuContainerHeight);
      });
      Forum_initializeSearch($section, websiteID, itemUniqueID, searchURL, dateTime);
      $topicContainer.find('.topic-buttons').append(generateSmallTopicMenu(dataObj, topicUniqueID, $topicContainer, websiteID, topicUniqueID, w, dateTime, searchURL, customLabels));
    }
  });
  shareBtnClickEvent($shareReplyBtn);
  $section.find('.forum-avatar').each(function(key, value) {
    Forum_initializeClientCard($(value), websiteID, w, itemUniqueID);
  });
  Forum_updateActivityDateTime(dateTime, $suggestedTopics.find('.topic-last-activity'));
  increaseTopicViews(w, websiteID, topicUniqueID);
  if (replyID.length > 0) {
    scrollToReply(replyID);
  }
});

function scrollToReply(replyID) {
  if ($('#' + replyID).length === 0) return;
  $('html, body').animate({
    scrollTop: $('#' + replyID).offset().top
  }, 1000);
}

function generateSmallTopicMenu(topicData, topicUniqueID, $topicContainer, websiteID, uniqueID, w, dateTime, searchURL, customLabels) {
  var html = '<div class="small-menu-container well box-primary hidden-lg hidden-md">';
  html += '<div class="row small-topic-row">';
  html += '<div class="col-xs-12 text-center f-small-menu-buttons">';
  html += '<div class="row">';
  html += '<div class="btn-group">';
  html += '<a class="btn btn-primary forum-search-btn" href="' + searchURL + '&q="><span><i class="fa fa-search"></i></span></a>';
  html += '</div>';
  if (topicData.loggedIn) {
    html += '<div class="btn-group">';
    html += '<button type="button" class="btn btn-primary follow-topic-btn" data-topic-id="' + topicUniqueID + '"><span><i class="fa fa-bell-o"></i></span><span class="follow-topic-title hidden-xs"> ' + customLabels.follow + '</span></button>';
    html += '</div>';
  } else {
    html += '<a class="btn btn-primary" href="' + $topicContainer.data('login-url') + '"><span><i class="fa fa-bell-o"></i></span><span class="follow-topic-title hidden-xs"> ' + customLabels.follow + '</span></a>';
  }
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="row small-topic-row">';
  html += '<div class="col-xs-6 text-center">';
  html += '<div class="row">';
  html += '<div class="col-xs-12">';
  html += '<span>' + translations.forumLastReply + '</span>';
  html += '</div>';
  html += '<div class="col-xs-12">';
  html += '<div class="last-reply-avatar side-menu-avatar"></div>';
  html += '<div class="last-reply-time side-menu-time"></div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="col-xs-6 text-center">';
  html += '<div class="row">';
  html += '<div class="col-xs-12">';
  html += '<span>' + translations.forumReplies + '</span>';
  html += '</div>';
  html += '<div class="col-xs-12" style="line-height: 30px;">';
  html += '<span><b>' + topicData.totalReplies + '</b></span>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  if (topicData.avatars.length > 0) {
    html += '<div class="row small-topic-row">';
    html += '<div class="col-xs-12 side-menu-top-line">';
    html += '<div><span>' + translations.forumFrequentPosters + ':</span></div>';
    html += '<div class="replies-avatars side-menu-avatar"></div>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';
  $html = $(html);
  $html.find('.created-avatar').append(Forum_setAvatar(topicData.ownerAvatar[0].image, 100, topicData.ownerAvatar[0].name, topicData.ownerAvatar[0].color));
  $html.find('.created-avatar').addClass('forum-avatar');
  $html.find('.created-avatar span').addClass('avatar-img');
  $html.find('.created-time').append(setCreateTime(topicData.createTime, dateTime));
  if (!jQuery.isEmptyObject(topicData.lastReply)) {
    $html.find('.last-reply-avatar').append(Forum_setAvatar(topicData.lastReply.avatar[0].image, 100, topicData.lastReply.avatar[0].name, topicData.lastReply.avatar[0].color));
    $html.find('.last-reply-time').append(setCreateTime(topicData.lastReply.createTime, dateTime));
  } else {
    $html.find('.last-reply-avatar').html('--');
  }
  var $followReplyBtn = $html.find('.follow-topic-btn');
  if (topicData.follower == true) {
    $followReplyBtn.addClass('topic-follow');
    $followReplyBtn.find('.follow-topic-title').html(' ' + translations.following);
  }
  $followReplyBtn.click(function() {
    $.ajax({
      type: "POST",
      url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/changeFollowStatus.php",
      data: 'w=' + w + '&websiteID=' + websiteID + '&uniqueID=' + uniqueID,
      success: function(data) {
        var dataObj = jQuery.parseJSON(data);
        if (dataObj.action == 'added') {
          $('section.s123-page-data-forum').find('.follow-topic-btn').addClass('topic-follow');
          $('section.s123-page-data-forum').find('.follow-topic-title').html(' ' + translations.following);
        } else if (dataObj.action == 'removed') {
          $('section.s123-page-data-forum').find('.follow-topic-btn').removeClass('topic-follow');
          $('section.s123-page-data-forum').find('.follow-topic-title').html(' ' + customLabels.follow);
        }
      }
    });
  });
  var $repliesAvatars = $html.find('.replies-avatars');
  if (topicData.avatars.length > 0) {
    $.each(topicData.avatars, function(key, avatar) {
      $repliesAvatars.append(Forum_setAvatar(avatar.image, 100, avatar.name, avatar.color));
      $(this).addClass('forum-avatar');
      $(this).find('span').addClass('avatar-img');
    });
  }
  $html.find('.forum-avatar').each(function(key, value) {
    Forum_initializeClientCard($(value), websiteID, w, uniqueID);
  });
  return $html;
}

function generateTopicSideMenu(topicData, topicUniqueID, $topicContainer, websiteID, uniqueID, w, dateTime, itemUniqueID, customLabels) {
  var html = '<div class="container-fluid side-menu-container box-primary s123-box-border hidden-sm hidden-xs">';
  html += '<div class="row">';
  html += '<div class="col-xs-12 text-center f-side-menu-buttons">';
  if (topicData.loggedIn) {
    html += '<div class="btn-group">';
    html += '<button type="button" class="btn btn-primary follow-topic-btn" data-topic-id="' + topicUniqueID + '"><span><i class="fa fa-bell-o"></i></span><span class="follow-topic-title hidden-xs"> ' + customLabels.follow + '</span></button>';
    html += '</div>';
  } else {
    html += '<a class="btn btn-primary" href="' + $topicContainer.data('login-url') + '"><span><i class="fa fa-bell-o"></i></span><span class="follow-topic-title hidden-xs"> ' + customLabels.follow + '</span></a>';
  }
  html += '</div>';
  html += '</div>';
  html += '<div class="side-menu-created">';
  html += '<div class="row">';
  html += '<div class="col-xs-12 side-menu-top-line">';
  if (topicData.category.length > 0) {
    html += '<div class="col-xs-6 side-menu-info">';
    html += '<span>' + translations.category + '</span>';
    html += '<div><a href=".c/' + topicData.categoryURL + '">' + topicData.category + '</a></div>';
    html += '</div>';
  }
  html += '<div class="col-xs-6 side-menu-info">';
  html += '<span>' + translations.created + '</span>';
  html += '<div>';
  html += '<div class="created-avatar side-menu-avatar"></div>';
  html += '<div class="created-time side-menu-time"></div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="col-xs-6 side-menu-info">';
  html += '<span>' + translations.forumLastReply + '</span>';
  html += '<div>';
  html += '<div class="last-reply-avatar side-menu-avatar"></div>';
  html += '<div class="last-reply-time side-menu-time"></div>';
  html += '</div>';
  html += '</div>';
  html += '<div class="col-xs-6 side-menu-info">';
  html += '<span>' + translations.forumReplies + '</span>';
  html += '<div class="col-xs-12" style="line-height: 30px;">';
  html += '<span><b>' + topicData.totalReplies + '</b></span>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  if (topicData.avatars.length > 0) {
    html += '<div class="row">';
    html += '<div class="col-xs-12 side-menu-top-line">';
    html += '<div><span>' + translations.forumFrequentPosters + ':</span></div>';
    html += '<div class="replies-avatars side-menu-avatar"></div>';
    html += '</div>';
    html += '</div>';
  }
  html += '</div>';
  var $html = $(html);
  $html.find('.created-avatar').append(Forum_setAvatar(topicData.ownerAvatar[0].image, 100, topicData.ownerAvatar[0].name, topicData.ownerAvatar[0].color));
  $html.find('.created-avatar').addClass('forum-avatar side-menu-popover').attr('data-client-id', topicData.ownerAvatar[0].id);
  $html.find('.created-time').append(setCreateTime(topicData.createTime, dateTime));
  if (!jQuery.isEmptyObject(topicData.lastReply)) {
    $html.find('.last-reply-avatar').append(Forum_setAvatar(topicData.lastReply.avatar[0].image, 100, topicData.lastReply.avatar[0].name, topicData.lastReply.avatar[0].color));
    $html.find('.last-reply-avatar span').addClass('forum-avatar side-menu-popover').attr('data-client-id', topicData.lastReply.avatar[0].id);
    $html.find('.last-reply-time').append(setCreateTime(topicData.lastReply.createTime, dateTime));
    $html.find('.last-reply-time span').addClass('forum-avatar side-menu-popover').attr('data-client-id', topicData.lastReply.id);
  } else {
    $html.find('.last-reply-avatar').html('--');
  }
  var $followReplyBtn = $html.find('.follow-topic-btn');
  if (topicData.follower == true) {
    $followReplyBtn.addClass('topic-follow');
    $followReplyBtn.find('.follow-topic-title').html(' ' + translations.following);
  }
  $followReplyBtn.click(function() {
    $.ajax({
      type: "POST",
      url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/changeFollowStatus.php",
      data: 'w=' + w + '&websiteID=' + websiteID + '&uniqueID=' + uniqueID,
      success: function(data) {
        var dataObj = jQuery.parseJSON(data);
        if (dataObj.action == 'added') {
          $('section.s123-page-data-forum').find('.follow-topic-btn').addClass('topic-follow');
          $('section.s123-page-data-forum').find('.follow-topic-title').html(' ' + translations.following);
        } else if (dataObj.action == 'removed') {
          $('section.s123-page-data-forum').find('.follow-topic-btn').removeClass('topic-follow');
          $('section.s123-page-data-forum').find('.follow-topic-title').html(' ' + customLabels.follow);
        }
      }
    });
  });
  var $repliesAvatars = $html.find('.replies-avatars');
  if (topicData.avatars.length > 0) {
    $.each(topicData.avatars, function(key, avatar) {
      var $clientAvatar = Forum_setAvatar(avatar.image, 100, avatar.name, avatar.color);
      $clientAvatar.addClass('forum-avatar side-menu-popover').attr('data-client-id', avatar.id);
      $repliesAvatars.append($clientAvatar);
    });
  }
  $html.find('.forum-avatar').each(function(key, value) {
    Forum_initializeClientCard($(value), websiteID, w, itemUniqueID);
  });
  return $html;
}

function setCreateTime(createTime, dateTime) {
  var $html = $('<span></span>');
  dateTime = new Date(dateTime);
  var createTime = new Date(createTime);
  var diff = dateTime - createTime;
  $html.html(Forum_calcActivityTime(diff, createTime));
  return $html;
}

function shareBtnClickEvent($shareBtn) {
  $shareBtn.click(function() {
    var $btn = $(this);
    var url = $btn.data('url');
    var title = $btn.data('title');
    var html = generateSharingPopoverHTML('', url, title);
    sharePopover($btn, html);
  });
}

function generateButtonsHTML(websiteID, topicUniqueID, itemUniqueID, topicData, loginURL, replyUniqueID, index, customLabels) {
  var html = '';
  if (topicData.loggedIn == true) {
    if (replyUniqueID == '') {
      html += '<div class="btn-group">';
      html += '<button type="button" class="btn btn-sm btn-primary add-reply-btn"><i class="fa fa-reply"></i><span class="hidden-xs"> ' + customLabels.reply + '</span></button>';
      html += '</div>';
    }
    html += '<div class="btn-group edit-btn-container" style="display:none;">';
    html += '<button type="button" class="btn btn-sm btn-primary edit-btn" data-topic-id="' + topicUniqueID + '" data-reply-id="' + replyUniqueID + '"><span><i class="fa fa-pencil"></i><span class="hidden-xs"> ' + customLabels.edit + '</span></button>';
    html += '</div>';
    if (topicData.manager == true && replyUniqueID.length > 0) {
      html += '<div class="btn-group">';
      html += '<span class="rmv-reply-btn" data-reply-id="' + replyUniqueID + '"><i class="fa fa-trash"></i></span>';
      html += '</div>';
    }
  } else {
    if (topicData.isManagment == true && replyUniqueID.length > 0) {
      html += '<div class="btn-group">';
      html += '<span class="rmv-reply-btn" data-reply-id="' + replyUniqueID + '"><i class="fa fa-trash"></i></span>';
      html += '</div>';
    }
    if (index == '0') {
      var html = '<div class="btn-group">';
      html += '<a class="btn btn-sm btn-primary new-topic-btn" href="' + loginURL + '"><i class="fa fa-reply"></i><span class="hidden-xs"> ' + customLabels.reply + '</span></a>';
      html += '</div>';
    }
  }
  $html = $(html);
  return $html;
}

function initializeButtons(websiteID, uniqueID, categoryUniqueID, $html, topicURL) {
  var w = $('#w').val();
  var $addReplyBtn = $html.find('.add-reply-btn');
  var $rmvReplyBtn = $html.find('.rmv-reply-btn');
  var $editBtn = $html.find('.edit-btn');
  var $shareReplyBtn = $html.find('.share-reply-btn');
  (function() {
    $addReplyBtn.click(function() {
      buildPopup('popupTopicReply', '', buildReplyForm(websiteID, uniqueID, w, ''), '', true, false, true, '', '');
      var $popup = $('#popupTopicReply');
      var $loading = $popup.find('#loading');
      Forum_froalaEditorInit($popup, true);
      $popup.find('.replyForm').each(function(index) {
        var $form = $(this);
        $form.validate({
          errorElement: 'div',
          errorClass: 'help-block',
          focusInvalid: true,
          ignore: "",
          highlight: function(e) {
            $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
          },
          success: function(e) {
            $(e).closest('.form-group').removeClass('has-error');
            $(e).remove();
          },
          submitHandler: function(form) {
            var $form = $(form);
            $form.find('button:submit').prop('disabled', true);
            $form.hide();
            $loading.show();
            $.ajax({
              type: "POST",
              url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/addReply.php",
              data: $form.serialize(),
              success: function(data) {
                var dataObj = jQuery.parseJSON(data);
                $loading.hide();
                if (dataObj.status == 'done') {
                  $form.trigger("reset");
                  buildPopup_CloseAction('popupTopicReply');
                  if (dataObj.replyID.length > 0) {
                    window.location.href = topicURL + dataObj.replyID;
                  } else {
                    location.reload();
                  }
                } else {
                  $form.find('button:submit').prop('disabled', false);
                  $form.show();
                  return false;
                }
              }
            });
          }
        });
      });
    });
    $editBtn.click(function() {
      $bth = $(this);
      postID = $bth.attr('data-reply-id') ? $bth.data('reply-id') : uniqueID;
      $.ajax({
        type: "POST",
        url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/getContent.php",
        data: 'w=' + w + '&websiteID=' + websiteID + '&postID=' + postID + '',
        success: function(data) {
          var dataObj = jQuery.parseJSON(data);
          if (dataObj.message.length > 0) {
            buildPopup('popupEditTopicReply', '', buildReplyForm(websiteID, postID, w, dataObj), '', true, false, true, '', '');
            Forum_ActiveSoftLabelInputs();
            var $popup = $('#popupEditTopicReply');
            var $loading = $popup.find('#loading');
            generatePostCategoriesBox($popup, dataObj);
            if (dataObj.subject && dataObj.subject.length > 0) {
              $popup.find('input[name=subject]').focus();
              Forum_froalaEditorInit($popup, false);
            } else {
              Forum_froalaEditorInit($popup, true);
            }
            $popup.find('.replyForm').each(function(index) {
              var $form = $(this);
              $form.validate({
                errorElement: 'div',
                errorClass: 'help-block',
                focusInvalid: true,
                ignore: "",
                highlight: function(e) {
                  $(e).closest('.form-group').removeClass('has-info').addClass('has-error');
                },
                success: function(e) {
                  $(e).closest('.form-group').removeClass('has-error');
                  $(e).remove();
                },
                submitHandler: function(form) {
                  var $form = $(form);
                  $form.find('button:submit').prop('disabled', true);
                  $form.hide();
                  $loading.show();
                  $.ajax({
                    type: "POST",
                    url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/editPost.php",
                    data: $form.serialize(),
                    success: function(data) {
                      var dataObj = jQuery.parseJSON(data);
                      if (dataObj.status == 'done') {
                        $form.trigger("reset");
                        $form.find('button:submit').prop('disabled', false);
                        $loading.hide();
                        buildPopup_CloseAction('popupEditTopicReply');
                        location.reload();
                      }
                    }
                  });
                  $form.find('button:submit').prop('disabled', false);
                  $loading.hide();
                  buildPopup_CloseAction('popupEditTopicReply');
                  return false;
                }
              });
            });
          }
        }
      });
    });
    if ($rmvReplyBtn.length === 0) return;
    $rmvReplyBtn.click(function() {
      var replyUniqueID = $(this).data('reply-id');
      if (replyUniqueID.length === 0) return;
      bootbox.confirm({
        title: '<span class="text-danger"><b>' + translations.forumDeleteReplyTitle + '</b></span>',
        message: translations.forumDeleteReply,
        backdrop: true,
        buttons: {
          confirm: {
            label: translations.yes,
            className: 'btn-danger'
          },
          cancel: {
            label: translations.no,
            className: 'btn-default'
          }
        },
        callback: function(result) {
          if (!result) return;
          $.ajax({
            type: "POST",
            url: "/versions/" + $('#versionNUM').val() + "/wizard/modules/forum/rmvReply.php",
            data: 'w=' + w + '&websiteID=' + websiteID + '&topicID=' + uniqueID + '&replyID=' + replyUniqueID + '&categoryUniqueID=' + categoryUniqueID,
            success: function(data) {
              var dataObj = jQuery.parseJSON(data);
              if (dataObj.status == 'done') window.location.reload();
            }
          });
        }
      });
    });
  })();
}

function buildReplyForm(websiteID, uniqueID, w, post) {
  var direction = $('html').attr('dir') === 'rtl' ? 'right' : 'left';
  var message = post.message ? post.message : '';
  var html = '<form class="replyForm" style="max-width: 700px; width: 100%; height: 100%;">';
  html += '<div class="row">';
  if (post.subject && post.subject.length > 0) {
    html += '<div class="col-xs-12">';
    html += '<div class="form-group softLabel">';
    html += '<label for="subject">' + translations.insertTopicTitle + '</label>';
    html += '<input type="text" name="subject" value="' + post.subject + '" class="form-control" required data-msg-required="' + translations.jqueryValidMsgRequire + '" minlength="15" maxlength="255">';
    html += '</div>';
    html += '</div>';
    html += '<div class="col-xs-12 categories-list"></div>';
  }
  html += '<div class="col-xs-12" style="text-align:' + direction + ';">';
  html += '<div class="form-group softLabel">';
  html += '<textarea class="form-control" id="message" name="message" data-editor="froala" data-froala-height="350" data-froala-buttons="about" data-website-id="' + websiteID + '" required data-msg-required="' + translations.jqueryValidMsgRequire + '">' + message + '</textarea>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '<button type="submit" class="btn btn-primary btn-block">' + translations.send + '</button>';
  html += '<input type="hidden" name="w" value="' + w + '">';
  html += '<input type="hidden" name="websiteID" value="' + websiteID + '">';
  html += '<input type="hidden" name="postID" value="' + uniqueID + '">';
  html += '<input type="hidden" name="isTopic" value="' + post.isTopic + '">';
  html += '</form>';
  html += '<div id="loading" class="text-center" style="display:none; color:#fff;">';
  html += '<i class="ace-icon fa fa-spinner fa-spin blue fa-4x"></i>';
  html += '</div>';
  return html;
}

function displayEditPostBtn(dateTime, $posts, dataObj) {
  var oneDay = 24 * 60 * 60 * 1000
  dateTime = new Date(dateTime);
  $posts.each(function(index, post) {
    var $post = $(post);
    if (dataObj.clientID == $post.closest('.post').data('client-id')) {
      var postDateTime = new Date($post.data('date-time'));
      var diff = dateTime - postDateTime;
      if (diff < oneDay) $post.closest('.post').find('.reply-buttons-container .edit-btn-container').show();
    }
  });
}

function generatePostCategoriesBox($popup, post) {
  var options = '';
  var hasCategories = false;
  $.each(post.categories, function(categoryUniqueID, category) {
    options += '<option value="' + categoryUniqueID + '">' + category.name + '</option>';
    hasCategories = true;
  });
  if (options.length === 0) return;
  var html = '';
  html += '<div class="form-group softLabel">';
  html += '<label for="subject" class="active">' + translations.chooseCategory + '</label>';
  html += '<select class="form-control" name="categoryUniqueID">';
  html += options;
  html += '</select>';
  html += '</div>';
  $html = $(html);
  if (post.categoryUniqueID) {
    $html.find('option[value=' + post.categoryUniqueID + ']').prop('selected', 'ture');
  }
  if (hasCategories) $popup.find('.categories-list').append($html).show();
}

function updateSideMenuPosition($sideMenu, topicsHeight, sideMenuHeight) {
  var windowScrollTop = $(window).scrollTop();
  if (windowScrollTop >= topicsHeight - sideMenuHeight) {
    $sideMenu.css('top', topicsHeight - sideMenuHeight);
  } else {
    $sideMenu.css('top', windowScrollTop);
  }
}

function increaseTopicViews(w, websiteID, topicUniqueID) {
  $.post('/versions/2/wizard/modules/forum/topicViewsAJAX.php', {
    w: w,
    websiteID: websiteID,
    topicUniqueID: topicUniqueID
  });
}
jQuery(function($) {
  $(document).on("s123.page.ready_data_pages", function(event) {
    storeDataPageInit();
  });
  storeDataPageInit();
});

function storeDataPageInit() {
  var rtl = $('html[dir=rtl]').length === 1;
  var $section = $('section.s123-page-data-eCommerce');
  var $mainImageSlider = $section.find('#mainImageSlider');
  var $mainImage = $mainImageSlider.find('.main-image > div');
  var $productSlickcarousel = $section.find('#productSlickcarousel');
  var $shareProductBtn = $section.find('.share-product-btn');
  var storeLabels = tryParseJSON($('.store-labels').val());
  var originalProductData = tryParseJSON($('.original-product-data').val());
  var getShippingOnPageLoad = true;
  var $poMainImage = $section.find('#poMainImage.main-image');
  var galleryReiquredAmount = 4;
  var verticalAlbum = $productSlickcarousel.parent().data('vertical-album') == 1 ? true : false;
  if (isMobile.any() && whatScreen.any() === 'mobile') { // `whatScreen` used to prevent tablets
    $productSlickcarousel.parent().attr('data-vertical-album', 0);
    verticalAlbum = false;
  }
  $shareProductBtn.click(function() {
    var $btn = $(this);
    var url = $btn.data('url');
    var title = decodeURIComponent($btn.data('title').replace(/\+/g, ' '));
    var html = generateSharingPopoverHTML(title, url, title);
    sharePopover($btn, html);
  });
  if ($section.length === 0) return;
  $mainImage.each(function() {
    jQueryZoomInitialize($(this), $(this));
  });
  calculateMainImagesDimensionForMobile();
  productOptionsImageSwipeHandler();
  productSecondaryGallery_init();
  productPrimaryGallery_init();
  (function() {
    var $relatedProducts = $section.find('.related-products');
    var $prevArrow = $('<div class="custom-arrow-container custom-slick-prev-container"><a href="javascript:void(0);" class="related-p-c-s-p slick-arrow"><i class="fa fa-chevron-circle-up" aria-hidden="true"></i></a></div>');
    var $nextArrow = $('<div class="custom-arrow-container custom-slick-next-container"><a href="javascript:void(0);" class="related-p-c-s-n slick-arrow"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></a></div>');
    var slidesToShow = findBootstrapColPerRow($relatedProducts.children());
    if ($relatedProducts.children().length <= slidesToShow) return;
    $relatedProducts.parent().prepend($prevArrow);
    $relatedProducts.parent().append($nextArrow);
    $relatedProducts.parent().addClass('has-carousel');
    if (!$relatedProducts.hasClass('slick-initialized')) {
      $relatedProducts.slick({
        dots: false,
        infinite: true,
        vertical: false,
        verticalSwiping: false,
        slidesToShow: slidesToShow,
        slidesToScroll: 1,
        adaptiveHeight: false,
        rtl: rtl,
        prevArrow: '.related-p-c-s-p',
        nextArrow: '.related-p-c-s-n'
      });
    }
  })();

  function jQueryZoomInitialize($image, $clickedImage) {
    if (!$image || $image.length === 0) return;
    if (!$clickedImage || $clickedImage.length === 0) return;
    var url = $clickedImage.data('zoom-image');
    $image.empty();
    if (isMobile.any() || $image.closest('[data-enable-album-zoom="0"]').length > 0) return;
    $image.trigger('zoom.destroy');
    var loading = $('<div style="position:absolute;width:100%;height:100%;z-index:99999;"></div>').appendTo($image);
    $image.zoom({
      url: url,
      magnify: 1,
      touch: true,
      callback: function() {
        loading.remove();
      },
    });
  }
  (function() {
    var $productOptions = $section.find(".product-options");
    var $options = $productOptions.find('.p-o-container');
    if ($productOptions.length !== 0) {
      $options.filter('[data-type="color"]').each(function() {
        var $option = $(this);
        var $colors = $option.find('.p-o-color');
        $colors.click(function(event) {
          var $color = $(this);
          var title = $color.attr('title');
          if ($color.hasClass('selected') && !$option.data('mandatory') == 1) {
            $colors.filter('.selected').removeClass('selected');
            title = '';
          } else {
            $colors.filter('.selected').removeClass('selected');
            $color.addClass('selected');
          }
          $option.find('.p-o-item-value').html(fixQuotIssue(title));
          update();
          disableRelatedProductOptions($color.get(0).id)
          if ($color.hasClass('selected')) {
            setMainProductImage($color.find('[data-zoom-image]'));
          } else {
            setMainProductImage(null);
          }
        });
        selectDefaultItem($option);
        var $defItem = $option.find('.selected [data-zoom-image]');
        if ($defItem.data('zoom-image')) {
          setMainProductImage($defItem);
        }
      });
      $options.filter('[data-type="radio"]').each(function() {
        var $option = $(this);
        var $radios = $option.find('.p-o-radio');
        $radios.click(function(event) {
          var $radio = $(this);
          var title = $radio.attr('title');
          if ($radio.hasClass('selected') && !$option.data('mandatory') == 1) {
            $radios.filter('.selected').removeClass('selected');
            $radio.prop('checked', false);
            title = '';
          } else {
            $radios.filter('.selected').removeClass('selected');
            $radio.addClass('selected');
          }
          $option.find('.p-o-item-value').html(fixQuotIssue(title));
          update();
          if ($radio.hasClass('selected')) {
            setMainProductImage($radio);
          } else {
            setMainProductImage(null);
          }
        });
        selectDefaultItem($option);
        var $defItem = $radios.filter('.selected');
        if ($defItem.data('zoom-image')) {
          setMainProductImage($defItem);
        }
      });
      $options.filter('[data-type="checkbox"]').each(function() {
        var $option = $(this);
        var $checkboxes = $option.find('.p-o-checkbox');
        $checkboxes.off('click').click(function(event) {
          var $checkbox = $(this);
          $checkbox.hasClass('selected') ? $checkbox.removeClass('selected') : $checkbox.addClass('selected');
          var itemValue = Array();
          $checkboxes.filter('.selected').each(function() {
            itemValue.push(fixQuotIssue($(this).attr('title')));
          });
          $option.find('.p-o-item-value').html(itemValue.join(','));
          if ($checkbox.is(':checked')) {
            setMainProductImage($checkbox);
          } else {
            setMainProductImage(null);
          }
          update();
        });
        selectDefaultItem($option);
        var $defItem = $checkboxes.filter('.selected');
        if ($defItem.data('zoom-image')) {
          setMainProductImage($defItem);
        }
      });
      $options.filter('[data-type="size"]').each(function() {
        var $option = $(this);
        var $sizes = $option.find('.p-o-size');
        $sizes.click(function(event) {
          var $size = $(this);
          var title = $size.attr('title');
          if ($size.hasClass('selected') && !$option.data('mandatory') == 1) {
            $sizes.filter('.selected').removeClass('selected');
            title = '';
          } else {
            $sizes.filter('.selected').removeClass('selected');
            $size.addClass('selected');
          }
          $option.find('.p-o-item-value').html(fixQuotIssue(title));
          update();
          disableRelatedProductOptions($size.get(0).id)
          if ($size.hasClass('selected')) {
            setMainProductImage($size.find('[data-zoom-image]'));
          } else {
            setMainProductImage(null);
          }
        });
        selectDefaultItem($option);
        var $defItem = $sizes.filter('.selected').find('[data-zoom-image]');
        if ($defItem.data('zoom-image')) {
          setMainProductImage($defItem);
        }
      });
      $options.filter('[data-type="list"]').each(function() {
        var $option = $(this);
        var $list = $option.find('.p-o-list');
        $list.change(function(event) {
          $list.find('option').removeClass('selected');
          $list.find('option:selected').addClass('selected');
          $option.find('.p-o-item-value').html(fixQuotIssue($list.val()));
          update();
          disableRelatedProductOptions($list.find('option:selected').get(0).id)
          setMainProductImage($list.find('option[value="' + $list.val() + '"]'));
        });
        selectDefaultItem($option);
        var $defItem = $list.find('.selected');
        if ($defItem.data('zoom-image')) {
          setMainProductImage($defItem);
        }
      });
      $options.filter('[data-type="textArea"]').each(function() {
        var $option = $(this);
        var $textArea = $option.find('.p-o-textArea');
        $textArea.on('input', function(event) {
          update();
        });
      });
      $options.filter('[data-type="textField"]').each(function() {
        var $option = $(this);
        var $textField = $option.find('.p-o-textField');
        $textField.on('input', function(event) {
          update();
        });
      });
      $options.filter('[data-type="numbersField"]').each(function() {
        var $option = $(this);
        var $numbersField = $option.find('.p-o-numbersField');
        $numbersField.on('input', function(event) {
          if (!$.isNumeric($(this).val())) $(this).val($(this).val().replace(/[^0-9]/g, ''));
          update();
        });
      });
      $options.filter('[data-type="datePicker"]').each(function() {
        var $option = $(this);
        var $datePicker = $option.find('.fake-input.p-o-datePicker');
        var $hiddenInput = $option.find('[data-id="' + $datePicker.data('related-id') + '"]');
        var $datePickerIcon = $option.find('.p-o-datePicker-icon');
        var calendar = new calendar_handler();
        calendar.init({
          $fakeInput: $datePicker,
          $hiddenInput: $hiddenInput,
          $fakeInputIcon: $datePickerIcon,
          type: 'datePicker',
          title: translations.chooseDate,
          calendarSettings: {
            format: $datePicker.data('date-format'),
            weekStart: 0,
            todayBtn: "linked",
            clearBtn: false,
            language: "en",
            todayHighlight: true
          },
          onSubmit: function(selectedDate) {
            $datePicker.html(selectedDate);
            $hiddenInput.val(selectedDate);
            update();
          }
        });
      });
      $options.filter('[data-type="timePicker"]').each(function() {
        var $option = $(this);
        var $timePicker = $option.find('.fake-input.p-o-timePicker');
        var $hiddenInput = $option.find('[data-id="' + $timePicker.data('related-id') + '"]');
        var $datePickerIcon = $option.find('.p-o-timePicker-icon');
        var calendar = new calendar_handler();
        calendar.init({
          $fakeInput: $timePicker,
          $hiddenInput: $hiddenInput,
          $fakeInputIcon: $datePickerIcon,
          type: 'timePicker',
          title: translations.chooseTime,
          onSubmit: function(selectedTime) {
            $timePicker.html(selectedTime);
            $hiddenInput.val(selectedTime);
            update();
          }
        });
      });
      $options.filter('[data-type="dateTimePicker"]').each(function() {
        var $option = $(this);
        var $dateTimePicker = $option.find('.fake-input.p-o-date-timePicker');
        var $hiddenInput = $option.find('[data-id="' + $dateTimePicker.data('related-id') + '"]');
        var $datePickerIcon = $option.find('.p-o-date-timePicker-icon');
        var calendar = new calendar_handler();
        calendar.init({
          $fakeInput: $dateTimePicker,
          $hiddenInput: $hiddenInput,
          $fakeInputIcon: $datePickerIcon,
          type: 'dateTimePicker',
          title: translations.chooseDateAndTime,
          calendarSettings: {
            format: $dateTimePicker.data('date-format'),
            weekStart: 0,
            todayBtn: "linked",
            clearBtn: false,
            language: "en",
            todayHighlight: true
          },
          onSubmit: function(selectedDate, selectedTime) {
            $dateTimePicker.html(selectedDate + ' ' + selectedTime);
            $hiddenInput.val(selectedDate + ' ' + selectedTime);
            update();
          }
        });
      });
      $options.filter('[data-type="uploadFile"]').each(function() {
        var $option = $(this);
        var $uploadFile = $option.find('.p-o-uploadFile');
        $uploadFile.on('change', function(event) {
          update();
        });
      });
      update();
      disableRelatedProductOptions(null, true);
      updateProductOptionOnPageLoad();
    }

    function update() {
      var po = [];
      var totalItemsPrice = 0.00;
      const productVariants = JSON.parse($('#productVariants').html());
      var $productOptionsWithVariants = $options.filter(function() {
        var $option = $(this);
        var optionType = $option.data('type');
        var noItemsOptionTypes = ['textArea', 'textField', 'numbersField', 'datePicker', 'timePicker', 'dateTimePicker', 'uploadFile', 'checkbox'];
        return noItemsOptionTypes.indexOf(optionType) === -1;
      }).sort(function(firstOption, secondOption) {
        return $(firstOption).get(0).id.localeCompare($(secondOption).get(0).id);
      });
      $options.filter(function() {
        var $option = $(this);
        var optionType = $option.data('type');
        var noItemsOptionTypes = ['textArea', 'textField', 'numbersField', 'datePicker', 'timePicker', 'dateTimePicker', 'uploadFile', 'checkbox'];
        return noItemsOptionTypes.indexOf(optionType) !== -1;
      }).each(function() {
        var $option = $(this);
        var pOption = new ProductOptions();
        pOption.id = $option.get(0).id;
        pOption.title = fixQuotIssue($option.data('title'));
        pOption.type = $option.data('type');
        switch ($option.data('type')) {
          case 'textField':
            var $textField = $option.find('.p-o-textField');
            if ($textField.length === 0) return;
            pOption.item.id = $textField.get(0).id;
            pOption.item.value = fixQuotIssue($textField.val());
            pOption.item.price = $textField.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'numbersField':
            var $numbersField = $option.find('.p-o-numbersField');
            if ($numbersField.length === 0) return;
            pOption.item.id = $numbersField.get(0).id;
            pOption.item.value = fixQuotIssue($numbersField.val());
            pOption.item.price = $numbersField.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'uploadFile':
            var $uploadFile = $option.find('.p-o-uploadFile');
            if ($uploadFile.length === 0 || $uploadFile.val().length === 0) return;
            pOption.item.id = $uploadFile.get(0).id;
            pOption.item.value = fixQuotIssue($uploadFile.val());
            pOption.item.price = $uploadFile.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'textArea':
            var $textArea = $option.find('.p-o-textArea');
            if ($textArea.length === 0) return;
            pOption.item.id = $textArea.get(0).id;
            pOption.item.value = fixQuotIssue($textArea.val());
            pOption.item.price = $textArea.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'datePicker':
            var $datePicker = $option.find('.p-o-datePicker');
            if ($datePicker.length === 0) return;
            pOption.item.id = $datePicker.get(0).id;
            pOption.item.value = fixQuotIssue($option.find('[data-id="' + $datePicker.data('related-id') + '"]').val());
            pOption.item.price = $datePicker.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'timePicker':
            var $timePicker = $option.find('.p-o-timePicker');
            if ($timePicker.length === 0) return;
            pOption.item.id = $timePicker.get(0).id;
            pOption.item.value = fixQuotIssue($option.find('[data-id="' + $timePicker.data('related-id') + '"]').val());
            pOption.item.price = $timePicker.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'dateTimePicker':
            var $dateTimePicker = $option.find('.p-o-date-timePicker');
            if ($dateTimePicker.length === 0) return;
            pOption.item.id = $dateTimePicker.get(0).id;
            pOption.item.value = fixQuotIssue($option.find('[data-id="' + $dateTimePicker.data('related-id') + '"]').val());
            pOption.item.price = $dateTimePicker.data('price');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'radio':
            var $radio = $option.find('.p-o-radio.selected');
            if ($radio.length === 0) return;
            pOption.item.id = $radio.get(0).id;
            pOption.item.title = fixQuotIssue($radio.attr('title'));
            pOption.item.price = $radio.data('price');
            pOption.item.imgSrc = $radio.data('image-src');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'checkbox':
            var $checkboxes = $option.find('.p-o-checkbox.selected');
            $.each($checkboxes, function(index, checkbox) {
              pOption = new ProductOptions();
              pOption.id = $option.get(0).id;
              pOption.title = fixQuotIssue($option.data('title'));
              pOption.type = $option.data('type');
              pOption.item.id = $(this).get(0).id;
              pOption.item.title = fixQuotIssue($(this).attr('title'));
              pOption.item.price = $(this).data('price');
              pOption.item.imgSrc = $(this).data('image-src');
              po.push(pOption);
              totalItemsPrice += parseFloat(pOption.item.price);
            });
            break;
        }
      });
      $productOptionsWithVariants.each(function() {
        var $option = $(this);
        var pOption = new ProductOptions();
        pOption.id = $option.get(0).id;
        pOption.title = fixQuotIssue($option.data('title'));
        pOption.type = $option.data('type');
        pOption.required = $option.find('.p-o-required').length > 0;
        switch ($option.data('type')) {
          case 'color':
            var $color = $option.find('.p-o-color.selected');
            if ($color.length === 0) return;
            pOption.item.id = $color.get(0).id;
            pOption.item.title = fixQuotIssue($color.attr('title'));
            pOption.item.price = $color.data('price');
            pOption.item.imgSrc = $color.find('[data-zoom-image]').data('image-src');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'list':
            var $list = $option.find('.p-o-list');
            var $listSelectedOpt = $list.find('option:selected');
            if ($list.find('option').length === 0 || !$listSelectedOpt.get(0).id) return;
            pOption.item.id = $listSelectedOpt.get(0).id;
            pOption.item.title = fixQuotIssue($list.val());
            pOption.item.price = $listSelectedOpt.data('price');
            pOption.item.imgSrc = $listSelectedOpt.data('image-src');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'size':
            var $size = $option.find('.p-o-size.selected');
            if ($size.length === 0) return;
            pOption.item.id = $size.get(0).id;
            pOption.item.title = fixQuotIssue($size.attr('title'));
            pOption.item.price = $size.data('price');
            pOption.item.imgSrc = $size.find('[data-zoom-image]').data('image-src');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
          case 'radio':
            var $radio = $option.find('.p-o-radio.selected');
            if ($radio.length === 0) return;
            pOption.item.id = $radio.get(0).id;
            pOption.item.title = fixQuotIssue($radio.attr('title'));
            pOption.item.price = $radio.data('price');
            pOption.item.imgSrc = $radio.find('[data-zoom-image]').data('image-src');
            totalItemsPrice += parseFloat(pOption.item.price);
            po.push(pOption);
            break;
        }
      });
      const productOptions = {
        'options': po,
        'variant': {}
      }
      if (productVariants.active) {
        productOptions.variant = updateVariants(po);
      } else {
        addItemsPrice(totalItemsPrice)
      }
      $('#productOptions').html(JSON.stringify(productOptions));
      $productOptions.trigger('po.update');
    }

    function disableRelatedProductOptions(optionId, onPageLoad) {
      resetDisableProductOptionsVariants();
      const productVariants = JSON.parse($('#productVariants').html());
      if (productVariants.active) {
        for (let index = 0; index < productVariants.items.length; index++) {
          const variant = productVariants.items[index];
          const variantsOptionsId = splitVariantOptionsId(variant.optionsId);
          if (optionId) {
            const indexOfOptionId = variantsOptionsId.indexOf(optionId);
            if (indexOfOptionId !== -1) {
              if (!isVariantInStock(variant)) {
                variantsOptionsId.splice(indexOfOptionId, 1);
                disableProductOptionsVariants(variantsOptionsId, 'out of stock');
              }
            }
          }
          if (onPageLoad) {
            if (!variant.active) {
              disableProductOptionsVariants(variantsOptionsId);
            }
          }
        }
      }
    }

    function updateVariants(selectedOptions) {
      const productVariants = JSON.parse($('#productVariants').html());
      var optionsIds = [];
      selectedOptions.forEach(function(option) {
        if (['textArea', 'textField', 'numbersField', 'datePicker', 'timePicker', 'dateTimePicker', 'uploadFile', 'checkbox'].indexOf(option.type) != -1) return;
        if (!option.required) return;
        optionsIds.push(option.item.id);
      });
      if (optionsIds.length < 1) return {};
      var optionsId = optionsIds.join('-');
      if (optionsId.length === 0) return {};
      let filteredVariants = productVariants.items.filter(function(variant) {
        return variant.optionsId === optionsId
      });
      if (filteredVariants.length === 0) return {};
      const selectedVariant = filteredVariants[0];
      if (selectedVariant && !$.isNumeric(selectedVariant.inventory)) {
        const inStock = selectedVariant.inventory === 'in stock' ? true : false;
        if (!inStock || !selectedVariant.active) {
          setProductOutOfStock(optionsIds);
        } else {
          setProductInStock();
        }
      } else {
        setQuantityMax(selectedVariant, optionsIds);
      }
      if (selectedVariant && selectedVariant.sku) {
        setProductSku(selectedVariant.sku);
      } else {
        setProductSku();
      }
      var price = addItemsPrice(selectedVariant.charge);
      var newWeightAndPrice = getWeightAndPrice(price, selectedVariant.weight);
      getShippingOnPageLoad = false;
      getShippingInfo(newWeightAndPrice.price, newWeightAndPrice.weight);
      return selectedVariant;
    }

    function getWeightAndPrice(price, weight) {
      originalProductData.weight = $.isNumeric(originalProductData.weight) ? originalProductData.weight : 0;
      weight = $.isNumeric(weight) ? weight : 0;
      return {
        price: price,
        weight: parseFloat(weight) + parseFloat(originalProductData.weight)
      };
    }

    function updateProductOptionOnPageLoad() {
      const productOptions = JSON.parse($('#productOptions').html());
      const productVariants = JSON.parse($('#productVariants').html());
      const variant = productOptions.variant;
      if (Object.keys(variant).length === 0) return;
      if ($.isNumeric(variant.inventory)) {
        if (variant.inventory > 0 && productVariants.active) return;
      } else {
        if (variant.inventory === 'in stock' && productVariants.active) return;
      }
      const otherVariants = productVariants.items
        .filter(function(productVariant) {
          return productVariant.optionsId !== variant.optionsId;
        });
      otherVariants.map(function(variant) {
        if ($.isNumeric(variant.inventory)) {
          if (variant.inventory === 0) return;
        } else {
          if (variant.inventory === 'out of stock') return;
        }
        const variantOptionsId = splitVariantOptionsId(variant.optionsId)
        variantOptionsId.forEach(function(optionsId) {
          disableRelatedProductOptions(optionsId, true);
          $options.each(function() {
            const $option = $(this);
            switch ($option.data('type')) {
              case 'color':
                const $colors = $option.find('.p-o-color');
                const $color = $option.find('.p-o-color#' + optionsId);
                if ($color.length !== 0) {
                  $colors.filter('.selected').removeClass('selected');
                  $color.addClass('selected');
                  $color.trigger('click');
                  $option.find('.p-o-item-value').html(fixQuotIssue($color.attr('title')));
                }
                break;
              case 'radio':
                const $radios = $option.find('.p-o-radio');
                const $radio = $option.find('.p-o-radio#' + optionsId);
                if ($radio.length !== 0) {
                  $radios.filter('.selected').removeClass('selected');
                  $radio.addClass('selected');
                  $option.find('.p-o-item-value').html(fixQuotIssue($radio.attr('title')));
                }
                break;
              case 'checkbox':
                const $checkboxes = $option.find('.p-o-checkbox');
                const $checkbox = $option.find('.p-o-checkbox#' + optionsId);
                if ($checkbox.length !== 0) {
                  $checkboxes.filter('.selected').removeClass('selected');
                  $checkbox.addClass('selected');
                  $option.find('.p-o-item-value').html(fixQuotIssue($checkbox.attr('title')));
                }
                break;
              case 'size':
                const $size = $option.find('.p-o-size#' + optionsId);
                if ($size.length !== 0) {
                  $size.attr('selected', true);
                  $size.trigger('click');
                  $option.find('.p-o-item-value').html(fixQuotIssue($size.attr('title')));
                }
                break;
              case 'list':
                const $list = $option.find('.p-o-list');
                const $listSelectedOpt = $list.find('option#' + optionsId);
                if ($listSelectedOpt.length !== 0) {
                  $listSelectedOpt.attr('selected', true);
                  $listSelectedOpt.trigger('change');
                  $option.find('.p-o-item-value').html(fixQuotIssue($listSelectedOpt.val()));
                }
                break;
            }
          });
        });
        update();
      });
    }

    function splitVariantOptionsId(optionsId) {
      return optionsId.split('-')
        .filter(function(v) {
          return v !== 'poi';
        }).map(function(id) {
          return 'poi-' + id;
        });
    }

    function setProductSku(value) {
      if (!value) {
        value = $section.find('#productSku').data('sku');
      }
      $section.find('#productSku').html(value);
    }

    function setQuantityMax(selectedVariant, optionsIds) {
      const quantity = selectedVariant.inventory;
      if (quantity > 0) {
        if ($('.quantity_field').val() > quantity) {
          $('.quantity_field').val(quantity);
        }
        $('.quantity_field').attr('max', quantity);
        if (!selectedVariant.active) {
          setProductOutOfStock(optionsIds);
        } else {
          setProductInStock(optionsIds);
        }
      } else {
        setProductOutOfStock(optionsIds);
        $('.quantity_field').attr('max', 1);
      }
    }

    function setProductOutOfStock(optionsIds) {
      const $orderButtonPopup = $section.find(".orderButtonPopup");
      if ($('.product-sale-banner').length !== 0) $('.product-sale-banner').hide();
      if ($('.product-out-of-stock').length === 0) {
        $('.main-image').prepend('<span class="btn btn-primary product-out-of-stock">' + storeLabels.outOfStock + '</span>');
      }
      $orderButtonPopup.attr('disabled', true);
      $orderButtonPopup.text(storeLabels.outOfStock);
    }

    function setProductInStock(optionsIds) {
      if ($('.product-sale-banner').length !== 0) $('.product-sale-banner').show();
      const $orderButtonPopup = $section.find(".orderButtonPopup");
      if ($('.product-out-of-stock').length !== 0) {
        $('.product-out-of-stock').remove();
      }
      $orderButtonPopup.attr('disabled', false);
      $orderButtonPopup.text(storeLabels.addToCart);
    }

    function disableProductOptionsVariants(productOptionsId, type) {
      var className = type === 'out of stock' ? 'p-o-v-out-of-stock' : 'p-o-v-hidden'
      for (let index = 0; index < productOptionsId.length; index++) {
        const optionId = productOptionsId[index];
        $options.find('#' + optionId).addClass(className);
      }
    }

    function resetDisableProductOptionsVariants() {
      $options.each(function() {
        $option = $(this);
        $option.find('.p-o-v-out-of-stock').removeClass('p-o-v-out-of-stock');
      })
    }

    function isVariantInStock(variant) {
      if (variant && !$.isNumeric(variant.inventory)) {
        const inStock = variant.inventory === 'in stock' ? true : false;
        return inStock;
      } else {
        if (!variant.active || variant.inventory <= 0) {
          return false;
        } else {
          return true;
        }
      }
    }

    function ProductOptions() {
      return {
        id: null,
        title: null,
        type: null,
        item: {
          id: null,
          title: null,
          price: 0,
          imgSrc: ''
        }
      };
    }

    function addItemsPrice(totalItemsPrice) {
      var $productPrice = $section.find('#productPrice');
      var $price = $productPrice.find('[data-type="price"]');
      if (!$.isNumeric(totalItemsPrice)) return;
      if (parseFloat($productPrice.data('price')) + parseFloat(totalItemsPrice) == parseFloat($price.html())) return;
      var p = parseFloat($productPrice.data('price')) + parseFloat(totalItemsPrice);
      $price.html(p.toFixed(2));
      $(document).trigger('multi_currencies_price_update', [
        [{
          el: $productPrice,
          newPrice: p.toFixed(2)
        }]
      ]);
      if ($section.find('#priceBeforeSale').length !== 0) {
        var $priceBeforeSale = $section.find('#priceBeforeSale');
        var $price = $priceBeforeSale.find('[data-type="price"]');
        var pbs = parseFloat($priceBeforeSale.data('price')) + parseFloat(totalItemsPrice);
        $price.html(pbs.toFixed(2));
        var psp = ((1 - (parseFloat(p) / parseFloat(pbs))) * 100).toFixed(2);
        psp = Number(psp);
        $('.price-sale-precentege').html('(-' + psp + '%)');
        $(document).trigger('multi_currencies_price_update', [
          [{
            el: $priceBeforeSale,
            newPrice: pbs.toFixed(2)
          }]
        ]);
      }
      $('.product-details').data('product-price', p);
      return p;
    }

    function setMainProductImage($item) {
      productPrimaryGallery_ShowHideOptionImage('hide');
      if ($('#productSlickcarousel').length == 0 && (!$item || $item.length === 0 || !$item.data('zoom-image'))) {
        return;
      } else if ($('#productSlickcarousel').length > 0 && (!$item || $item.length === 0 || !$item.data('zoom-image'))) {
        return;
      }
      $poMainImage.find('[data-zoom-image]').attr('style', 'background-image: url("' + $item.data('zoom-image') + '");');
      jQueryZoomInitialize($poMainImage.find('[data-zoom-image]'), $item);
      productPrimaryGallery_ShowHideOptionImage('show');
    }

    function selectDefaultItem($option) {
      if (!$option.data('default-item')) return;
      var $defItem = $option.find('#' + $option.data('default-item'));
      var title = $defItem.attr('title');
      if ($defItem.is('input[type="checkbox"]') || $defItem.is('input[type="radio"]')) {
        $defItem.prop('checked', true);
      } else if ($defItem.is('option')) {
        $defItem.prop('selected', true);
        title = $defItem.val();
      }
      $defItem.addClass('selected');
      $option.find('.p-o-item-value').html(fixQuotIssue(title));
    }
  })();

  function fixQuotIssue(value) {
    if (!value) return value;
    return value.toString().replace(/\&quot;/g, '\"');
  }
  $('.quantity_field').on('input', function() {
    var $this = $(this);
    if ($this.val().length > 0 && !$.isNumeric($this.val())) $this.val(1);
    if (!$.isNumeric($this.val())) $this.val($this.val().replace(/[^0-9]/g, ''));
    if ($.isNumeric($this.val()) && $this.val() <= 0) $this.val(1);
    if (parseInt($this.val()) > parseInt($this.prop('max'))) {
      $this.val($this.prop('max'));
      quantityPopover($this, translations.productQuntityLimit.replace('{{units_limitation}}', $this.prop('max')));
    } else if (parseInt($this.val()) < parseInt($this.prop('min'))) {
      $this.val($this.prop('min'));
      quantityPopover($this, translations.productQuntityLimitMin.replace('{{units_limitation}}', $this.prop('min')));
    }
    $section.find('.btn-buy-now.orderButtonPopup').data('quantity-amount', $this.val());
  });
  $section.find('.quantity-plus-btn').off('click').on('click', function() {
    updateQuantity($(this).closest('.quantity_container').find('.quantity_field'), 'plus');
  });
  $section.find('.quantity-minus-btn').off('click').on('click', function() {
    updateQuantity($(this).closest('.quantity_container').find('.quantity_field'), 'minus');
  });

  function quantityPopover($input, message) {
    $input.popover({
      container: $section,
      content: message,
      trigger: 'manual',
      template: '<div class="popover cart-validator-popover" role="tooltip"><div class="arrow"></div><div class="popover-content"></div></div>',
      placement: function(popover, input) {
        return isMobile.any() ? 'auto' : 'bottom';
      }
    });
    $input.popover('show');
    clearTimeout($input.data('q-p-timeout'));
    $input.data('q-p-timeout', setTimeout(function() {
      $input.popover('destroy');
    }, 3000));
  }

  function updateQuantity($input, operator) {
    if ($input.closest('.quantity_container').data('disabled') == '1') return;
    var quantity = parseInt($input.val());
    var maxQuantity = parseInt($input.attr('max'));
    var minQuantity = parseInt($input.attr('min'));
    if (operator === 'plus' && (quantity + 1) > maxQuantity) {
      quantityPopover($input, translations.productQuntityLimit.replace('{{units_limitation}}', $input.prop('max')));
    } else if (operator === 'minus' && quantity !== 1 && (quantity - 1) < minQuantity) {
      quantityPopover($input, translations.productQuntityLimitMin.replace('{{units_limitation}}', $input.prop('min')));
    }
    if (operator === 'minus' && quantity > minQuantity) quantity = quantity - 1;
    if (operator === 'plus' && quantity < maxQuantity) quantity = quantity + 1;
    if (!$.isNumeric(quantity)) quantity = 1;
    $section.find('.btn-buy-now.orderButtonPopup').data('quantity-amount', quantity);
    $input.val(quantity);
  }
  (function() {
    function boughtTogetherPlugin() {
      var bt = this;
      this.init = function(settings) {
        bt.$container = settings.$container;
        bt.currency = tryParseJSON(settings.currency);
        bt.updatePackagePrice();
        bt.addCheckboxEvent();
      };
      this.addCheckboxEvent = function() {
        var $btCheck = bt.$container.find('.b-t-check:checked');
        $btCheck.on('click', function() {
          var $this = $(this);
          if ($this.is(':checked')) {
            bt.$container.find('.b-t-product-box[data-unique-id="' + $this.val() + '"]').fadeIn();
            bt.$container.find('.b-t-plus-box[data-unique-id="' + $this.val() + '"]').fadeIn();
          } else {
            bt.$container.find('.b-t-product-box[data-unique-id="' + $this.val() + '"]').fadeOut();
            bt.$container.find('.b-t-plus-box[data-unique-id="' + $this.val() + '"]').fadeOut();
          }
          bt.updatePackagePrice();
        });
      };
      this.updatePackagePrice = function() {
        var $btCheck = bt.$container.find('.b-t-check:checked');
        var $packagePrice = bt.$container.find('.package-price');
        var price = 0;
        var products = [];
        $.each($btCheck, function(index, checkBox) {
          var $this = $(this);
          price += parseFloat($this.data('price'));
          products.push($this.val());
        });
        $packagePrice.data('price', price);
        $packagePrice.html(showPrice(bt.currency, price.toFixed(2)));
        bt.$container.find('.orderButtonPopup').data('multi-products', JSON.stringify(products));
        $(document).trigger('multi_currencies_price_update', [
          [{
            el: $packagePrice,
            newPrice: price.toFixed(2)
          }]
        ]);
      };
    }
    var bt = new boughtTogetherPlugin();
    bt.init({
      $container: $section.find('.bought-together-plugin'),
      currency: $section.find('#boughtTogetherCurrency').html()
    });
  })();
  (function productPageTabsInit() {
    var $firstTab = $section.find('.product-page-tabs').children().first();
    $firstTab.addClass('active');
    $($firstTab.find('a').attr('href')).addClass('active in');
    if ($section.find('a[data-toggle="tab"]').length == 1) {
      $firstTab.find('a').trigger('click');
    }
  })();

  function getShippingInfo(price, weight) {
    if ($('#productShipping').length == 0) return;
    var weightMeasurement = $('#productShipping').data('weight');
    var lengthMeasurement = $('#productShipping').data('length');

    function addPopUp(shipping) {
      var html = '';
      html += '<ul class="list-unstyled">';
      html += '<li>';
      html += '<button type="button" class="close">&times;</button>';
      html += '</li>';
      $.each(shipping.shipping.options, function(index, option) {
        html += '<li>';
        html += '<div class="form-group">';
        html += '<label>' + escapeHtml(option.title) + '</label>';
        html += '<br>';
        if (option.deliveryTime) {
          html += '<span>' + shipping.productData.translations.deliveryTime + ' ' + escapeHtml(option.deliveryTime) + '</span>';
        }
        if (option.formattedRate) {
          html += '<br>';
          html += '<span>' + shipping.productData.translations.estimatedPrice + ' ' + option.formattedRate + '</span>';
        }
        html += '</div>';
        html += '</li>';
      });
      if (shipping.storePickup) {
        html += '<li>';
        html += '<div class="form-group">';
        html += '<label>' + escapeHtml(shipping.storePickup.title) + '</label>';
        html += '<div>';
        if (shipping.storePickup.deliveryTime) {
          html += '<span>' + shipping.productData.translations.message + ' ' + escapeHtml(shipping.storePickup.deliveryTime) + '</span>';
          html += '<br>';
        }
        html += '<span>' + translations.address + ' ' + escapeHtml(shipping.storePickup.address) + '</span>';
        html += '<br>';
        html += '<span>' + translations.city + ' ' + escapeHtml(shipping.storePickup.city) + '</span>';
        html += '<br>';
        html += '<span>' + translations.state + ' ' + escapeHtml(shipping.storePickup.state) + '</span>';
        html += '<br>';
        html += '<span>' + translations.zipCode + ' ' + escapeHtml(shipping.storePickup.zipCode) + '</span>';
        html += '<br>';
        html += '<span>' + translations.country_v2 + ' ' + escapeHtml(shipping.storePickup.country) + '</span>';
        html += '</div>';
        html += '<div>';
        html += '<span>' + translations.instructions + ' ' + escapeHtml(shipping.storePickup.instructions) + '</span><br>';
        html += '</div>';
        html += '</div>';
        html += '</li>';
      }
      if (hasWeightAndDimensions(shipping.productData)) {
        html += '<label>' + shipping.productData.translations.additionalData + '</label>';
        if (shipping.productData.weight) {
          html += '<li>';
          html += '<span>' + shipping.productData.translations.weight + '</span>';
          html += shipping.productData.weight + ' <span class="measurement-unit">' + weightMeasurement + '</span>';
          html += '</li>';
        }
        if (shipping.productData.length) {
          html += '<li>';
          html += '<span>' + shipping.productData.translations.length + '</span>';
          html += shipping.productData.length + ' <span class="measurement-unit">' + lengthMeasurement + '</span>';
          html += '</li>';
        }
        if (shipping.productData.width) {
          html += '<li>';
          html += '<span>' + shipping.productData.translations.width + '</span>';
          html += shipping.productData.width + ' <span class="measurement-unit">' + lengthMeasurement + '</span>';
          html += '</li>';
        }
        if (shipping.productData.height) {
          html += '<li>';
          html += '<span>' + shipping.productData.translations.height + '</span>';
          html += shipping.productData.height + ' <span class="measurement-unit">' + lengthMeasurement + '</span>';
          html += '</li>';
        }
      }
      html += '</ul>';
      var $seeMore = $('<a href="javascript:void(0);" class="see-more">' + shipping.productData.translations.seeMoreLink + ' </a>');
      $seeMore.on('click', function() {
        var $btn = $(this);
        showMoreEvent($btn, html);
      });
      $('#productShipping').append($seeMore);
    }

    function hasWeightAndDimensions(productData) {
      if (productData.weight || productData.length || productData.width || productData.height) return true;
      return false;
    }

    function showMoreEvent($button, html) {
      var $html = $(html);
      $button.popover({
        container: $('.product-container'),
        html: 'true',
        content: $html,
        trigger: 'manual',
        template: '<div class="popover shipping-options" role="tooltip" style="max-width: 100%;"><div class="arrow"></div><div class="popover-content"></div></div>',
        placement: function(popover, button) {
          return !isMobile.any() ? 'auto' : 'top';
        }
      });
      $button.popover('show');
      $button.on('shown.bs.popover', function() {
        $html.find('button').on('click', function() {
          destroySharePopover();
        });
        $(document).on('mousedown.showMoreDestroyPopover', function(event) {
          if ($(event.target).closest('.popover.shipping-options').length === 0) {
            destroySharePopover();
          }
        });
      });

      function destroySharePopover() {
        $button.popover('destroy');
        $(document).off('mousedown.showMoreDestroyPopover');
        $(window).off('blur.showMoreDestroyPopover');
        $(window).off('scroll.showMoreDestroyPopover');
      }
    }
    (function addShippingInfoToPage() {
      $.post('/versions/2/wizard/modules/eCommerce/getSingleProductShippingOptionsAjax.php', {
        w: $('#w').val(),
        websiteID: $('#websiteID').val(),
        tranW: websiteLanguageCountryFullCode,
        moduleID: 112,
        uniqueID: $('#productShipping').data('unique-id'),
        moduleTypeNUM: 112,
        price: price,
        weight: weight
      }).done(function(shipping) {
        $('#productShipping').find('.first-option').empty();
        $('#productShipping').find('.see-more').remove();
        shipping = tryParseJSON(shipping);
        var html = '';
        if (!shipping.noShippingAvalible) {
          var firstOption = shipping.shipping.options[Object.keys(shipping.shipping.options)[0]];
          var deliveryTime = escapeHtml(firstOption.deliveryTime) ? ' (' + escapeHtml(firstOption.deliveryTime) + ') ' : ' ';
          var isFreeShipping = shipping.region.method === 'freeShipping';
          var hasSeeMore = false;
          delete shipping.shipping.options[Object.keys(shipping.shipping.options)[0]];
          if (isFreeShipping) {
            $('#productShipping').find('.first-option').addClass('free-shipping');
            firstOption.formattedRate = '';
          }
          html = escapeHtml(firstOption.title) + deliveryTime + firstOption.formattedRate + ' ';
          if (Object.keys(shipping.shipping.options).length > 0) hasSeeMore = true;
          if (hasWeightAndDimensions(shipping.productData)) hasSeeMore = true;
          if (hasSeeMore) {
            addPopUp(shipping);
          }
        } else {
          html += shipping.message;
          $('#productShipping').find('.first-option').addClass('no-shipping');
        }
        $('#productShipping').find('.first-option').append(html);
      });
    })();
  }
  if (getShippingOnPageLoad) {
    getShippingInfo(originalProductData.price, originalProductData.weight);
  }
  (function() {
    if ($('.product-return-policy[data-more="1"]').length == 0) return;
    var html = '';
    html += '<div>';
    html += '<button type="button" class="close">&times;</button>';
    html += $('.return-policy.original-text').val();
    html += '</div>';
    var $seeMore = $('<a href="javascript:void(0);" class="see-more">' + translations.seeMore + '</a>');
    $seeMore.on('click', function() {
      var $btn = $(this);
      showMoreEvent($btn, html);
    });
    $('.product-return-policy[data-more="1"]').closest('li').append($seeMore);

    function showMoreEvent($button, html) {
      var $html = $(html);
      $button.popover({
        container: $('.product-container'),
        html: 'true',
        content: $html,
        trigger: 'manual',
        template: '<div class="popover return-policy" role="tooltip" style="max-width: 100%;"><div class="arrow"></div><div class="popover-content"></div></div>',
        placement: function(popover, button) {
          return !isMobile.any() ? 'auto' : 'top';
        }
      });
      $button.popover('show');
      $button.on('shown.bs.popover', function() {
        $html.find('button').on('click', function() {
          destroySharePopover();
        });
        $(document).on('mousedown.showMoreDestroyPopover', function(event) {
          if ($(event.target).closest('.popover.shipping-options').length === 0) {
            destroySharePopover();
          }
        });
      });

      function destroySharePopover() {
        $button.popover('destroy');
        $(document).off('mousedown.showMoreDestroyPopover');
        $(window).off('blur.showMoreDestroyPopover');
        $(window).off('scroll.showMoreDestroyPopover');
      }
    }
  })();

  function escapeHtml(text) {
    if (!text) return text;
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, function(m) {
      return map[m];
    });
  }
  (function() {
    var $mainImage = $('.main-image');
    var productGallery = tryParseJSON($('#productGallery').val());
    if ($mainImage.length === 0 || !productGallery) return;
    $mainImage.on('click', function(event) {
      var $product_mfp_gallery = init();
      $product_mfp_gallery.magnificPopup('open', $(this).data('order'));
    });

    function init() {
      var $product_mfp_gallery = $('.product-mfp-gallery');
      if ($('.product-mfp-gallery').length !== 0) return $product_mfp_gallery;
      $product_mfp_gallery = $('<div class="product-mfp-gallery hidden"></div>').appendTo('body');
      $.each(productGallery, function(index, image) {
        $product_mfp_gallery.append('<div class="e-p-mfp-image" data-mfp-src="' + image.media_path + '" data-type="' + image.media_type + '"></div>');
      });
      $product_mfp_gallery.magnificPopup({
        mainClass: 'mfp-e-product-gallery',
        delegate: '.e-p-mfp-image', // Categories Filter
        closeOnContentClick: true,
        closeBtnInside: false,
        tLoading: translations.loading, // Text that is displayed during loading
        gallery: {
          enabled: true,
          tClose: translations.closeEsc, // Alt text on close button
          tPrev: translations.previousLeftArrowKey, // Alt text on left arrow
          tNext: translations.NextRightArrowKey, // Alt text on right arrow
          tCounter: '%curr% ' + translations.of + ' %total%' // Markup for "1 of 7" counter
        },
        image: {
          markup: '<div class="mfp-figure">' + '<div class="mfp-close"></div>' + '<div class="mfp-img"></div>' + '<div class="mfp-bottom-bar fancy-scrollbar">' + '<div class="mfp-title"></div>' + '<div class="mfp-counter"></div>' + '<span class="mfp-caption-close"><i class="fa fa-times"></i></span>' + '</div>' + '</div>',
          titleSrc: 'data-caption',
          tError: translations.imageCouldNotLoaded // Error message when image could not be loaded
        },
        iframe: {
          markup: '<div class="mfp-iframe-scaler">' + '<div class="mfp-close"></div>' + '<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>' + '<div class="mfp-title" style="position: absolute; padding-top: 5px;"></div>' + '</div>',
          patterns: {
            site123: {
              index: $GLOBALS['cdn-user-files'],
              id: function(url) {
                if (isMobile.any()) url += '&autoplay=0';
                return url;
              },
              src: '/include/globalVideoPlayer.php?cad=1&url=%id%'
            },
            site123Processing: {
              index: '/files/images/video-processing.png',
              id: function(url) {
                if (isMobile.any()) url += '&autoplay=0';
                return url;
              },
              src: '/include/globalVideoPlayer.php?cad=1&url=%id%'
            }
          }
        },
        callbacks: {
          elementParse: function(item) {
            if (item.el.data('type') === 'video') {
              item.type = 'iframe';
            } else {
              item.type = 'image';
            }
          }
        }
      });
      return $product_mfp_gallery;
    };
  })();

  function calculateMainImagesDimensionForMobile() {
    if ($mainImage.length === 0 || !isMobile.any() || whatScreen.any() !== 'mobile') return;
    var ratio = $section.find('.main-image').data('ratio');
    var split_ratio = ratio.split('-');
    var ratio_width = split_ratio[0];
    var ratio_height = split_ratio[1];
    var aspect_ratio = parseFloat(ratio_height) / parseFloat(ratio_width);
    var width = screen.width - 30;
    var height = (parseFloat(width) * parseFloat(aspect_ratio)).toFixed(2);
    $section.find('.main-image').css({
      width: width,
      height: height,
    });
    $mainImageSlider.css({
      width: width,
      height: height,
    });
  }
  (function() {
    var Review = new Comments_Initialize({
      id: 'productPageReview',
      type: 1,
      onLoad: function(reviews, reviewAvg, newReview) {
        if (reviews == 0) {
          Review_DataPage.hideReview();
        } else {
          Review_DataPage.showReview();
        }
        Review_DataPage.addReviewAvgToPage(reviewAvg, reviews);
        if (newReview) {
          var $newReview = $('#commentsContainer .commentBox[data-comment-id="' + Review_DataPage.newReviewID + '"]');
          if ($newReview.length > 0) {
            Review_DataPage.focusUserOnNewReview();
          }
        }
      },
      onFormSubmit: function(newReviewID, blockComment) {
        if (blockComment) {
          Review_DataPage.showManagerApproveMessage();
          Review_DataPage.newReviewID = null;
        } else {
          Review_DataPage.newReviewID = newReviewID;
          Review_DataPage.hideModal();
        }
      }
    });
    var Review_DataPage = function() {
      var that = this;
      that.init = function() {
        that.$reviewTabLink = $('#reviewsTabLink');
        that.$reviewTabContent = $('#reviews');
        that.$form = $('#productPageReview .commentsForm');
        that.newReviewID = null;
        if (that.$form.length === 0) return;
        that.$modal = $('<div class="bootbox modal fade review-pop-up" tabindex="-1" role="dialog" aria-hidden="false" style="display: none; padding-right: 17px;"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body"><button type="button" class="bootbox-close-button close" data-dismiss="modal" aria-hidden="true" style="margin-top: -10px;">×</button><div class="bootbox-body"><div id="reviewFormContainer"></div><div id="reviewAutoConfirmMsg">' + translations.productReviewMessage + '</div></div></div></div></div></div>');
        that.$modal.find('.bootbox-body #reviewFormContainer').append(that.$form);
        $('body').append(that.$modal);
        that.$addNewReview = $section.find('.addNewReview');
        that.$addNewReview.on('click', function() {
          that.$modal.modal('show');
          that.showReviewForm();
        });
        var html = '';
        html += '<div class="review-sum">';
        html += '<i class="review-loading fa fa-spinner fa-spin"></i>';
        html += '</div>';
        $section.find('.review-container').prepend(html);
      };
      that.addReviewAvgToPage = function(reviewAvg, reviews) {
        var $reviewContainer = $section.find('.review-container');
        that.generateStarsHtml(reviewAvg);
        $reviewContainer.find('.review-sum').html(that.generateStarsHtml(reviewAvg) + ' <span>' + reviews + '</span>');
        $reviewContainer.find('.addNewReview').show();
      };
      that.generateStarsHtml = function(reviewAvg) {
        var html = '';
        var num = parseInt(reviewAvg);
        var decimal = (reviewAvg - Math.floor(reviewAvg)) * 10;
        var addHalfStar = decimal > 0;
        for (var i = 1; i <= 5; i++) {
          if (i <= num) {
            html += '<i class="fa fa-star" aria-hidden="true"></i>';
          } else if (i > num && addHalfStar) {
            html += '<i class="fa fa-star-half-o" aria-hidden="true"></i>';
            addHalfStar = false;
          } else {
            html += '<i class="fa fa-star-o" aria-hidden="true"></i>';
          }
          html += '&nbsp;';
        }
        return html;
      };
      that.hideReview = function() {
        var $tabsContainer = $section.find('.tabs-container');
        var $tabLinks = $tabsContainer.find('.product-page-tabs');
        var $tabs = $tabsContainer.find('.tab-content');
        $tabs.find('#reviews').addClass('hidden');
        $tabLinks.find('#reviewsTabLink').parent().addClass('hidden');
        $tabLinks.children(':not(.hidden)').first().find('a').trigger('click');
        if (!$section.find('.product-page-tabs').children().is(':visible')) $tabsContainer.addClass('hidden');
      };
      that.showReview = function() {
        var $tabsContainer = $section.find('.tabs-container');
        var $tabLinks = $tabsContainer.find('.product-page-tabs');
        var $tabs = $tabsContainer.find('.tab-content');
        $tabs.find('#reviews').removeClass('hidden');
        $tabLinks.find('#reviewsTabLink').parent().removeClass('hidden');
        $tabsContainer.removeClass('hidden');
      };
      that.hideModal = function() {
        if (!that.$modal) return;
        that.$modal.modal('hide');
      };
      that.showManagerApproveMessage = function() {
        that.$modal.find('#reviewFormContainer').fadeOut(function() {
          that.$modal.find('#reviewAutoConfirmMsg').fadeIn();
        });
      };
      that.showReviewForm = function() {
        that.$modal.find('#reviewAutoConfirmMsg').hide();
        that.$modal.find('#reviewFormContainer').show();
      };
      that.focusUserOnNewReview = function() {
        if (that.$reviewTabContent.is(':visible')) {
          scrollToReview();
        } else {
          that.$reviewTabLink.one('shown.bs.tab', function() {
            scrollToReview();
          }).trigger('click');
        }

        function scrollToReview() {
          var offset = findBootstrapEnvironment() != 'xs' ? menuScrollOffset : menuScrollOffset_mobile;
          $('html, body').stop().animate({
            scrollTop: ($('#commentsContainer .commentBox[data-comment-id="' + that.newReviewID + '"]').offset().top - offset)
          }, 600);
        }
      };
      return that;
    }();
    Review_DataPage.init();
  })();

  function productPrimaryGallery_init() {
    if ($mainImageSlider.length === 0) {
      $mainImageSlider.addClass('product-is-loaded');
      return;
    }
    if ($mainImage.length <= 1) {
      $mainImageSlider.addClass('product-is-loaded');
      return;
    }
    $mainImageSlider.on('init', function(event, slick) {
      $mainImageSlider.addClass('product-is-loaded');
    });
    if (!$mainImageSlider.hasClass('slick-initialized')) {
      $mainImageSlider.slick({
        infinite: true,
        vertical: false,
        verticalSwiping: verticalAlbum,
        slidesToShow: 1,
        slidesToScroll: 1,
        adaptiveHeight: false,
        rtl: rtl,
        arrows: false,
        fade: true,
        swipe: isMobile.any() ? true : false,
        dots: isMobile.any() ? $mainImageSlider.children().length > 1 : false
      });
    }
    $mainImageSlider.on('beforeChange', function(event, slick, currentSlide, nextSlide) {
      setTimeout(function() {
        productPrimaryGallery_ShowHideOptionImage('hide');
      }, 100);
      $mainImageSlider.data('current-image-index', nextSlide);
    });
    $mainImageSlider.data('current-image-index', 0);
    if ($mainImageSlider.find('.slick-dots li').length > 0) {
      var $firstDot = $mainImageSlider.find('.slick-dots li').first();
      var $firstLast = $mainImageSlider.find('.slick-dots li').last();
      if ($firstDot.offset().top != $firstLast.offset().top) {
        $mainImageSlider.addClass('dots-position-fix');
      }
    }
  }

  function productPrimaryGallery_ShowVideo($clickedImage) {
    var $image = $mainImageSlider.find('.main-image.slick-current > div');
    $image.empty();
    $('<iframe data-player="site123" style="display: block;color:white;width:' + $image.width() + 'px;height:' + $image.height() + 'px" type="text/html" src="' + '/include/globalVideoPlayer.php?url=' + $clickedImage.data('video-path') + (isMobile.any() ? '&autoplay=false' : '&autoplay=true') + '" frameborder="0" allowfullscreen=""></iframe>').appendTo($image);
  }

  function productPrimaryGallery_ShowHideOptionImage(action) {
    switch (action) {
      case 'show':
        $poMainImage.stop().fadeIn();
        $mainImageSlider.find('.slick-list').css({
          visibility: 'hidden'
        });
        break;
      case 'hide':
        $poMainImage.stop().fadeOut();
        $mainImageSlider.find('.slick-list').css({
          visibility: ''
        });
        break;
    }
  }

  function productSecondaryGallery_init() {
    if (isMobile.any()) {
      $productSlickcarousel.addClass('hidden');
      return;
    }
    if ($productSlickcarousel.length === 0) {
      $productSlickcarousel.addClass('product-is-loaded');
      return;
    }
    $productSlickcarousel.on('init', function(event, slick) {
      $productSlickcarousel.addClass('product-is-loaded');
    });
    if (!verticalAlbum) {
      $productSlickcarousel.width($mainImageSlider.width());
    }
    if (!$productSlickcarousel.hasClass('slick-initialized')) {
      $productSlickcarousel.slick({
        dots: false,
        infinite: true,
        vertical: verticalAlbum,
        verticalSwiping: verticalAlbum,
        slidesToShow: galleryReiquredAmount,
        slidesToScroll: 1,
        adaptiveHeight: false,
        rtl: verticalAlbum ? false : rtl,
        arrows: true,
        appendArrows: '.slick-list',
        prevArrow: '<div class="custom-arrow-container custom-slick-prev-container"><a class="custom-slick-prev slick-arrow"><i class="fa fa-chevron-circle-up" aria-hidden="true"></i></a></div>',
        nextArrow: '<div class="custom-arrow-container custom-slick-next-container"><a class="custom-slick-next slick-arrow"><i class="fa fa-chevron-circle-down" aria-hidden="true"></i></a></div>',
        asNavFor: '#mainImageSlider',
        focusOnSelect: false
      });
    }
    $productSlickcarousel.on('afterChange', function(event, slick, currentSlide) {
      var $clickedImage = $productSlickcarousel.find('.item.slick-current .item-image');
      if ($clickedImage.data('media-type') == 'video') {
        productPrimaryGallery_ShowVideo($clickedImage);
      }
    });
    $productSlickcarousel.find('.slick-slide').on('click', function(event) {
      $productSlickcarousel.find('.slick-current').removeClass('slick-current');
      $(this).addClass('slick-current');
      $('#mainImageSlider').slick('slickGoTo', $(this).data('slickIndex'));
    });
    if ($mainImage.length <= galleryReiquredAmount) {
      $productSlickcarousel.find('.item').on('click', function() {
        var $clickedImage = $productSlickcarousel.find('.item.slick-current .item-image');
        if ($clickedImage.data('media-type') == 'video') {
          productPrimaryGallery_ShowVideo($clickedImage);
        }
      });
    }
  }

  function productOptionsImageSwipeHandler() {
    $poMainImage.off('swipeleft').on('swipeleft', function() {
      if (rtl) {
        $mainImageSlider.slick('slickGoTo', $mainImageSlider.data('current-image-index') - 1);
      } else {
        $mainImageSlider.slick('slickGoTo', $mainImageSlider.data('current-image-index') + 1);
      }
    });
    $poMainImage.off('swiperight').on('swiperight', function() {
      if (rtl) {
        $mainImageSlider.slick('slickGoTo', $mainImageSlider.data('current-image-index') + 1);
      } else {
        $mainImageSlider.slick('slickGoTo', $mainImageSlider.data('current-image-index') - 1);
      }
    });
  }
} // Run when the page ready (before images and other resource)
jQuery(function($) {
  $(document).on('s123.page.ready_data_pages', function(event) {
    blogCommentsInit();
  });
  blogCommentsInit();
});

function blogCommentsInit() {
  var $section = $('section.s123-page-data-blog');
  if ($section.length === 0) return;
  if (isMobile.any() && whatScreen.any() == 'mobile' && $('#itemPageComments').length != 0) {
    $('#itemPageComments').insertBefore($('.related-post-container'));
    $('<div class="clearfix" style="margin-top:20px;"></div>').insertAfter($('#itemPageComments'));
  }
  var Comments = new Comments_Initialize({
    id: 'itemPageComments',
    type: 0
  });
} // Run when the page ready (before images and other resource)
jQuery(function($) {
  $(document).on('s123.page.ready_data_pages', function(event) {
    articleCommentsInit();
  });
  articleCommentsInit();
});

function articleCommentsInit() {
  var $section = $('section.s123-page-data-articles');
  if ($section.length === 0) return;
  if (isMobile.any() && whatScreen.any() == 'mobile' && $('#itemPageComments').length != 0) {
    $('#itemPageComments').insertBefore($('.related-article-container'));
    $('<div class="clearfix" style="margin-top:20px;"></div>').insertAfter($('#itemPageComments'));
  }
  var Comments = new Comments_Initialize({
    id: 'itemPageComments',
    type: 0
  });
}

function TriggerS123PageReadyData() {
  $(document).trigger('s123.page.ready_data_pages');
}