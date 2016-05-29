var _cookies = {
	put : function(name, value, exdays){
		var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = name + '=' + value + ';' + expires;
	},
	get : function(name){
		var name = name + "=";
	    var ca = document.cookie.split(';');
	    for(var i=0; i<ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0)==' ') c = c.substring(1);
	        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
	    }
	    return "";
	},
	putObject : function(name, value, exdays){
		var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+d.toUTCString();
	    document.cookie = name + '=' + JSON.stringify(value) + ';'+expires
	},
	getObject : function(name){
		var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
		// console.log(result)
		result && (result = JSON.parse(result[1]));
		return result;
	},
	delete : function(name) {
	    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}
}

var _localStorage = {
	put : function(name, item){
		localStorage.setItem(name, JSON.stringify(item))
	},
	get : function(name){
		return JSON.parse(localStorage.getItem(name))
	},
	delete: function(name){
		localStorage.removeItem(name)
	}
}