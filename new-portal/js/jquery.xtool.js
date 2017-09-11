String.prototype.trim = function () {
    return this.replace(/(^[\s]*)|([\s]*$)/g, '');
};
String.prototype.ltrim = function () {
    return this.replace(/(^[\s]*)/g, '');
};
String.prototype.rtrim = function () {
    return this.replace(/([\s]*$)/g, '');
};


var xTool = {};

(function (xTool) {
    function showInfo(msg, callback) {
    	/*
        $.messager.show({
            title: '提示',
            msg: msg,
            timeout: 3000,
            showType: 'show',
            width: 250,
            height: 80,
            style: {
                left: ($(window).width() + $(window).scrollLeft() - 250) / 2,
                top: ($(window).height() + $(window).scrollTop() - 80) / 2,
                right: '',
                bottom: ''
            }
        });
        */
        $.messager.alert('提示', msg, 'info', callback);
    }

    function showError(msg, callback) {
        $.messager.alert('错误', msg, 'error', callback);
    }
    
    function showConfirm(msg, callback) {
    	$.messager.confirm('确认', msg, callback);
    }

    function send(url, data, success, async) {
        $.ajax(url, {
            type: 'POST',
            async: (async == false ? false : true),
            contentType: 'application/json',
            dataType: 'json',
            data: $.toJSON(data),
            success: success
        });
    }

    //点击重置按钮
    function reset(target) {
		var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
		
        f.form('clear').removeClass('form-loaded');
        $('.delete', f).remove();
		
		if(opts.onSuccess) {
			opts.onSuccess.call(target);
		}
    }

    /*序列化表单
		f: jqurey对象
	*/
    function serializeForm(f) {
        var $disabled = f.find('[disabled]').removeAttr('disabled');
        var data = f.serializeObject();
        f.each(function (i, e) {
            var opts = $.parser.parseOptions(e);
            if (opts.onSerialize) {
                opts.onSerialize.call(e, data);
            }
        });
        $disabled.attr('disabled', 'disabled');
        return data;
    }

    //点击查询按钮
    function search(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = f.attr('action');
        var params = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, params) == false) {
            return false;
        }

        $(target).linkbutton('disable');
        $(opts.datagrid).datagrid('clearSelections').datagrid({
            url: url,
            pageNumber: 1,
            queryParams: params,
            onLoadSuccess: function (data) {
                $(target).linkbutton('enable');
                if (opts.dialog) {
                    $(opts.dialog).dialog('close');
                }
                
                //if(data.total == 1) {
                //	$(this).datagrid('selectRow', 0);
            	//}
            	
            	if(opts.onSuccess) {
            		opts.onSuccess.call(target, data);
            	}
            },
            onLoadError: function () {
                $(target).linkbutton('enable');
            }
        });
    }
    
    //点击导出按钮
    function exportData(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = opts.url;
        var params = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, params) == false) {
            return false;
        }

        $(target).linkbutton('disable');
        send(url, params, function(data, textStatus, jqXHR){
        	$(target).linkbutton('enable');
        	if(data.code == 0) {
        		openWin('download.html', data.url, '下载'+data.url);
        	}
        });
    }

    /*
	Description: 转换表单状态
	
	target 表单dom
	status 目标状态
	*/
    function transformStatus(target, status) {
        var opts = $.parser.parseOptions(target);
        var f = $(target);

        f.removeClass('view-form add-form edit-form check1-form check2-form').addClass(status + '-form'); //保存当前状态;
        $('.search-div').hide();
        $('.detail-div').show();
        //必填验证处理
        if ($.inArray(status, ['view', 'check1', 'check2']) < 0) {
            f.find('.required-v').validatebox({
                required: true
            });
            f.find('.' + status + '-v' + '.validatebox-text:not(:disabled)').addClass('required-v').validatebox({
                required: false
            });
        }

        //按钮
        $('.button', target).hide().filter('.' + status).show();

        // 其它元素
        $('input[type!="button"],textarea,select', target).each(function (index, element) {
            var t = $(element);
            if ($.inArray(status, ['view', 'check1', 'check2']) >= 0 || t.hasClass(status)) { //不可编辑
                if (t.hasClass('datebox-f')) {
                    t.datebox('disable');
                } else if (t.hasClass('combobox-f')) {
                    t.combobox('disable');
                } else if (element.tagName == 'SELECT') {
                    t.attr('disabled', 'disabled');
                } else if (element.tagName == 'INPUT' && element.type == 'checkbox') {
                    t.attr('disabled', 'disabled');
                } else if (!t.hasClass('textbox-text-readonly')) {
                    t.attr('readonly', 'readonly');
                }
            } else { // 可编辑
                if (t.hasClass('datebox-f')) {
                    t.datebox('enable');
                } else if (t.hasClass('combobox-f')) {
                    t.combobox('enable');
                } else if (element.tagName == 'SELECT') {
                    t.removeAttr('disabled');
                } else if (element.tagName == 'INPUT' && element.type == 'checkbox') {
                    t.removeAttr('disabled');
                } else if (!t.hasClass('textbox-text-readonly')) {
                    t.removeAttr('readonly');
                }
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

    /*
	Description: 加载详情
	
	target 表单dom
	params 请求参数
	options 包含target,onSuccess属性
	*/
    function loadDetail(target, params, options) {
        var f = $(target).form('clear').removeClass('form-loaded');
        var opts = $.parser.parseOptions(target, ['action']);

        send(opts.action, params, function (data) {
            if (data.code == 0) {
                if (opts.onLoad) {
                    opts.onLoad.call(target, data);
                }
                if (options && options.onSuccess) {
                    options.onSuccess.call(options.target, data.data);
                }
                f.form('load', data.data).addClass('form-loaded');
            }
        });
    }

    //点击查看按钮
    function view(target, status) {
        var opts = $.parser.parseOptions(target);
        var dgOpts = $(opts.datagrid).datagrid('options');
        var row = $(opts.datagrid).datagrid('getSelected');
        status = status || 'view';
        if (row) {
            if (!dgOpts.idField) {
                showInfo('没有记录ID！');
                return false;
            }

            if (opts.onBefore && opts.onBefore.call(target, row) == false) {
                return false;
            }

            var fm = $(opts.form);
            fm.form('disableValidation');
            if (opts.transform != false) {
                transformStatus(fm[0], status);
            }
            loadDetail(fm[0], getKeys([dgOpts.idField], row), {
                target: target,
                onSuccess: opts.onSuccess
            });


			var p = fm.find('div.accordion-header:contains(系统使用)').closest('div.accordion-panel');
			if ($.inArray(status, ['edit']) >= 0) {
                p.hide();
            } else {
                p.show();
            }
			
        } else {
            showInfo('请选择记录！');
            return false;
        }
    }

    //点击新增按钮
    function add(target) {
        var opts = $.parser.parseOptions(target);
        var fm = $(opts.form);

        if (opts.onBefore && opts.onBefore.call(target) == false) {
            return false;
        }

		fm.form('disableValidation');
        transformStatus(fm[0], 'add');
        $('.add', fm).not('.button').val(''); //清空不能输入项

        if (fm.hasClass('form-loaded')) {
            $.messager.confirm('确认', '确认清空当前数据', confirmCallback);
        } else {
            confirmCallback(true);
        }

        function confirmCallback(r) {
            if (r) {
                fm.form('clear').removeClass('form-loaded');
            }

            if (opts.onSuccess) {
                opts.onSuccess.call(target, r);
            }
            
            var p = fm.find('div.accordion-header:contains(系统使用)').closest('div.accordion-panel');
            p.hide();			
        }
    }

    //点击编辑按钮
    function edit(target) {
        return view(target, 'edit');
    }

    //点击一审按钮
    function check1(target) {
        return view(target, 'check1');
    }

    //点击二审按钮
    function check2(target) {
        return view(target, 'check2');
    }

    //点击新增按钮成功时调用
    function addSuccess() {
        var opts = $.parser.parseOptions(this);
        var fm = $(opts.form);
        
        if (window.formDefaults) {
            fm.form('load', window.formDefaults);
        }
    }

	//提交表单
    function submitForm(target) {
        var opts = $.parser.parseOptions(target);
        var f = $(target).closest('form');
        var url = f.attr('action');
        var requestData = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, requestData) == false) {
            return false;
        }

        if (f.form('enableValidation').form('validate') != true) {
            return false;
        }
        
        f.form('disableValidation');

        $(target).linkbutton('disable');
        send(url, requestData, function (data) {
            $(target).linkbutton('enable');

            if (data.code == 0) {
                if (opts.onSuccess) {
                    opts.onSuccess.call(target, requestData, data);
                }
            }
        });
    }
    
    function expandAccordion(target) {
    	var t = $(target);
    	var header = t.children('div.panel-header');
    	var body = t.children('div.panel-body');
    	header.addClass('accordion-header-selected').find('a.accordion-collapse').removeClass('accordion-expand');
    	body.show();
    }

    //提交表单
    function submit(target, status) {
        var opts = $.parser.parseOptions(target);

        var f = $(target).closest('form');
        var requestData = serializeForm(f);

        if (opts.onBefore && opts.onBefore.call(target, requestData) == false) {
            return false;
        }

        if (f.form('enableValidation').form('validate') != true) {
        	var panels = f.find('.accordion').children('div.panel');
        	panels.each(function(i, domEle){
        		expandAccordion(domEle)
        	});
            return false;
        }

        f.form('disableValidation');

        $(target).linkbutton('disable');
        send(opts.url, requestData, function (data) {
            $(target).linkbutton('enable');

            if (data.code == 0) {
                if (opts.transform != false) {
                    transformStatus(f[0], 'view');
                }
                
                if(opts.prompt != false) {
                	showInfo('操作成功');
            	}

                if (opts.datagrid) {
                    $(opts.datagrid).datagrid('reload');
                }

                if (opts.onSuccess) {
                    opts.onSuccess(requestData, data);
                }
            }
        });
    }

    //新增提交
    function addSubmit(target) {
        return submit(target, 'add');
    }

    //编辑提交
    function editSubmit(target) {
        return submit(target, 'edit');
    }

    //一审提交
    function check1Submit(target) {
        return submit(target, 'check1');
    }

    //二审提交
    function check2Submit(target) {
        return submit(target, 'check2');
    }

    //批量提交
    function batchSubmit(target) {
        var opts = $.parser.parseOptions(target);
        var dgOpts = $(opts.datagrid).datagrid('options');
        var dg = $(opts.datagrid);
        var rows = dg.datagrid('getChecked');
        if (rows.length) {
            var actionMap = {
                'delete': '删除',
                'batch-delete': '删除',
                'batch-check1-pass': '批量审核通过',
                'batch-check1-nopass': '批量审核不通过',
                'batch-check2-pass': '批量二审通过',
                'batch-check2-nopass': '批量二审不通过',
                'batch-cancel-check1': '批量取消待审'
            };
            var action = opts.url.substr(opts.url.lastIndexOf('/') + 1);
            var msg = opts.msg || actionMap[action];
            var keyRows = [], i;
            for (i = 0; i < rows.length; i++) {
                keyRows.push(getKeys([dgOpts.idField], rows[i]));
            }
            var sendData = {rows: keyRows};
            
            if (opts.onBefore && opts.onBefore.call(target, sendData) == false) {
	            return false;
	        }
            
            if (confirm('确认要' + msg + '选中的记录？')) {
                
                send(opts.url, sendData, function (data, textStatus, jqXHR) {
                    if (data.code == 0) {
                        dg.datagrid('reload');
                        showInfo('操作成功');
                        
                        if (opts.onSuccess) {
		                    opts.onSuccess(sendData, data);
		                }
                    }
                });
            }
        } else {
            showInfo('请选择记录！');
            return false;
        }
    }

    //删除批量提交
    function deleteBatchSubmit(target) {
        return batchSubmit(target);
    }

    //一审批量提交
    function check1BatchSubmit(target) {
        return batchSubmit(target);
    }

    //二审批量提交
    function check2BatchSubmit(target) {
        return batchSubmit(target);
    }
    
    //取消待审
    function cancelCheck1BatchSubmit(target) {
        return batchSubmit(target);
    }

    function returnSearch(target) {
        var opts = $.parser.parseOptions(target);
        $('.detail-div').hide();
        $('.search-div').show();
        if (opts.onSuccess) {
            opts.onSuccess.call(target);
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

    //加载select下拉框
    function loadOption(target) {
        var valueField, textField;
        var opts = $.parser.parseOptions(target);;
        valueField = opts.valueField || 'value';
        textField = opts.textField || 'text';

        if (opts.url) {
            send(opts.url, opts.queryParams, function (data, textStatus, jqXHR) {
                var i, row, str;
                if (data.code == 0) {
                    str = '';
                    if (opts.pleaseSelect) {
                        str + '<option value="">--请选择--</option>';
                    }
                    for (i = 0; i < data.rows.length; i++) {
                        row = data.rows[i];
                        str = str + '<option value="' + row[valueField] + '">' + row[textField] + '</option>';
                    }
                    $(target).html(str);
                }
            });
        }
    }

    function sortTreeData(rows, options) {
        var treeDataMap, i, root, treeData;

        treeDataMap = {};
        for (i = 0; i < rows.length; i++) {
            treeDataMap[rows[i][options.id]] = rows[i];
        }

        //找root
        for (i = 0; i < rows.length; i++) {
            if (!treeDataMap[rows[i][options.pid]]) {
                root = rows[i];
                break;
            }
        }

        //root = treeDataMap[options.root];
        //treeDataMap[options.root] = null; //clear
        treeData = [];

        sortData(treeData, root);
        return treeData;

        function createNode(row) {
            var node = {
                id: row[options.id],
                text: row[options.text]
            };

            //图标处理
            if (options.icon && row[options.icon]) {
                node.iconCls = row[options.icon];
            }

            var i, name;
            if (options.attributes) {
                for (i = 0; i < options.attributes.length; i++) {
                    name = options.attributes[i];
                    if (row[name]) {
                        node.attributes = node.attributes || {};
                        node.attributes[name] = row[name];
                    }
                }
            }

            return node;
        }

        function sortData(children, row) {
            while (row) {
                var pid = row[options.pid];
                var lid = row[options.lid];
                var rid = row[options.rid];

                var node = createNode(row, options)

                children.push(node);

                //children
                if (rid) {
                    var child = treeDataMap[rid];
                    if (child) {
                        node.children = [];
                        sortData(node.children, child);
                    }
                }

                row = treeDataMap[lid];
            }
        }
    }

    function genEasyuiTreeData(rows, options) {
        var treeDataMap = {};
        var treeData = [];
        var i, row, p, node;

        for (i = 0; i < rows.length; i++) {
            row = rows[i];
            treeDataMap[row[options.id]] = genEasyuiTreeNode(row, options);
        }

        //组装树    
        for (i = 0; i < rows.length; i++) {
            row = rows[i];
            node = treeDataMap[row[options.id]];
            p = treeDataMap[row[options.pid]];
            if (!p) { //没有找到parent
                treeData.push(node);
            } else { //找到parent
                p.children = p.children || [];
                p.children.push(node);
            }
        }

        return treeData;

        function genEasyuiTreeNode(row, options) {
            var node = {
                id: row[options.id],
                text: row[options.text]
            };

            if (options.icon && row[options.icon]) {
                node.iconCls = row[options.icon];
            }

            var i, name;
            if (options.attributes) {
                for (i = 0; i < options.attributes.length; i++) {
                    name = options.attributes[i];
                    if (row[name]) {
                        node.attributes = node.attributes || {};
                        node.attributes[name] = row[name];
                    }
                }
            }

            return node;
        }
    }

    //查看树结点
    function viewNode(target) {
        var opts = $.parser.parseOptions(target);
        var treeOpts = $(opts.tree).tree('options');
        var node = $(opts.tree).tree('getSelected');
        var data = {};
        if (node) {
            data[treeOpts.idField] = node.id;

            if (opts.onBefore && opts.onBefore.call(target, node, data) == false) {
                return false;
            }

            var f = $(opts.form);
            f.form('disableValidation');
            transformStatus(f[0], 'view');
            loadDetail(f[0], data, {
                target: target,
                onSuccess: opts.onSuccess
            });
        } else {
            showInfo('请选择结点！');
            return false;
        }
    }

    //编辑树结点
    function editNode(target) {
        var opts = $.parser.parseOptions(target);
        var tree = $(opts.tree);
        var treeOpts = tree.tree('options');
        var node = tree.tree('getSelected');
        var data = {};
        if (node) {
            data[treeOpts.idField] = node.id;

            if (opts.onBeforeLoad && opts.onBeforeLoad(node, data) == false) {
                return false;
            }

            var f = $(opts.form);
            transformStatus(f[0], 'edit');
            loadDetail(f[0], data, {
                target: target,
                onSuccess: opts.onSuccess
            });
        } else {
            showInfo('请选择结点！');
            return false;
        }
    }

    //删除树结点
    function deleteNodeSubmit(target) {
        var opts = $.parser.parseOptions(target);
        var tree = $(opts.tree);
        var treeOpts = tree.tree('options');
        var node = tree.tree('getSelected');
        var data = {};

        if (node) {
            data[treeOpts.idField] = node.id;

            if (opts.onBefore && opts.onBefore(node, data) == false) {
                return false;
            }

            if (confirm('确认要删除选中的结点？')) {
                send(opts.url, data, function (data, textStatus, jqXHR) {
                    if (data.code == 0) {
                        //更新树
                        var selected = tree.tree('getSelected');
                        tree.tree('remove', selected.target);
                        showInfo('操作成功');
                    }
                });
            }
        } else {
            showInfo('请选择结点！');
            return false;
        }
    }

    //打开窗口
    function openWin(page, param, title) {
        if (typeof param != 'string') {
            param = $.toJSON(param);
        }
        var url = page + '?' + encodeURIComponent(param);
        window.open(url, title, 'status=yes,toolbar=no,menubar=yes,location=no,resizable=yes,scrollbars=yes');
    }

    function openModifyInfoWin(target, res_name) {
        var opts = $.parser.parseOptions(target);
        var url = window.location.href;
        var param = {}

        res_name = res_name || url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

		if(opts.datagrid) {
	        var dgOpts = $(opts.datagrid).datagrid('options');
	        var row = $(opts.datagrid).datagrid('getSelected');
	        if (row) {
	            if (!dgOpts.idField) {
	                showInfo('没有记录ID！');
	                return false;
	            }
	
	            param[dgOpts.idField] = row[dgOpts.idField];
	            param['res_name'] = res_name;
	
	            openWin('modify-info.html', param, '变更信息');
	        } else {
	            showInfo('请选择记录！');
	        }
    	} else {
    		var f = $(target).closest('form');
        	var data = serializeForm(f);
        	
        	param['rec_id'] = data.rec_id;
	        param['res_name'] = res_name;
	
	        openWin('modify-info.html', param, '变更信息');
    	}
    }

    //判断是否有下一状态
    function hasNextStatus(rows, oper_in, proc_st, action) {
        var i, len;

        oper_in = oper_in || '0';
        proc_st = proc_st || '0';

        len = rows.length;
        for (i = 0; i < len; i++) {
            var row = rows[i];
            if (row.oper_in == oper_in && row.proc_st == proc_st && row.action == action) {
                return true;
            }
        }

        return false;
    }

    //datagrid click row事件
    function selectRow(rowIndex, rowData) {
        var opts = $(this).datagrid('options');
        var panel = $(this).datagrid('getPanel');
        var tool = panel.find('.datagrid-toolbar');

        //TODO modify-info
        tool.find('.l-btn').each(function (i, element) {
            var options = $.parser.parseOptions(element);
            var url, action;
            var result = true;
            if (options.url) {
                var url = options.url;
                var action = url.substr(url.lastIndexOf('/') + 1);
                if (action.indexOf('batch-') != 0 && action.indexOf('create-') != 0 && $.inArray(action, ['search','create']) < 0) { //排除批量操作和选中记录无关的操作
                    if (action.indexOf('assign-') != 0 && $.inArray(action, ['view', 'modify-info']) < 0) { //跟选中记录状态无关的操作
                        if (!hasNextStatus(opts.transition, rowData['oper_in'], rowData['proc_st'], action)) {
                            result = false;
                        }
                    }

                    if (result) {
                        $(element).linkbutton('enable').show();
                    } else {
                        $(element).linkbutton('disable').hide();
                    }
                }
            }
        });
    }

    //datagrid check row事件
    function checkRow() {
        var opts = $(this).datagrid('options');
        var panel = $(this).datagrid('getPanel');
        var tool = panel.find('.datagrid-toolbar');
        var rows = $(this).datagrid('getChecked');

        tool.find('.l-btn').each(function (i, element) {
            var options = $.parser.parseOptions(element);
            var url, action, i, len, row;
            var result = true;
            if (options.transform != false && options.url) {
                url = options.url;
                action = url.substr(url.lastIndexOf('/') + 1);

                if (action.indexOf('batch-') == 0) { //以batch-开头
                    action = action.substr(6);
                    len = rows.length;
                    for (i = 0; result && i < len; i++) {
                        row = rows[i];
                        if (!hasNextStatus(opts.transition, row['oper_in'], row['proc_st'], action)) {
                            result = false;
                        }
                    }

                    if (len > 0 && result) {
                        $(element).linkbutton('enable').show();
                    } else {
                        $(element).linkbutton('disable').hide();
                    }
                }
            }
        });
    }


    //日期联动
    function showNextDate() {
        var target = this;
        var opts = $(this).datebox('options');
        var next = opts.next;
        if (next) {
            $(next).datebox('calendar').calendar({
                validator: function (date) {
                    var d1 = $(target).datebox('getValue');
                    var d2 = $.fn.datebox.defaults.formatter(date);
                    return d2 >= d1;
                }
            });
            $(next).datebox('showPanel');
        }
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

    //格式化启用标志
    function formatInuse(value) {
        return formatField(xConfig['inuse'], value);
    };

    //格式化操作标志
    function formatOperIn(value) {
        return formatField(xConfig['oper_in'], value);
    };

    //格式化记录处理状态
    function formatProcSt(value) {
        return formatField(xConfig['proc_st'], value);
    };

    //格式化同步状态
    function formatSynSt(value) {
        return formatField(xConfig['syn_st'], value);
    };

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

    function displayType(array) {
        var tool = $('.datagrid-toolbar');
        tool.find('.l-btn').each(function (i, element) {
            var options = $.parser.parseOptions(element);
            var url, action;
            var result = false;
            if (options.url) {
                var url = options.url;
                var action = url.substr(url.lastIndexOf('/') + 1);
                if ($.inArray(action, array) >= 0) {
                    result = true;
                }

                if (!result) {
                    $(element).remove();
                }
            }
        });
    }

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

    //导出函数
    xTool.send = send;
    xTool.transformStatus = transformStatus;
    xTool.search = search;
    xTool.reset = reset;
	xTool.exportData = exportData;
	
    //数据表格
    xTool.add = add;
    xTool.view = view;
    xTool.edit = edit;
    xTool.check1 = check1;
    xTool.check2 = check2;
    xTool.addSuccess = addSuccess;

    xTool.loadDetail = loadDetail;
    xTool.submit = submit;
    xTool.addSubmit = addSubmit;
    xTool.editSubmit = editSubmit;
    xTool.check1Submit = check1Submit;
    xTool.check2Submit = check2Submit;
    xTool.batchSubmit = batchSubmit;
    xTool.deleteBatchSubmit = deleteBatchSubmit;
    xTool.check1BatchSubmit = check1BatchSubmit;
    xTool.check2BatchSubmit = check2BatchSubmit;
    xTool.cancelCheck1BatchSubmit = cancelCheck1BatchSubmit;
    xTool.returnSearch = returnSearch;

    xTool.openModifyInfoWin = openModifyInfoWin;

    xTool.selectRow = selectRow;
    xTool.checkRow = checkRow;
    xTool.move = move;

    //树
    xTool.genEasyuiTreeData = genEasyuiTreeData;
    xTool.viewNode = viewNode;
    xTool.editNode = editNode;
    xTool.deleteNodeSubmit = deleteNodeSubmit;

    //日期联动
    xTool.showNextDate = showNextDate;

    //格式化
    xTool.formatField = formatField;
    xTool.formatInuse = formatInuse;
    xTool.formatOperIn = formatOperIn;
    xTool.formatProcSt = formatProcSt;
    xTool.formatSynSt = formatSynSt;

    //提示
    xTool.showError = showError;
    xTool.showInfo = showInfo;
    xTool.showConfirm = showConfirm;

    xTool.parseQueryString = parseQueryString;
    xTool.displayType = displayType;
    xTool.inObjectArray = inObjectArray;
    xTool.serializeForm = serializeForm;
    xTool.openWin = openWin;
    
    xTool.submitForm = submitForm;

})(xTool);

$.ajaxSetup({
    complete: function (jqXHR, status) {
        if (jqXHR.status == 200) {
            var data = $.parseJSON(jqXHR.responseText || '{}');
            if (data.code == -11) {
                window.top.location.href = '/';
            } else if (data.code != 0) {
                if (data.msg != undefined) {
                    xTool.showError(data.msg);
                }
            }
        }
    }
});

//扩展tree
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
    	remote: {
                validator: function(value, param) {
                	var res = false;
                    var sendData = {};
                    
                    $.extend(sendData, $(this).validatebox('options').queryParams);
                    sendData[param[1]] = value;
                    
                    xTool.send(param[0], sendData, function(data){
                    	if(data.code == 0) {
                    		if(data.data.total <= 0) {
                    			res = true;
                    		}
                    	}
                    }, false);
                    
                    return res;
                },
                message: '{2}'
        },
    	equals: {
	        validator: function(value,param){    
	            return value == $(param[0]).val();    
	        },    
	        message: '两次输入内容不一致'   
	    },
    	combobox: {
            validator: function (value, param) {
            	var t = $(this).closest('.combo').prev();
            	var opts = t.combobox('options');
            	var rows = t.combobox('getData');
            	var i;
            	value = t.combobox('getValue');
            	for(i = 0; i < rows.length; i++) {
            		if(rows[i][opts.valueField] == value) {
            			return true;
            		}
            	}
                return false;
            },
            message: '输入内容必须是选择项'
        },
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
        digit: {
            validator: function (value, param) {
                var re = /^[0-9]+$/;
                return re.test(value);
            },
            message: '输入内容必须是数字'
        },
        mobile: {
            validator: function (value, param) {
            	//var re = /^(13|15|17|18)\d{9}$/;
            	var re = /^\d{11}$/;
                return re.test(value);
            },
            message: '输入内容必须是有效的手机号码'
        },
        phone: {
            validator: function (value, param) {
                var re = /^(([0+]\d{2,3}-)?(0\d{2,3})-)?(\d{7,8})(-(\d{3,}))?$/;
                return re.test(value);
            },
            message: '输入内容必须是有效的电话:010-88888888'
        },
        certId: {
            validator: function (value, param) {
                var re = /^[0-9X]+$/;
                return re.test(value);
            },
            message: '输入内容必须是数字或X'
        },
        password: {
            validator: function (value, param) {
                var reNum = /[0-9]+/;
                var reLower = /[a-z]+/;
                var reUpper = /[A-Z]+/;
                return reNum.test(value) && reLower.test(value) && reUpper.test(value);
            },
            message: '输入内容必须包含数字、大小写字母'
        }
    });

    //修改默认值
    $.fn.validatebox.defaults.novalidate = true;
}

if ($.fn.combobox) {
    $.fn.combobox.defaults.novalidate = true;
    $.fn.combobox.defaults.loader = function(param, success, error){
		var opts = $(this).combobox('options');
		if (!opts.url) return false;
		$.ajax({
			type: opts.method,
			url: opts.url,
			contentType: 'application/json',     
			data: $.toJSON(param),
			dataType: 'json',
			success: function(data){
				if(data.code == 0) {
					success(data.rows);
				}
			},
			error: function(){
				error.apply(this, arguments);
			}
		});
	}
	$.fn.combobox.defaults.filter = function(q, row){
			var opts = $(this).combobox('options');
			return row[opts.textField].toLowerCase().indexOf(q.toLowerCase()) >= 0;
	}
}

if ($.fn.datebox) {
    $.fn.datebox.defaults.novalidate = true;
}

if ($.fn.datetimebox) {
    $.fn.datetimebox.defaults.novalidate = true;
}

if ($.fn.datagrid) {
    $.fn.datagrid.defaults.singleSelect = true;
    $.fn.datagrid.defaults.checkOnSelect = false;
    $.fn.datagrid.defaults.selectOnCheck = false;
    $.fn.datagrid.defaults.pageList = [10, 20, 50, 100, 200];

    var myGridDefaults = {
        rownumbers: true,
        pagination: true,
        toolbar: '#search-dg-tb',
        idField: 'rec_id',
        //onClickRow: xTool.clickRow,
        onSelect: xTool.selectRow,
        onCheck: xTool.checkRow,
        onUncheck: xTool.checkRow,
        onCheckAll: xTool.checkRow,
        onUncheckAll: xTool.checkRow,
        onBeforeLoad: function () {
			$(this).datagrid('clearChecked'); //bug on chrome
        },
        onLoadSuccess: function (data) {
            //if (data.code != undefined && data.code != 0) {
            //    xTool.showError(data.msg);
            //}
        }
    };
}

$(function () {
	if($('body').hasClass('search-body')) {
    	$('.detail-div').hide();
	}
    /*
        //页面元素权限控制
        var elementMap = {}, actions = [];
        $('.action').hide().each(function(i, element) {
            var options = $.parser.parseOptions(element);
            if (options.url) {
                elementMap[options.url] = elementMap[options.url] || [];
                elementMap[options.url].push(element);
            } else {
                alert($(element).html());
            }
        });

        for (var action in elementMap) {
            actions.push(action);
        }

        if (actions.length > 0) {
            xTool.send('/action/user/exist-fun', {
                url: actions
            }, function(data, textStatus, jqXHR) {
                if (data.code == 0) {
                    var rows = data.rows;
                    var i, j, element;
                    for (i = 0; i < rows.length; i++) {
                        element = elementMap[rows[i].url];
                        for (j = 0; j < element.length; j++) {
                            $(element[j]).show();
                        }
                    }
                }
            });
        }
    */
});
