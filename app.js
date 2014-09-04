(function() {
  var zis = [];
  var numkey = ";',./";
  var nums = ['1', '2', '3','4','5','6','7','8','9', '0'];
  var symbols = [' ', ':', '?', '"', '<', '>', '!'];
  var typearea = document.createElement('div');
  var currPage = 0;
  var position = 0;
  var targetElmt = null;
  var targetElmtType = 0;
  var working = false;
  var inputing = false;
  var typing = false;
  var paging = false;
  var typeValue = '';
  var zis = {};

  initTypearea(typearea);

  $('body').keyup(function(event) {
    // console.log('body keyup', event.which);

    if(event.which === 27) { // esc
      hide();
    }
    if(event.which === 120) { // F9
      if(working) {
        hide();
        $(targetElmt).unbind('keypress');
      } else {
        $(targetElmt).keypress(onType);
      }
      working = !working;
      console.log('switch working', working);
    }
  });

  $('body').keypress(function(event) {
    // console.log('body keydown', event.which, working);
    if(!working) { return; }
    checkInputing(event);
  });

  $('body').keydown(function(event){
    // console.log('body keydown', event.which);
    if(!working) { return; }

    if(event.which === 8) {  // backspace
      // console.log('backspace', event.which, typing);
      if(typing) {
        event.preventDefault();
        typeValue = typeValue.slice(0, typeValue.length - 1);
        if(typeValue === '') {
          hide();
          return;
        }
        refresh();
      }
    }
  });

  function checkInputing(event) {
    // console.log('checkInputing', inputing);
    if(!inputing) {
      // console.log('input judge', event.which);
      targetElmt = event.target;
      var plainInput = (targetElmt.tagName === 'INPUT' || targetElmt.tagName === 'TEXTAREA');
      var divInput = ($(targetElmt).attr('contenteditable') === 'true');
      if(!plainInput && !divInput) {
        return;
      } else {
        if(plainInput) {
          targetElmtType = 0;
        } else {
          targetElmtType = 1;
        }
        inputing = true;
        $(targetElmt).unbind('keypress');
        $(targetElmt).keypress(onType);
        onType(event);
        $(targetElmt).blur(function() { inputing = false; });
      }
    }
  }

  function onType(event) {
    var c = String.fromCharCode(event.which);

    if(!typing) {
      if(numkey.indexOf(c) >= 0 || symbols.indexOf(c) >= 0 || nums.indexOf(c) >= 0) {
        return;
      } else if(event.which === 13) {
        return;
      }
      show();
    }

    event.preventDefault();
    if(event.which === 13) {
      insert(typeValue);
      return;
    } else if(event.which === 91) {
      paging = true;
      currPage -= 1;
      if(currPage < 0) { currPage = 0; }
    } else if(event.which === 93) {
      if(zis.length === 5) {
        paging = true;
        currPage += 1;
      }
    } else if(nums.indexOf(c) > -1) {
      c = parseInt(c);
      if(0 < c < 6) {
        insert(zis[c-1].cixing);
        return;
      } else {
        return;
      }
    } else if(c === ' ') {
      insert(zis[0].cixing);
      return;
    } else {
      if(paging) {
        currPage = 0;
        paging = false;
      }
      typeValue += c;
    }
    refresh();
  }

  function refresh() {
    setPosition();

    $("#im_typebar").val(typeValue);

    $.ajax({
      url: 'http://localhost:1337/jian/' + typeValue + '/' + currPage
    }).done(function(result) {
      if(result === '404') {
        return;
      }
      zis = result;
      zis = JSON.parse(zis);
      if(zis.length === 0) {
        $("#im_houxuan").val('');
        return;
      } else {
        $("#im_houxuan").val('');
        content = '';
        zis.forEach(function(zi, index) {
          hint = zi.jian.split($("#im_typebar").val())[1];
          zitiao = index + 1 + ": " + zi.cixing;
          content += (zitiao + "\n");
        });
      $("#im_houxuan").val(content);
    }
    });
  }

  function hide() {
    typing = false;
    typeValue = '';
    $("#im_typebar").val('');
    $("#im_houxuan").val('');
    $(typearea).hide();
  }

  function show() {
    typing = true;
    $(typearea).show();
  }

  function insert(val) {
    if(targetElmtType === 0) {
      insertInput(targetElmt, val);
    } else {
      insertDiv(val);
    }
    hide();
  }

  function insertInput(element, text) {
    if (document.selection) {
      element.focus();
      var sel = document.selection.createRange();
      sel.text = text;
      element.focus();
    } else if (element.selectionStart || element.selectionStart === 0) {
      var startPos = element.selectionStart;
      var endPos = element.selectionEnd;
      var scrollTop = element.scrollTop;
      var preText = element.value.substring(0, startPos);
      var backText = element.value.substring(endPos, element.value.length);
      element.value =  preText + text + backText;
      element.focus();
      element.selectionStart = startPos + text.length;
      element.selectionEnd = startPos + text.length;
      element.scrollTop = scrollTop;
    } else {
      element.value += text;
      element.focus();
    }
  }

  function insertDiv(text) {
    var sel, range;
    var node = document.createTextNode(text);
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      var range = sel.getRangeAt(0);
      range.collapse(false);
      range.insertNode(node);
      range = range.cloneRange();
      range.selectNodeContents(node);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  function initTypearea(ta) {
    ta.id = 'im_typearea';
    var typeHtml = "<input type='text' id='im_typebar'/><textarea class='font-hei' id='im_houxuan' readonly='true'</texta rea>";
    ta.innerHTML = typeHtml;
    $('body').append(ta);
    $(ta).hide();
  }

  function setPosition() {
    var position = $(targetElmt).caret('pos');
    var offset = $(targetElmt).caret('offset');
    $(typearea).offset({
      top: offset.top + offset.height + 5,
      left: offset.left
    });
  }
})();
