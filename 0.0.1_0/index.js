var groups = [];
var cookies = [];
var activeIndex = -1;

// 获取语录
function getHitokoto(cb) {
	// 请求语录
	$.ajax({
		url: 'https://api.tryto.cn/saylove/text',
		success: function(res){
			cb(res.data.content)
		}
	});
}

// 渲染左侧列表
function renderGroup() {
	var leftUlDOM = $('#group-list');
	leftUlDOM.html('');
	groups.forEach(function(item, index) {
		var htmlStr = '';
		htmlStr += '<li data-index="' + index + '" data-checked="' + item.isActive + '" class="' + (activeIndex == index ? 'active' : '') + '">';
		htmlStr += '<span class="label ellispis" title="' + item.groupName + '">' + item.groupName + '</span>';
		htmlStr += '<span class="list-operator">';
		htmlStr += '<span data-index="' + index + '" class="list-edit" style="display: none">编辑</span>';
		htmlStr += '<span data-index="' + index + '" class="list-delete" style="display: none">删除</span>';
		htmlStr += '</span><div class="switch">';
		htmlStr += '<input id="switch' + index + '" data-index="' + index + '" class="input" type="checkbox">';
		htmlStr += '<label for="switch' + index + '" class="slider"></label>';
		htmlStr += '</div></li>';
		leftUlDOM.append(htmlStr);
	});
	leftUlDOM.find('li').each(function() {
		if ($(this).attr('data-checked') == 'true') {
			$(this).find('input').prop('checked', true);
		} else {
			$(this).find('input').prop('checked', false);
		}
	})
}

// 渲染表格
function renderTable(dataIndex) {
	if (dataIndex < 0) {
		triggerWelcome();
		return;
	}
	var detailListDOM = $('.right-table #detail-tbody');
	var tableData = groups[Number(dataIndex)].rules;
	var groupName = groups[Number(dataIndex)].groupName;
	var htmlStr = '';
	detailListDOM.html('');
	if (tableData && tableData.length) {
		tableData.forEach(function(item, index) {
			htmlStr += '<tr data-checked="' + item.isActive + '">';
			htmlStr += '<td><div style="width: 10px;padding-left: 10px"><input data-index="' + index + '" type="checkbox" /></div></td>';
			htmlStr += '<td><div style="width: 170px" class="ellispis" title="' + item.from + '">' + item.from + '</div></td>';
			htmlStr += '<td><div style="width: 170px" class="ellispis" title="' + item.to + '">' + item.to + '</div></td>';
			htmlStr += '<td>';
			htmlStr += '<a data-index="' + index + '" class="table-operator-edit">编辑</a>';
			htmlStr += '<span class="table-operator-separator">|</span>';
			htmlStr += '<a data-index="' + index + '" class="table-operator-delete">删除</a>';
			htmlStr += '</td></tr>';
		});
	} else {
		htmlStr += '<tr><td colspan="3" style="text-align: center">暂无数据</td></tr>'
	}
	detailListDOM.append(htmlStr);
	$('#title-name').html(groupName);
	$('#title-name').attr('title', groupName);
	$('#hitokoto').html('');
	getHitokoto(function(data) {
		$('#hitokoto').html(data);
		$('#hitokoto').attr('title', data);
	})
	detailListDOM.find('tr').each(function() {
		if ($(this).attr('data-checked') == 'true') {
			$(this).find('input').prop('checked', true);
		} else {
			$(this).find('input').prop('checked', false);
		}
	})
}

function renderCookieTable() {
	var detailListDOM = $('.cookie-table #detail-tbody');
	var tableData = cookies;
	var htmlStr = '';
	detailListDOM.html('');
	if (tableData && tableData.length) {
		tableData.forEach(function(item, index) {
			htmlStr += '<tr data-checked="' + item.isActive + '">';
			htmlStr += '<td><div style="width: 10px;padding-left: 10px"><input data-index="' + index + '" type="checkbox" /></div></td>';
			htmlStr += '<td><div style="width: 170px" class="ellispis" title="' + item.from + '">' + item.from + '</div></td>';
			htmlStr += '<td><div style="width: 170px" class="ellispis" title="' + item.to + '">' + item.to + '</div></td>';
			htmlStr += '<td>';
			htmlStr += '<a data-index="' + index + '" class="table-operator-edit">编辑</a>';
			htmlStr += '<span class="table-operator-separator">|</span>';
			htmlStr += '<a data-index="' + index + '" class="table-operator-delete">删除</a>';
			htmlStr += '</td></tr>';
		});
	} else {
		htmlStr += '<tr><td colspan="3" style="text-align: center">暂无数据</td></tr>'
	}
	detailListDOM.append(htmlStr);
	detailListDOM.find('tr').each(function() {
		if ($(this).attr('data-checked') == 'true') {
			$(this).find('input').prop('checked', true);
		} else {
			$(this).find('input').prop('checked', false);
		}
	})
}

// 新增规则
function addRuleTest(from, to) {
	chrome.extension.sendMessage({
		type : 'addRule',
		rule: { from, to },
		activeIndex
	}, function(response) {
		if (response.isSuccess) {
			if (!groups[activeIndex].rules) {
				groups[activeIndex].rules = [];
			}
			// groups[activeIndex].rules.push({ from, to });
			groups = response.groups;
			renderTable(activeIndex);
		}
	});
}

// 新增规则
function addCookieTest(from, to) {
	chrome.extension.sendMessage({
		type : 'addCookieRule',
		rule: { from, to }
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});
}

// 编辑规则
function editRuleTest(from, to, dataIndex) {
	chrome.extension.sendMessage({
		type : 'editRule',
		rule: { from, to },
		dataIndex,
		activeIndex
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			renderTable(activeIndex);
		}
	});
}

// 编辑规则
function editCookieRuleTest(from, to, dataIndex) {
	chrome.extension.sendMessage({
		type : 'editCookieRule',
		rule: { from, to },
		dataIndex,
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});
}

// 删除规则
function removeRuleTest(dataIndex) {
	chrome.extension.sendMessage({
		type : 'deleteRule',
		dataIndex,
		activeIndex
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			renderTable(activeIndex);
		}
	});
}

// 删除规则
function removeCookieRuleTest(dataIndex) {
	chrome.extension.sendMessage({
		type : 'deleteCookieRule',
		dataIndex
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});
}

// 切换规则状态
function triggerRuleStatus(isActive, dataIndex) {
	chrome.extension.sendMessage({
		type : 'triggerRuleStatus',
		dataIndex,
		activeIndex,
		isActive
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			renderTable(activeIndex);
		}
	});
}

// 切换规则状态
function triggerCookieRuleStatus(isActive, dataIndex) {
	chrome.extension.sendMessage({
		type : 'triggerCookieRuleStatus',
		dataIndex,
		isActive
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});
}

// 编辑列表JSON
function editGruopJSONTest(data, dataIndex) {
	chrome.extension.sendMessage({
		type : 'editGruopJSON',
		dataIndex,
		data
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			renderTable(activeIndex);
		}
	});
}

// 编辑列表JSON
function editCookieJSONTest(data) {
	chrome.extension.sendMessage({
		type : 'editCookieJSON',
		data
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});
}

// 导入列表项
function importCookieTest(data) {
	chrome.extension.sendMessage({
		type : 'importCookie',
		data
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});
}

// 新增列表项
function addGruopTest(groupName) {
	chrome.extension.sendMessage({
		type : 'addGroup',
		groupName,
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			activeIndex = response.dataIndex;
			renderGroup();
			renderTable(activeIndex);
		}
	});
}

// 导入列表项
function importGruopTest(data) {
	chrome.extension.sendMessage({
		type : 'importGroup',
		data
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			activeIndex = response.dataIndex;
			renderGroup();
			renderTable(response.dataIndex);
		}
	});
}

// 删除列表项
function removeGroupTest(dataIndex) {
	chrome.extension.sendMessage({
		type : 'deleteGroup',
		dataIndex
	}, function(response) {
		if (response.isSuccess) {
			if (activeIndex == dataIndex) {
				activeIndex = -1;
			}
			groups = response.groups;
			renderGroup();
			renderTable(activeIndex);
		}
	});
}

// 编辑列表项
function editGruopTest(dataIndex, groupName) {
	chrome.extension.sendMessage({
		type : 'editGroup',
		groupName,
		dataIndex
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			renderGroup();
		}
	});
}

// 切换列表某一项的状态
function triggerGroupStatus(isActive, dataIndex) {
	chrome.extension.sendMessage({
		type : 'triggerGroupStatus',
		dataIndex,
		isActive
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			renderGroup();
		}
	});
}

// 切换至欢迎页面
function triggerWelcome() {
	$('.person-number').html('');
	getHitokoto(function(data) {
		$('.person-number').html(data);
	});

	// 获取重定向次数
	chrome.extension.sendMessage({
		type : 'getUseCount'
	}, function(response) {
		if (response.isSuccess) {
			$('.user-count').html(response.useCount);
		}
	});
	$('#detail-list').hide();
	$('#welcome').show();
}

$(document).ready(function() {
	
	// 获取所有的规则
	chrome.extension.sendMessage({
		type : 'getGroups'
	}, function(response) {
		if (response.isSuccess) {
			groups = response.groups;
			if (groups.length) {
				activeIndex = 0;
				renderGroup();
				renderTable(activeIndex);
			} else {
				triggerWelcome();
			}
		}
	});
	chrome.extension.sendMessage({
		type : 'getCookies'
	}, function(response) {
		if (response.isSuccess) {
			cookies = response.cookies;
			renderCookieTable();
		}
	});


	$('body').on('click', '.tab span', function() {
		if (this.className === 'active') {
			return;
		}
		if (this.id === 'source-proxy') {
			$('.cookie-proxy-box').hide();
			$('#cookie-proxy').removeClass();
		} else {
			$('.source-proxy-box').hide();
			$('#source-proxy').removeClass();
		}
		$(`.${this.id}-box`).show();
		$(this).addClass('active');
	});

	// 监听form校验事件
	$('body').on('input', '.form-item input', function() {
		$(this).closest('.form-item').next('.form-item-err').remove();
		$(this).css('border-color', '#bcc3cd');
		if (!$(this).val()) {
			$(this).css('border-color', 'red');
			$(this).closest('.form-item').after('<div class="form-item-err">该项为必填项！</div>');
		}
	}).on('input', '.form-item textarea', function() {
		$(this).closest('.form-item').next('.form-item-err').remove();
		$(this).css('border-color', '#bcc3cd');
	});

	// 点击新增按钮
	$('.source-proxy-box #operator-new').on('click', function() {
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'新增规则',
			children:'<div class="form-item"><label>源地址</label><input id="new-prev" placeholder="请输入地址" class="kuma-input"></div><div class="form-item"><label>代理地址</label><input id="new-next" placeholder="请输入地址" class="kuma-input"></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var from = $('#new-prev').val().trim();
				var to = $('#new-next').val().trim();
				if (!from || !to) {
					$('.dialog-new').find('.form-item').each(function(index, item) {
						if (!$(item).find('input').val() && $(item).next('.form-item-err').length < 1) {
							$(item).find('input').css('border-color', 'red');
							$(item).after('<div class="form-item-err">该项为必填项！</div>');
						}
					});
					return false;
				} else {
					addRuleTest(from, to);
					return true;
				}
			} else {
				return true;
			}
		});
	});

	// 点击新增按钮
	$('.cookie-proxy-box #operator-new').on('click', function() {
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'新增规则',
			children:'<div class="form-item"><label>源地址</label><input id="new-prev" placeholder="请输入地址" class="kuma-input"></div><div class="form-item"><label>代理地址</label><input id="new-next" placeholder="请输入地址" class="kuma-input"></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var from = $('#new-prev').val().trim();
				var to = $('#new-next').val().trim();
				if (!from || !to) {
					$('.dialog-new').find('.form-item').each(function(index, item) {
						if (!$(item).find('input').val() && $(item).next('.form-item-err').length < 1) {
							$(item).find('input').css('border-color', 'red');
							$(item).after('<div class="form-item-err">该项为必填项！</div>');
						}
					});
					return false;
				} else {
					addCookieTest(from, to);
					return true;
				}
			} else {
				return true;
			}
		});
	});

	// 点击编辑JSON按钮
	$('.source-proxy-box #operator-edit-json').on('click', function() {
		const exportData = JSON.stringify(groups[activeIndex], null , 2);
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'编辑JSON',
			children:'<div class="form-item"><label>JSON</label><textarea id="textarea-edit-json" class="kuma-textarea">' + exportData + '</textarea></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var jsonText = $('#textarea-edit-json').val();
				var json = {};
				try {
					json = JSON.parse(jsonText);
				} catch(err) {
					$('.dialog-new').find('#textarea-edit-json').css('border-color', 'red')
						.closest('.form-item').after('<div class="form-item-err">请输入正确的JSON字符串！</div>');
					return false;
				}
				if (Object.prototype.toString.call(json) == '[object Object]') {
					editGruopJSONTest(json, activeIndex);
					return true;
				}
				if (Object.prototype.toString.call(json) == '[object Array]') {
					for (var i = 0; i < json.length; i ++) {
						if (Object.prototype.toString.call(json[i]) != '[object Object]') {
							$('.dialog-new').find('#textarea-edit-json').css('border-color', 'red')
								.closest('.form-item').after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
							return false;
						}
					}
					editGruopJSONTest(json, activeIndex);
					return true;
				}
				$('.dialog-new').find('#textarea-import').css('border-color', 'red')
					.closest('.form-item').after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
				return false;
			} else {
				return true;
			}
		});
		$('#textarea-import').focus();
	});

	// 点击编辑JSON按钮
	$('.cookie-proxy-box #operator-edit-json').on('click', function() {
		const exportData = JSON.stringify(cookies, null , 2);
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'编辑JSON',
			children:'<div class="form-item"><label>JSON</label><textarea id="textarea-edit-json" class="kuma-textarea">' + exportData + '</textarea></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var jsonText = $('#textarea-edit-json').val();
				var json = {};
				try {
					json = JSON.parse(jsonText);
				} catch(err) {
					$('.dialog-new').find('#textarea-edit-json').css('border-color', 'red')
						.closest('.form-item').after('<div class="form-item-err">请输入正确的JSON字符串！</div>');
					return false;
				}
				if (Object.prototype.toString.call(json) == '[object Object]') {
					editCookieJSONTest(json);
					return true;
				}
				if (Object.prototype.toString.call(json) == '[object Array]') {
					for (var i = 0; i < json.length; i ++) {
						if (Object.prototype.toString.call(json[i]) != '[object Object]') {
							$('.dialog-new').find('#textarea-edit-json').css('border-color', 'red')
								.closest('.form-item').after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
							return false;
						}
					}
					editCookieJSONTest(json);
					return true;
				}
				$('.dialog-new').find('#textarea-import').css('border-color', 'red')
					.closest('.form-item').after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
				return false;
			} else {
				return true;
			}
		});
		$('#textarea-import').focus();
	});

	// 点击导入JSON按钮
	$('.cookie-proxy-box #operator-import').on('click', function() {
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'导入JSON',
			children:'<div class="form-item"><label>JSON</label><textarea id="textarea-import" class="kuma-textarea"></textarea></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				// 需要进行一系列的校验
				var jsonText = $('#textarea-import').val();
				var json = {};
				try {
					json = JSON.parse(jsonText);
				} catch(err) {
					$('.dialog-new').find('#textarea-import').css('border-color', 'red')
						.after('<div class="form-item-err">请输入正确的JSON字符串！</div>');
					return false;
				}
				if (Object.prototype.toString.call(json) == '[object Object]') {
					importCookieTest(json);
					return true;
				}
				if (Object.prototype.toString.call(json) == '[object Array]') {
					for (var i = 0; i < json.length; i ++) {
						if (Object.prototype.toString.call(json[i]) != '[object Object]') {
							$('.dialog-new').find('#textarea-import').css('border-color', 'red')
								.after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
							return false;
						}
					}
					importCookieTest(json);
					return true;
				}
				$('.dialog-new').find('#textarea-import').css('border-color', 'red')
						.after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
				return false;
			} else {
				return true;
			}
		});
		$('#textarea-import').focus();
	});

	// 点击导出按钮
	$('.source-proxy-box #operator-export').on('click', function() {
		const exportData = JSON.stringify(groups[activeIndex], null , 2);
		$('body').dialog({
			className: 'dialog-export',
			type:'success',
			title:'导出JSON',
			children:'<div class="form-item"><label>JSON</label><textarea readOnly id="textarea-export" class="kuma-textarea">' + exportData + '</textarea></div>',
			width: '600px',
			buttons: [
				{						  
					name: '点击复制',
					className: 'defalut'
				}, {
					name: '关闭',
					className: 'defalut'
				}
			]
		}, function(ret) {
			if (ret.index == 0) {
				var exportTextarea = document.getElementById('textarea-export');
				exportTextarea.select();
				document.execCommand("Copy");
				return false;
			} else {
				return true;
			}
		});
		$('#textarea-export').focus();
	});

	// 点击导出按钮
	$('.cookie-proxy-box #operator-export').on('click', function() {
		const exportData = JSON.stringify(cookies, null , 2);
		$('body').dialog({
			className: 'dialog-export',
			type:'success',
			title:'导出JSON',
			children:'<div class="form-item"><label>JSON</label><textarea readOnly id="textarea-export" class="kuma-textarea">' + exportData + '</textarea></div>',
			width: '600px',
			buttons: [
				{						  
					name: '点击复制',
					className: 'defalut'
				}, {
					name: '关闭',
					className: 'defalut'
				}
			]
		}, function(ret) {
			if (ret.index == 0) {
				var exportTextarea = document.getElementById('textarea-export');
				exportTextarea.select();
				document.execCommand("Copy");
				return false;
			} else {
				return true;
			}
		});
		$('#textarea-export').focus();
	});

	// 点击表格上的删除按钮
	$('.right-table #detail-tbody').on('click', '.table-operator-delete', function() {
		var dataIndex = $(this).attr('data-index');
		$('body').dialog({
			className: 'dialog-new',
			type: 'danger',
			title: '温馨提示',
			discription: '此操作不可逆，您确认要删除吗？',
			width: '300px'
		}, function(ret) {
			if (ret.index == 0) {
				removeRuleTest(dataIndex);
				return true;
			} else {
				return true;
			}
		});
	});

	// 点击表格上的编辑按钮
	$('.right-table #detail-tbody').on('click', '.table-operator-edit', function() {
		var dataIndex = $(this).attr('data-index');
		const rule = groups[activeIndex].rules[dataIndex];
		var editDialog = $('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'新增规则',
			children:'<div class="form-item"><label>源地址</label><input id="new-prev" value="' + rule.from + '" placeholder="请输入地址" class="kuma-input"></div><div class="form-item"><label>代理地址</label><input id="new-next" value="' + rule.to + '" placeholder="请输入地址" class="kuma-input"></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var from = $('#new-prev').val().trim();
				var to = $('#new-next').val().trim();
				if (!from || !to) {
					$('.dialog-new').find('.form-item').each(function(index, item) {
						if (!$(item).find('input').val() && $(item).next('.form-item-err').length < 1) {
							$(item).find('input').css('border-color', 'red');
							$(item).after('<div class="form-item-err">该项为必填项！</div>');
						}
					});
					return false;
				} else {
					editRuleTest(from, to, dataIndex);
					return true;
				}
			} else {
				return true;
			}
		});
	});

	// 点击表格上的删除按钮
	$('.cookie-table #detail-tbody').on('click', '.table-operator-delete', function() {
		var dataIndex = $(this).attr('data-index');
		$('body').dialog({
			className: 'dialog-new',
			type: 'danger',
			title: '温馨提示',
			discription: '此操作不可逆，您确认要删除吗？',
			width: '300px'
		}, function(ret) {
			if (ret.index == 0) {
				removeCookieRuleTest(dataIndex);
				return true;
			} else {
				return true;
			}
		});
	});

	// 点击表格上的编辑按钮
	$('.cookie-table #detail-tbody').on('click', '.table-operator-edit', function() {
		var dataIndex = $(this).attr('data-index');
		const rule = cookies[dataIndex];
		var editDialog = $('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'新增规则',
			children:'<div class="form-item"><label>源地址</label><input id="new-prev" value="' + rule.from + '" placeholder="请输入地址" class="kuma-input"></div><div class="form-item"><label>代理地址</label><input id="new-next" value="' + rule.to + '" placeholder="请输入地址" class="kuma-input"></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var from = $('#new-prev').val().trim();
				var to = $('#new-next').val().trim();
				if (!from || !to) {
					$('.dialog-new').find('.form-item').each(function(index, item) {
						if (!$(item).find('input').val() && $(item).next('.form-item-err').length < 1) {
							$(item).find('input').css('border-color', 'red');
							$(item).after('<div class="form-item-err">该项为必填项！</div>');
						}
					});
					return false;
				} else {
					editCookieRuleTest(from, to, dataIndex);
					return true;
				}
			} else {
				return true;
			}
		});
	});

	// 监听表格项是否选中
	$('.right-table #detail-tbody').on('change', 'input', function() {
		var dataIndex = $(this).attr('data-index');
		var isActive = $(this).prop('checked');
		triggerRuleStatus(isActive, dataIndex);
	});

	// 监听表格项是否选中
	$('.cookie-table #detail-tbody').on('change', 'input', function() {
		var dataIndex = $(this).attr('data-index');
		var isActive = $(this).prop('checked');
		triggerCookieRuleStatus(isActive, dataIndex);
	});

	// 点击左侧列表中的某一项
	$('.left').on('click', 'li', function() {
		var dataIndex = $(this).attr('data-index');
		activeIndex = dataIndex;
		$('#group-list li').each(function(index, item) {
			$(item).attr('class', '');
		});
		$(this).attr('class', 'active');
		$('#welcome').hide();
		renderTable(dataIndex);
		$('#detail-list').show();
	});

	// 监听列表项是否选中的变化
	$('#group-list').on('change', '.switch input', function() {
		var dataIndex = $(this).attr('data-index');
		var isActive = $(this).prop('checked');
		triggerGroupStatus(isActive, dataIndex);
		return false;
	});

	// 点击新增列表项
	$('#group-new').on('click', function() {
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'新增组',
			children:'<div class="form-item"><label>组名</label><input id="group-name" placeholder="请输入组名，尽量控制在十字以内" class="kuma-input"></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var groupName = $('#group-name').val().trim();
				if (!groupName) {
					$('.dialog-new').find('.form-item').each(function(index, item) {
						if (!$(item).find('input').val() && $(item).next('.form-item-err').length < 1) {
							$(item).find('input').css('border-color', 'red');
							$(item).after('<div class="form-item-err">该项为必填项！</div>');
						}
					});
					return false;
				} else {
					addGruopTest(groupName);
					return true;
				}
			} else {
				return true;
			}
		});
	});

	// 点击导入JSON按钮
	$('#group-import').on('click', function() {
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'导入JSON',
			children:'<div class="form-item"><label>JSON</label><textarea id="textarea-import" class="kuma-textarea"></textarea></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				// 需要进行一系列的校验
				var jsonText = $('#textarea-import').val();
				var json = {};
				try {
					json = JSON.parse(jsonText);
				} catch(err) {
					$('.dialog-new').find('#textarea-import').css('border-color', 'red')
						.after('<div class="form-item-err">请输入正确的JSON字符串！</div>');
					return false;
				}
				if (Object.prototype.toString.call(json) == '[object Object]') {
					importGruopTest(json);
					return true;
				}
				if (Object.prototype.toString.call(json) == '[object Array]') {
					for (var i = 0; i < json.length; i ++) {
						if (Object.prototype.toString.call(json[i]) != '[object Object]') {
							$('.dialog-new').find('#textarea-import').css('border-color', 'red')
								.after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
							return false;
						}
					}
					importGruopTest(json);
					return true;
				}
				$('.dialog-new').find('#textarea-import').css('border-color', 'red')
						.after('<div class="form-item-err">请输入符合要求的JSON字符串！</div>');
				return false;
			} else {
				return true;
			}
		});
		$('#textarea-import').focus();
	});

	// 控制列表项的删除按钮的隐藏和显示
	$('.left').on('mouseover', 'li', function() {
		if (!$(this).attr('class')) {
			return;
		}
		$(this).find('.list-delete').show();
		$(this).find('.list-edit').show();
	});

	// 控制列表项的删除按钮的隐藏和显示
	$('.left').on('mouseout', 'li', function() {
		if (!$(this).attr('class')) {
			return;
		}
		$(this).find('.list-delete').hide();
		$(this).find('.list-edit').hide();
	});

	// 点击列表项上的删除按钮
	$('#group-list').on('click', '.list-delete', function() {
		var dataIndex = $(this).attr('data-index');
		$('body').dialog({
			className: 'dialog-new',
			type: 'danger',
			title: '温馨提示',
			discription: '此操作不可逆，您确认要删除吗？',
			width: '300px'
		}, function(ret) {
			if (ret.index == 0) {
				removeGroupTest(dataIndex);
				return true;
			} else {
				return true;
			}
		});
	});

	// 点击列表项上的删除按钮
	$('#group-list').on('click', '.list-edit', function() {
		var dataIndex = $(this).attr('data-index');
		$('body').dialog({
			className: 'dialog-new',
			type:'success',
			title:'编辑组',
			children:'<div class="form-item"><label>组名</label><input id="group-name" placeholder="请输入组名，尽量控制在十字以内" class="kuma-input"></div>',
			width: '600px'
		}, function(ret) {
			if (ret.index == 0) {
				var groupName = $('#group-name').val().trim();
				if (!groupName) {
					$('.dialog-new').find('.form-item').each(function(index, item) {
						if (!$(item).find('input').val() && $(item).next('.form-item-err').length < 1) {
							$(item).find('input').css('border-color', 'red');
							$(item).after('<div class="form-item-err">该项为必填项！</div>');
						}
					});
					return false;
				} else {
					editGruopTest(dataIndex, groupName);
					return true;
				}
			} else {
				return true;
			}
		});
		$('#group-name').val(groups[dataIndex].groupName);
	});

})