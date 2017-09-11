String.prototype.trim = function() {
    return this.replace(/(^[\s]*)|([\s]*$)/g, '');
};
String.prototype.ltrim = function() {
    return this.replace(/(^[\s]*)/g, '');
};
String.prototype.rtrim = function() {
    return this.replace(/([\s]*$)/g, '');
};

var xTool = {};

(function(xTool) {
	
	function dateToString(date){
		var y = date.getFullYear();
		var m = date.getMonth()+1;
		var d = date.getDate();
		return y+'-'+(m<10?('0'+m):m)+'-'+(d<10?('0'+d):d);
	};
	
	function stringToDate(s){
		if (!s) return new Date();
		var ss = s.split('-');
		var y = parseInt(ss[0],10);
		var m = parseInt(ss[1],10);
		var d = parseInt(ss[2],10);
		if (!isNaN(y) && !isNaN(m) && !isNaN(d)){
			return new Date(y,m-1,d);
		} else {
			return new Date();
		}
	};

    //查找
    function inObjectArray(value, array, valueField) {
        var i;
        valueField = valueField || 'value';
        for (i = 0; i < array.length; i++) {
            if (array[i][valueField] == value) {
                return array[i];
            }
        }
        return null;
    }

    //关闭当前窗口
    function close() {
        window.opener = null;
        window.open('', '_self');
        window.close();
    }

    //更新search刷新当前窗口
    function refresh(query) {
        var index = window.location.href.lastIndexOf('?');
        if (index < 0) {
            index = window.location.href.length;
        }
        window.location.href = window.location.href.substr(0, index) + '?' + $.param(query);
    }

    //解析查询字符串
    function parseQueryString() {
        var query = {};
        var queryString = window.location.search.substr(1);
        if (queryString.length > 0) {
            var pairs = queryString.split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split('=');
                if (pair.length < 2) {
                    pair[1] = "";
                }
                query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1].replace(/\+/g, ' '));
            }
        }
        return query;
    }

    //显示提示信息
    function showInfo(msg, callback) {
        $.messager.alert('提示', msg, 'info', callback);
    }

    //显示错误信息
    function showError(msg, callback) {
        $.messager.alert('错误', msg, 'error', callback);
    }

    //显示确认信息
    function showConfirm(msg, callback) {
        $.messager.confirm('确认', msg, callback);
    }

	function getUrl(url) {
		//绝对地址
		if(url.substr(0, 1) == '/') {
			if(window.location.pathname.substr(0, 4) == '/bm/') {
	        	return '/bm' + url;
	        }		
		}
        return url;
	}

    //发送请求,参数error,async可选
    function send(url, data, success, error, async) {

        if (typeof error !== 'function') {
            async = error;
            error = function(jqXHR, textStatus, errorThrown) {
                console.log(arguments);
            };
        }
        
       

        $.ajax(getUrl(url), {
            type: 'POST',
            async: (async == false ? false : true),
            contentType: 'application/json',
            dataType: 'json',
            data: $.toJSON(data),
            success: success,
            error: error
        });
    }

    //重置
    function reset(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');

        f.form('clear');
        $('.reset-delete', f).remove();

        if (opts.onReset) {
            opts.onReset.call(target);
        }
    }

    //序列化表单
    function serializeForm(form) {
        var f = $(form);
        var data = f.serializeObject();
        f.each(function(i, e) {
            var opts = $.parser.parseOptions(e);
            if (opts.onSerialize) {
                opts.onSerialize.call(e, data);
            }
        });
        return data;
    }

    //查询
    function search(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url || f.attr('action');
        var params = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, params) == false) {
            return false;
        }

        $(target).linkbutton('disable');
        $(opts.datagrid).datagrid('clearSelections').datagrid({
            url: getUrl(url),
            pageNumber: 1,
            queryParams: params,
            onLoadSuccess: function(data) {
                $(target).linkbutton('enable');
                if (opts.dialog) {
                    $(opts.dialog).dialog('close');
                }

                if (opts.onSuccess) {
                    opts.onSuccess.call(target, data);
                }
            },
            onLoadError: function() {
                $(target).linkbutton('enable');
            }
        });
    }

    //打开窗口
    function openWin(page, param, title) {
        if (typeof param != 'string') {
            param = $.toJSON(param);
        }
        var url = page + '?' + encodeURIComponent(param);
        window.open(getUrl(url), title, 'status=yes,toolbar=no,menubar=yes,location=no,resizable=yes,scrollbars=yes');
    }

    //导出
    function exportData(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url;
        var params = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, params) == false) {
            return false;
        }

        $(target).linkbutton('disable');
        send(url, params, function(data, textStatus, jqXHR) {
            $(target).linkbutton('enable');
            if (data.code == 0) {
                openWin('download.html', data.url, '下载' + data.url);
            }
        });
    }

    //表单状态转换
    function transformStatus(target, status) {
        var opts = $.parser.parseOptions(target);
        var f = $(target);

        //显示/隐藏
        $('.visible', target).show().filter('.invisible-' + status).hide();
        $('.invisible', target).hide().filter('.visible-' + status).show();
        
        //必填/选填
        $('.validatebox-text.optional', target).validatebox({
        	required: false
        }).filter('.required-' + status).validatebox({
        	required: true
        });
        
        $('.readonly,.readonly-' + status, target).find('input[type!="button"],textarea,select').each(function(index, element) {
            var t = $(element),
                box;
            if (t.hasClass('combobox-value')) {
                box = t.prev('.combobox-f');
                if (box.length == 0) {
                    box = t.closest('.combobox-f');
                }
                t = box;
            }

            if (t.hasClass('combobox-f')) {
                t.combobox('disable');
            } else if (t.hasClass('datebox-f')) {
                t.datebox('disable');
            } else if (element.tagName == 'SELECT') {
                t.attr('disabled', 'disabled');
            } else if (element.tagName == 'INPUT' && element.type == 'checkbox') {
                t.attr('disabled', 'disabled');
            } else if (element.tagName == 'INPUT') {
               t.attr('readonly', 'readonly');
            }
        });
        
        
        $('.editable,.editable-' + status, target).find('input[type!="button"],textarea,select').each(function(index, element) {
            var t = $(element),
                box;
            if (t.hasClass('combobox-value')) {
                box = t.prev('.combobox-f');
                if (box.length == 0) {
                    box = t.closest('.combobox-f');
                }
                t = box;
            }

            if (t.hasClass('combobox-f')) {
                t.combobox('enable');
            } else if (t.hasClass('datebox-f')) {
                t.datebox('enable');
            } else if (element.tagName == 'SELECT') {
                t.removeAttr('disabled');
            } else if (element.tagName == 'INPUT' && element.type == 'checkbox') {
                t.removeAttr('disabled');
            } else if (element.tagName == 'INPUT') {
                t.removeAttr('readonly');
            }
        });

        if (opts.onTransform) {
            opts.onTransform.call(target, status);
        }
    }

    //获取关键值
    function getKeys(keys, row) {
        var i, data = {};
        if (row) {
            for (i = 0; i < keys.length; i++) {
                data[keys[i]] = row[keys[i]];
            }
        }
        return data;
    }

    //格式化字段
    function formatField(rows, value, valueField, textField) {
        var i, len;
        valueField = valueField || 'value';
        textField = textField || 'text';
        if (rows) {
            len = rows.length;
            for (i = 0; i < len; i++) {
                if (rows[i][valueField] == value) {
                    return rows[i][textField];
                }
            }
        }
        return null;
    }

    //加载详情
    //target dom
    function loadDetail(target, params, options) {
    	var t, formOpts, url;
    	options = options || {};
        t = $(target).form('clear').removeClass('form-loaded');
        formOpts = $.parser.parseOptions(target, ['action']);
        url = options.url || formOpts.action;

        send(url, params, function(data) {
            if (data.code == 0) {
                if (formOpts.onLoad) {
                    formOpts.onLoad.call(target, data);
                }
                t.form('load', data.data).addClass('form-loaded');
                if (options.success) {
                    options.success.call(target, data);
                }
            }
        });
    }

    //提交表单
    function submit(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var request = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, request) == false) {
            return false;
        }

        if (f.form('enableValidation').form('validate') != true) {
            return false;
        }

        f.form('disableValidation');

        $(target).linkbutton('disable');
        send(opts.url, request, function(data) {
            $(target).linkbutton('enable');
            if (data.code == 0) {
                if (opts.onSubmit) {
                    opts.onSubmit.call(target, request, data);
                }
            }
        });
    }

    //批量提交
    function batchSubmit(target) {
        var opts = $.parser.parseOptions(target);
        var dgOpts = $(opts.datagrid).datagrid('options');
        var dg = $(opts.datagrid);
        var rows = dg.datagrid('getChecked');
        if (rows.length) {
            var i, keyRows, request;

            keyRows = [];
            for (i = 0; i < rows.length; i++) {
                keyRows.push(getKeys([dgOpts.idField], rows[i]));
            }

            request = {
                rows: keyRows
            };

            if (opts.onBefore && opts.onBefore.call(target, request) == false) {
                return false;
            }

            if (confirm('确认要' + opts.msg + '选中的记录？')) {
                send(opts.url, request, function(data, textStatus, jqXHR) {
                    if (data.code == 0) {
                        if (opts.onSubmit) {
                            opts.onSubmit.call(target, request, data);
                        }
                    }
                });
            }
        } else {
            showInfo('请选择记录！');
            return false;
        }
    }

    //datagrid行移动
    function move(target) {
        var opts = $.parser.parseOptions(target);
        var row, index;
        while ((row = $(opts.from).datagrid('getSelected'))) {
            index = $(opts.from).datagrid('getRowIndex', row);
            $(opts.to).datagrid('appendRow', row);
            $(opts.from).datagrid('deleteRow', index);
        }
    }

    //判断是否有下一状态
    function hasNextStatus(rows, oper_in, proc_st, action, options) {
        var i, len, operInField, procStField, actionField;
        options = options || {};
        operInField = options.operInField || 'oper_in';
        procStField = options.procStField || 'proc_st';
        actionField = options.actionField || 'action';

        oper_in = oper_in || '0';
        proc_st = proc_st || '0';

        len = rows.length;
        for (i = 0; i < len; i++) {
            var row = rows[i];
            if (row[operInField] == oper_in && row[procStField] == proc_st && row[actionField] == action) {
                return true;
            }
        }

        return false;
    }

    //导出函数
    xTool.dateToString = dateToString;
    xTool.stringToDate = stringToDate;
    xTool.inObjectArray = inObjectArray;
    xTool.close = close;
    xTool.refresh = refresh;
    xTool.parseQueryString = parseQueryString;
    xTool.showError = showError;
    xTool.showInfo = showInfo;
    xTool.showConfirm = showConfirm;
    xTool.send = send;
    xTool.serializeForm = serializeForm;
    xTool.transformStatus = transformStatus;
    xTool.search = search;
    xTool.reset = reset;
    xTool.openWin = openWin;
    xTool.exportData = exportData;
    xTool.formatField = formatField;
    xTool.loadDetail = loadDetail;
    xTool.submit = submit;
    xTool.batchSubmit = batchSubmit;
    xTool.move = move;
    xTool.hasNextStatus = hasNextStatus;
    xTool.getUrl = getUrl;
})(xTool);

$.ajaxSetup({
    complete: function(jqXHR, status) {
        if (jqXHR.status == 200) {
            var data = $.parseJSON(jqXHR.responseText || '{}');
            if (data.code == -11) {
                window.top.location.href = '/';
            } else if (data.code != 0) {
                if (data.msg != undefined) {
                    if(window.layer) {
                        layer.alert(data.msg, {title:'错误',icon: 2});
                    } else {
                        xTool.showError(data.msg);
                    }
                }
            }
        }
    }
});

//扩展tree
if ($.fn.tree) {
    $.extend($.fn.tree.methods, {
        unselect: function(jq, target) {
            return jq.each(function() {
                $(target).removeClass('tree-node-selected');
            });
        }
    });
}

if ($.fn.validatebox) {
    $.extend($.fn.validatebox.defaults.rules, {
        remote: {
            validator: function(value, param) {
                var res = false;
                var queryParams = $(this).validatebox('options').queryParams;
                queryParams[param[1]] = value;

                xTool.send(param[0], queryParams, function(data) {
                    if (data.code == 0) {
                        if (data.data.total <= 0) {
                            res = true;
                        }
                    }
                }, false);

                return res;
            },
            message: '该{2}已经存在'
        },
        equals: {
            validator: function(value, param) {
                return value == $(param[0]).val();
            },
            message: '两次输入内容不一致'
        },
        combobox: {
            validator: function(value, param) {
                var t = $(this).closest('.combobox');
                var opts = t.combobox('options');
                var rows = t.combobox('getData');
                var i;
                value = t.combobox('getValue');
                for (i = 0; i < rows.length; i++) {
                    if (rows[i][opts.valueField] == value) {
                        return true;
                    }
                }
                return false;
            },
            message: '输入内容必须是选择项'
        },
        minLength: {
            validator: function(value, param) {
                return value.length >= param[0];
            },
            message: '输入内容长度最少为{0}'
        },
        maxLength: {
            validator: function(value, param) {
                return value.length <= param[0];
            },
            message: '输入内容长度最多为{0}'
        },
        fixLength: {
            validator: function(value, param) {
                return value.length == param[0];
            },
            message: '输入内容长度必须等于{0}'
        },
        number: {
            validator: function(value, param) {
                return !isNaN(value);
            },
            message: '输入内容必须是数值'
        },
        digit: {
            validator: function(value, param) {
                var re = /^[0-9]+$/;
                return re.test(value);
            },
            message: '输入内容必须是数字'
        },
        mobile: {
            validator: function(value, param) {
                //var re = /^(13|15|17|18)\d{9}$/;
                var re = /^\d{11}$/;
                return re.test(value);
            },
            message: '输入内容必须是有效的手机号码'
        },
        phone: {
            validator: function(value, param) {
                var re = /^(([0+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
                return re.test(value);
            },
            message: '输入内容必须是有效的电话:010-88888888'
        },
        certId: {
            validator: function(value, param) {
                var re = /^[0-9X]+$/;
                return re.test(value);
            },
            message: '输入内容必须是数字或X'
        }
    });

    //修改默认值
    $.fn.validatebox.defaults.novalidate = true;
}

if ($.fn.combobox) {
    $.fn.combobox.defaults.novalidate = true;
}

if ($.fn.datagrid) {
    $.fn.datagrid.defaults.pageList = [10, 20, 50, 100, 200];
}

$(function() {
    $('.xui-linkbutton').linkbutton();
    $('.xui-combobox').combobox();
    $('.xui-datagrid').datagrid();
    $('.xui-accordion').accordion();
    $('.xui-dialog').dialog();
    $('.xui-tabs').tabs();
    $('.xui-validatebox').validatebox();
    $('.xui-select2').select2();
    $('.xui-datebox').datebox();
});