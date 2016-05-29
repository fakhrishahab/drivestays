var callbacks = $.Callbacks();
var message = {
	'required' : 'This field is required',
	'max' : 'Max character ',
	'min' : 'Min character '
};

var clearError = function(id){
	$('#'+id).parents('.input-el').removeClass('error');
};

var showError = function(id){	
	$('#'+id).parents('.input-el').addClass('error')	
	throw new Error("Something went badly wrong!");
	return false;
};

var required,max, min

;(function($){

	required = function(rule, id, value){	
		if(value == ''){
			$('<div/>',{
				text : message.required,
				'class' : 'error-label'
			}).prependTo($('#'+id).parent())

			showError(id)
		}else{
			clearError(id)	
		}	
	};

	max = function(rule, id, value){
		if(value.length > rule){
			$('<div/>',{
				text : message.max+' '+rule,
				'class' : 'error-label'
			}).prependTo($('#'+id).parent())

			showError(id)
		}else{
			clearError(id)
		}
	};

	min = function(rule, id, value){
		if(value.length < rule){
			$('<div/>',{
				text : message.min+' '+rule,
				'class' : 'error-label'
			}).prependTo($('#'+id).parent())

			showError(id)
		}else{
			clearError(id)
		}
	};

	$.fn.validation = function(target){				
		$('#'+target).filter(function(){						
			var field = $(this).find('input[data-validate]')
			for(var i=0; i < field.length; i++){
				$(field[i]).pattern()
			}
		})

	};

	$.fn.pattern = function(elm){
		var criteria = this.data('validate').split(',');		
		for(var i = 0; i < criteria.length; i++){
			this.do_validation(criteria[i], this)
		}
	};	

	$.fn.do_validation = function(criteria){
		$('.error-label').remove()
		var regex = /\(([^)]+)\)/;
		var param = criteria.match(regex);

		if(param){
			var new_function = criteria.substr(0, criteria.length - 1)+',"'+this.attr('id')+'","'+this.val()+'","callback"'+criteria.substr(-1)	
		}else{
			new_function = criteria.substr(0)+'( "null" ,"'+this.attr('id')+'","'+this.val()+'","callback")'
		}
		
		var func = new Function(new_function);
		func()
	};

	

}(jQuery));