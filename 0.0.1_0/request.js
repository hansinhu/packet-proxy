var groups = [];
var cookies = [];
var useCount = 0;
var lastRequestId;

if (localStorage['groups']) {
	groups = JSON.parse(localStorage['groups']);
}

if (localStorage['useCount']) {
	useCount = localStorage['useCount'];
}

if (localStorage['cookies']) {
	cookies = JSON.parse(localStorage['cookies']);
}

chrome.webRequest.onBeforeRequest.addListener(function(details) {
	return redirectToMatchingRule(details);
}, {
	urls : ["<all_urls>"]
}, ["blocking"]);

chrome.runtime.onMessage.addListener(function (request, sender) {
	// writeCookies(sender);
	for (var i = 0; i < cookies.length; i++) {
		if (cookies[i].isActive) {
			var curtUrl = cookies[i].to;

			curtUrl = curtUrl.replace(/^(?:https?:\/\/)?/i, '').split('/')[0];

			var curtUrlRegex = new RegExp('^https?:\/\/' + curtUrl + '\/');
			var curtDomain = cookies[i].from;
			var url = sender && sender.tab && sender.tab.url ? sender.tab.url : null;
			
			// 只匹配当前符合规则的请求url
			if (!!url && curtUrlRegex.test(url)) {
				chrome.cookies.getAll({
					url: curtDomain // todo domian为啥匹配不到？ 版本更新导致的？？
				}, function (cookieL) {
					for (var x = 0; x < cookieL.length; x++) {
						var { name, value } = cookieL[x];

						chrome.cookies.set({
							url: sender.tab.url,
							name: name,
							value: value,
							path: '/'
						}, cookie => {})
					}
				})
			}
		}
	}
});

// 重定向
function redirectToMatchingRule(details) {
	var onUseGroups = groups.filter(item => item.isActive);
	var flatternArr = [];
	onUseGroups.forEach((item) => {
		if (item.isActive && item.rules && item.rules.length) {
			item.rules.forEach((x) => {
				flatternArr.push(x);
			});
		}
	});
	for (var i = 0; i < flatternArr.length; i++) {
		var rule = flatternArr[i];
		if (rule.isActive && details.url.indexOf(rule.from) > -1 && details.requestId !== lastRequestId ) {
			lastRequestId = details.requestId;
			updateLocalStorage('useCount', ++useCount);
			return {
				redirectUrl : details.url.replace(rule.from, rule.to)
			};
		}
	}
}

// 获取cookie，并写入
function writeCookies(sender) {
	for (var i = 0; i < cookies.length; i++) {
		if (cookies[i].isActive) {
			
			var curtUrl = cookies[i].to;

			curtUrl = curtUrl.replace(/^(?:https?:\/\/)?/i, '').split('/')[0];

			var curtUrlRegex = new RegExp('^https?:\/\/' + curtUrl + '\/');
			var curtDomain = cookies[i].from;
			var url = sender && sender.tab && sender.tab.url ? sender.tab.url : null;
			
			// 只匹配当前符合规则的请求url
			if (!!url && curtUrlRegex.test(url)) {
				chrome.cookies.getAll({
					domain: curtDomain
				}, function (cookieL) {
					for (var x = 0; x < cookieL.length; x++) {
						var { name, value } = cookieL[x];

						chrome.cookies.set({
							url: sender.tab.url,
							name: name,
							value: value,
							path: '/'
						}, cookie => {})
					}
				})
			}
		}
	}
}


chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.type == 'getUseCount') {
		sendResponse({
			useCount: this.useCount,
			isSuccess: true
		});
	} else if (request.type == 'getGroups') {
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'getCookies') {
		sendResponse({
			cookies: this.cookies,
			isSuccess: true
		});
	} else if (request.type == 'addRule') {
		groups[request.activeIndex].rules.push(request.rule);
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'editRule') {
		groups[request.activeIndex].rules[request.dataIndex].from = request.rule.from;
		groups[request.activeIndex].rules[request.dataIndex].to = request.rule.to;
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'deleteRule') {
		groups[request.activeIndex].rules.splice(request.dataIndex, 1);
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'triggerRuleStatus') {
		groups[request.activeIndex].rules[request.dataIndex].isActive = request.isActive;
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'editGruopJSON') {
		groups[request.dataIndex] = request.data;
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'addGroup') {
		var dataIndex = groups.length;
		groups.push({
			groupName: request.groupName,
			rules:[],
			isActive: false
		});
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			dataIndex,
			isSuccess: true
		});
	} else if (request.type == 'editGroup') {
		groups[request.dataIndex].groupName = request.groupName;
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'importGroup') {
		var dataIndex = groups.length;
		if (Object.prototype.toString.call(request.data) === '[object Object]') {
			groups.push(request.data);
		} else if (Object.prototype.toString.call(request.data) === '[object Array]') {
			groups = groups.concat(request.data);
		}
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			dataIndex,
			isSuccess: true
		});
	} else if (request.type == 'deleteGroup') {
		groups.splice(request.dataIndex, 1);
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	} else if (request.type == 'triggerGroupStatus') {
		groups[request.dataIndex].isActive = request.isActive;
		updateLocalStorage('groups', groups);
		sendResponse({
			groups: this.groups,
			isSuccess: true
		});
	}  else if (request.type == 'addCookieRule') {
		cookies.push(request.rule);
		updateLocalStorage('cookies', cookies);
		sendResponse({
			cookies: this.cookies,
			isSuccess: true
		});
	} else if (request.type == 'editCookieRule') {
		cookies[request.dataIndex].from = request.rule.from;
		cookies[request.dataIndex].to = request.rule.to;
		updateLocalStorage('cookies', cookies);
		sendResponse({
			cookies: this.cookies,
			isSuccess: true
		});
	} else if (request.type == 'deleteCookieRule') {
		cookies.splice(request.dataIndex, 1);
		updateLocalStorage('cookies', cookies);
		sendResponse({
			cookies: this.cookies,
			isSuccess: true
		});
	} else if (request.type == 'triggerCookieRuleStatus') {
		cookies[request.dataIndex].isActive = request.isActive;
		updateLocalStorage('cookies', cookies);
		sendResponse({
			cookies: this.cookies,
			isSuccess: true
		});
	} else if (request.type == 'editCookieJSON') {
		cookies = request.data;
		updateLocalStorage('cookies', cookies);
		sendResponse({
			cookies: this.cookies,
			isSuccess: true
		});
	} else if (request.type == 'importCookie') {
		var dataIndex = cookies.length;
		if (Object.prototype.toString.call(request.data) === '[object Object]') {
			cookies.push(request.data);
		} else if (Object.prototype.toString.call(request.data) === '[object Array]') {
			cookies = cookies.concat(request.data);
		}
		updateLocalStorage('cookies', cookies);
		sendResponse({
			cookies: this.cookies,
			dataIndex,
			isSuccess: true
		});
	} 
});

function updateLocalStorage(key, value){
	localStorage[key] = JSON.stringify(value);
}
