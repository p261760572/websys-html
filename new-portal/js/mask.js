(function($) {
    var mask, maskMsg;
    var times = 0;

    function setSize() {
        if (mask && maskMsg) {
            maskMsg.css({
                left: (mask.outerWidth() - maskMsg.outerWidth()) / 2,
                top: (mask.outerHeight() - maskMsg.outerHeight()) / 2
            });
        }
    }

    function show(options) {
        if (mask && maskMsg) {
            //nothing
        } else {
            destroy(); //clean
            options = options || {};
            mask = $('<div class="xui-mask"></div>').appendTo('body');
            maskMsg = $('<div class="xui-mask-loading"></div>').appendTo('body');
            if (options.msg) {
                maskMsg.addClass('xui-mask-loading_msg').html(options.msg);

            }
            setSize();
        }

        times++;
    }

    function hide() {
        times--;
        if (times <= 0) {
            destroy();
        }
    }

    function destroy() {
        times = 0;
        if (maskMsg) {
            maskMsg.remove();
            maskMsg = null;
        }
        if (mask) {
            mask.remove();
            mask = null;
        }
    }

    $(window).resize(function() {
        setSize();
    });

    window.mask = {
        show: show,
        hide: hide,
        destroy: destroy
    };

})($);
