$(function() {

    function linkbutton() {
        $('.easyui-linkbutton').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);
            var text = t.text();
            t.text('');

            t.removeClass('easyui-linkbutton').addClass('xui-linkbutton l-btn');
            if (opts.plain) {
                t.addClass('l-btn-plain');
            }
            if (opts.iconCls) {
                $('<span class="l-btn-left l-btn-icon-left">' +
                    '<span class="l-btn-text">' + text + '</span>' +
                    '<span class="l-btn-icon ' + opts.iconCls + '">&nbsp;</span>' +
                    '</span>').appendTo(t);
            } else {
                $('<span class="l-btn-left">' +
                    '<span class="l-btn-text">' + text + '</span>' +
                    '</span>').appendTo(t);
            }
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target);
        };
    }

    function combobox() {
        $('.easyui-combobox').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);
            var id = t.attr('id');
            var name = t.attr('name');
            var dataOptions = t.attr('data-options');

            var combo = $('<span class="xui-combobox combobox">' +
                '<input type="text" class="combobox-text">' +
                '<input type="hidden" name="value" class="combobox-value" >' +
                '<span class="combobox-addon">' +
                '<i class="combobox-icon combobox-arrow"></i>' +
                '</span>' +
                '</span>');
            t.after(combo);

            combo.attr('id', id).attr('data-options', dataOptions);

            if (opts.width) {
                $('.combobox-text', combo).css({
                    width: opts.width - 25
                });
            }

            //combo.css({
            //    width: t.css('width')
            //});

            $('.combobox-value', combo).attr('name', name);

            t.remove();
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target, ['width']);
        };
    }


    function datagrid() {
        $('.easyui-datagrid').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);
            var id = t.attr('id');
            var dataOptions = t.attr('data-options');

            var dg = $('<div class="xui-datagrid datagrid" style="min-width: 800px;">' +
                '<div class="datagrid-header">' +
                '</div>' +
                '<div class="datagrid-body">' +
                '<div class="datagrid-toolbar">' +
                '</div>' +
                '<div class="datagrid-view">' +
                '<table class="datagrid-table" border="0" cellspacing="0" cellpadding="0">' +
                '<thead>' +
                '<tr class="datagrid-header-row">' +
                '<th class="datagrid-header-rownumber" data-options="field:\'rn\',rownumber:true"></th>' +
                '<th class="datagrid-td-check" data-options="field:\'chk\',checkbox:true"><div class="datagrid-header-check"><input type="checkbox"></div></th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '</tbody>' +
                '</table>' +
                '</div>' +
                '<div class="datagrid-pager">' +
                '</div>' +
                '</div>' +
                '</div>');
            t.after(dg);

            dg.attr('id', id).attr('data-options', dataOptions);

            if (!opts.title) {
                $('.datagrid-header', dg).remove();
            } else {
                $('.datagrid-header', dg).html(opts.title);
            }

            var hasCheck = false;
            $('>thead>tr>th', t).each(function() {
                var o = $.parser.parseOptions(this);
                if (o.checkbox) {
                    hasCheck = true;
                    $(this).remove();
                }
            });

            if (!hasCheck) {
                $('.datagrid-td-check', dg).remove();
            }

            $('.datagrid-table>thead>tr', dg).append($('>thead>tr>th', t));

            if (!opts.toolbar) {
                $('.datagrid-toolbar', dg).remove();
            } else {
                $('.datagrid-toolbar', dg).append($(opts.toolbar).children());
                $(opts.toolbar).remove();
            }

            if (!opts.pagination) {
                $('.datagrid-pager', dg).remove();
            }

            t.remove();
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target, ['title']);
        };
    }

    function accordion() {
        $('.easyui-accordion').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);
            var id = t.attr('id');

            t.addClass('xui-accordion accordion').removeClass('easyui-accordion');

            var panels = t.children('div').each(function() {
                var title = $(this).attr('title');
                $(this).removeAttr('title');

                var p = $(this).addClass('accordion-body').wrap('<div class="accordion-panel"></div>').parent();
                p.prepend('<div class="accordion-header">' +
                    title +
                    '<div class="accordion-icon accordion-collapse"></div>' +
                    '</div>')
            });
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target, ['title']);
        };
    }


    function dialog() {
        $('.easyui-dialog').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);
            var id = t.attr('id');
            var title = t.attr('title');
            var dataOptions = t.attr('data-options');
            t.removeAttr('id');

            var p = $(this).addClass('dialog-body').wrap('<div class="dialog-view"></div>').parent();
            var pp = p.wrap('<div class="xui-dialog dialog"></div>').parent();
            pp.attr('id', id).attr('data-options', dataOptions);

            pp.prepend('<div class="dialog-header">' +
                title +
                '<a class="dialog-close" href="javascript:void(0)"></a>' +
                '</div>');

            if (opts.buttons) {
                $(opts.buttons).appendTo(p).addClass('dialog-button').removeAttr('id');
            }
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target, ['title']);
        };
    }

    function tabs() {
        $('.easyui-tabs').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);
            var id = t.attr('id');
            var dataOptions = t.attr('data-options');

            t.removeAttr('id');

            t.removeClass('easyui-tabs');
            var p = t.addClass('tabs-panels').wrap('<div class="xui-tabs tabs"></div>').parent();
            p.attr('id', id).attr('data-options', dataOptions);

            //t.removeAttr('style');

            //p.css({
            //	width: t.css('width')
            //});
            //
            //t.css({
            //	width: 'auto'
            //});


            var header = $('<div class="tabs-header"></div>').prependTo(p);
            var nav = $('<ul class="tabs-nav"></ul>').appendTo(header);

            var panels = t.children('div').each(function(i) {
                var o = $.parser.parseOptions(this);
                var title = $(this).attr('title');
                $(this).removeAttr('title');

                var p = $(this).addClass('tabs-panel');

                var s = [];
                if (i == 0) {
                    s.push('<li class="tabs-selected">' + title);
                } else {
                    s.push('<li>' + title);
                }

                if (o.closable) {
                    s.push('<a class="tabs-close" href="javascript:void(0)">¡Á</a>');
                }
                s.push('</li>');
                nav.append(s.join(''));

                if (i != 0) {
                    $(this).hide();
                }
            });
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target, ['title']);
        };
    }

    function validatebox() {
        $('.easyui-validatebox').each(function(i, domEle) {
            var opts = parseOptions(this);
            var t = $(this);

            t.removeClass('easyui-validatebox').addClass('xui-validatebox');
        });

        function parseOptions(target) {
            return $.parser.parseOptions(target, ['title']);
        };
    }


    linkbutton();
    combobox();
    datagrid();
    accordion();
    dialog();
    tabs();
    validatebox();

	/*
    $('.xui-linkbutton').linkbutton();
    $('.xui-combobox').combobox();
    $('.xui-datagrid').datagrid();
    $('.xui-accordion').accordion();
    $('.xui-dialog').dialog();
    $('.xui-tabs').tabs();
    $('.xui-validatebox').validatebox();
    $('.xui-select2').select2();
    */
});