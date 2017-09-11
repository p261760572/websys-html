!function(t){function a(a){var e=t.data(a.data.target,"draggable"),r=e.options,d=e.proxy,o=a.data,n=o.startLeft+a.pageX-o.startX,i=o.startTop+a.pageY-o.startY;d&&(d.parent()[0]==document.body?(n=null!=r.deltaX&&void 0!=r.deltaX?a.pageX+r.deltaX:a.pageX-a.data.offsetWidth,i=null!=r.deltaY&&void 0!=r.deltaY?a.pageY+r.deltaY:a.pageY-a.data.offsetHeight):(null!=r.deltaX&&void 0!=r.deltaX&&(n+=a.data.offsetWidth+r.deltaX),null!=r.deltaY&&void 0!=r.deltaY&&(i+=a.data.offsetHeight+r.deltaY))),a.data.parent!=document.body&&(n+=t(a.data.parent).scrollLeft(),i+=t(a.data.parent).scrollTop()),"h"==r.axis?o.left=n:"v"==r.axis?o.top=i:(o.left=n,o.top=i)}function e(a){var e=t.data(a.data.target,"draggable"),r=e.options,d=e.proxy;d||(d=t(a.data.target)),d.css({left:a.data.left,top:a.data.top}),t("body").css("cursor",r.cursor)}function r(r){if(!t.fn.draggable.isDragging)return!1;var d=t.data(r.data.target,"draggable"),o=d.options,n=t(".droppable:visible").filter(function(){return r.data.target!=this}).filter(function(){var a=t.data(this,"droppable").options.accept;return!a||t(a).filter(function(){return this==r.data.target}).length>0});d.droppables=n;var i=d.proxy;return i||(o.proxy?(i="clone"==o.proxy?t(r.data.target).clone().insertAfter(r.data.target):o.proxy.call(r.data.target,r.data.target),d.proxy=i):i=t(r.data.target)),i.css("position","absolute"),a(r),e(r),o.onStartDrag.call(r.data.target,r),!1}function d(r){if(!t.fn.draggable.isDragging)return!1;var d=t.data(r.data.target,"draggable");a(r),0!=d.options.onDrag.call(r.data.target,r)&&e(r);var o=r.data.target;return d.droppables.each(function(){var a=t(this);if(!a.droppable("options").disabled){var e=a.offset();r.pageX>e.left&&r.pageX<e.left+a.outerWidth()&&r.pageY>e.top&&r.pageY<e.top+a.outerHeight()?(this.entered||(t(this).trigger("_dragenter",[o]),this.entered=!0),t(this).trigger("_dragover",[o])):this.entered&&(t(this).trigger("_dragleave",[o]),this.entered=!1)}}),!1}function o(a){function e(){i&&i.remove(),o.proxy=null}function r(){var r=!1;return o.droppables.each(function(){var d=t(this);if(!d.droppable("options").disabled){var o=d.offset();return a.pageX>o.left&&a.pageX<o.left+d.outerWidth()&&a.pageY>o.top&&a.pageY<o.top+d.outerHeight()?(g.revert&&t(a.data.target).css({position:a.data.startPosition,left:a.data.startLeft,top:a.data.startTop}),t(this).trigger("_drop",[a.data.target]),e(),r=!0,this.entered=!1,!1):void 0}}),r||g.revert||e(),r}if(!t.fn.draggable.isDragging)return n(),!1;d(a);var o=t.data(a.data.target,"draggable"),i=o.proxy,g=o.options;if(g.revert)if(1==r())t(a.data.target).css({position:a.data.startPosition,left:a.data.startLeft,top:a.data.startTop});else if(i){var s,l;i.parent()[0]==document.body?(s=a.data.startX-a.data.offsetWidth,l=a.data.startY-a.data.offsetHeight):(s=a.data.startLeft,l=a.data.startTop),i.animate({left:s,top:l},function(){e()})}else t(a.data.target).animate({left:a.data.startLeft,top:a.data.startTop},function(){t(a.data.target).css("position",a.data.startPosition)});else t(a.data.target).css({position:"absolute",left:a.data.left,top:a.data.top}),r();return g.onStopDrag.call(a.data.target,a),n(),!1}function n(){t.fn.draggable.timer&&(clearTimeout(t.fn.draggable.timer),t.fn.draggable.timer=void 0),t(document).unbind(".draggable"),t.fn.draggable.isDragging=!1,setTimeout(function(){t("body").css("cursor","")},100)}t.fn.draggable=function(a,e){return"string"==typeof a?t.fn.draggable.methods[a](this,e):this.each(function(){function e(a){var e=t.data(a.data.target,"draggable"),r=e.handle,d=t(r).offset(),o=t(r).outerWidth(),n=t(r).outerHeight(),i=a.pageY-d.top,g=d.left+o-a.pageX,s=d.top+n-a.pageY,l=a.pageX-d.left;return Math.min(i,g,s,l)>e.options.edge}var n,i=t.data(this,"draggable");i?(i.handle.unbind(".draggable"),n=t.extend(i.options,a)):n=t.extend({},t.fn.draggable.defaults,t.fn.draggable.parseOptions(this),a||{});var g=n.handle?"string"==typeof n.handle?t(n.handle,this):n.handle:t(this);if(t.data(this,"draggable",{options:n,handle:g}),n.disabled)return void t(this).css("cursor","");g.unbind(".draggable").bind("mousemove.draggable",{target:this},function(a){if(!t.fn.draggable.isDragging){var r=t.data(a.data.target,"draggable").options;e(a)?t(this).css("cursor",r.cursor):t(this).css("cursor","")}}).bind("mouseleave.draggable",{target:this},function(a){t(this).css("cursor","")}).bind("mousedown.draggable",{target:this},function(a){if(0!=e(a)){t(this).css("cursor","");var n=t(a.data.target).position(),i=t(a.data.target).offset(),g={startPosition:t(a.data.target).css("position"),startLeft:n.left,startTop:n.top,left:n.left,top:n.top,startX:a.pageX,startY:a.pageY,width:t(a.data.target).outerWidth(),height:t(a.data.target).outerHeight(),offsetWidth:a.pageX-i.left,offsetHeight:a.pageY-i.top,target:a.data.target,parent:t(a.data.target).parent()[0]};t.extend(a.data,g);var s=t.data(a.data.target,"draggable").options;if(0!=s.onBeforeDrag.call(a.data.target,a))return t(document).bind("mousedown.draggable",a.data,r),t(document).bind("mousemove.draggable",a.data,d),t(document).bind("mouseup.draggable",a.data,o),t.fn.draggable.timer=setTimeout(function(){t.fn.draggable.isDragging=!0,r(a)},s.delay),!1}})})},t.fn.draggable.methods={options:function(a){return t.data(a[0],"draggable").options},proxy:function(a){return t.data(a[0],"draggable").proxy},enable:function(a){return a.each(function(){t(this).draggable({disabled:!1})})},disable:function(a){return a.each(function(){t(this).draggable({disabled:!0})})}},t.fn.draggable.parseOptions=function(a){var e=t(a);return t.extend({},t.parser.parseOptions(a,["cursor","handle","axis",{revert:"boolean",deltaX:"number",deltaY:"number",edge:"number",delay:"number"}]),{disabled:!!e.attr("disabled")||void 0})},t.fn.draggable.defaults={proxy:null,revert:!1,cursor:"move",deltaX:null,deltaY:null,handle:null,disabled:!1,edge:0,axis:null,delay:100,onBeforeDrag:function(t){},onStartDrag:function(t){},onDrag:function(t){},onStopDrag:function(t){}},t.fn.draggable.isDragging=!1}(jQuery);