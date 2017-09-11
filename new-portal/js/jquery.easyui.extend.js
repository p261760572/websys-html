if ($.fn.tree) {
    $.extend($.fn.tree.methods, {
        unselect: function (jq, target) {
            return jq.each(function () {
                $(target).removeClass('tree-node-selected');
            });
        }
    });
}

if ($.fn.validatebox) {
    $.extend($.fn.validatebox.defaults.rules, {
        minLength: {
            validator: function (value, param) {
                return value.length >= param[0];
            },
            message: '输入内容长度最少为{0}'
        },
        maxLength: {
            validator: function (value, param) {
                return value.length <= param[0];
            },
            message: '输入内容长度最多为{0}'
        },
        fixLength: {
            validator: function (value, param) {
                return value.length == param[0];
            },
            message: '输入内容长度必须等于{0}'
        },
        number: {
            validator: function (value, param) {
                return !isNaN(value);
            },
            message: '输入内容必须是数值'
        },
        integer: {
            validator: function (value, param) {
                var re =  /^[1-9]+[0-9]*$/;
                return re.test(value);
            },
            message: '输入内容必须是整数'
        }
    });
}
