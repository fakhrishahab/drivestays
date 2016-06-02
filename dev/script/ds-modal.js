
var DS_MODAL = {
	open: function(option){
		var modalTemplate = '';

		switch(option.status){
			case 'confirm-success':
				modalTemplate = `
					<div class="modal modal-container" id="modal-upload">
						<div class="ds-close modal-close"></div>
						<div class="modal-table">
							<div class="modal-cell">
								<div class="modal-content-container small">
									<!--<div class="ds-close modal-close"></div>-->
									<div class="modal-content content">
										
										<div class="modal-confirm">
											<div class="confirm-icon">
												<img src="`+ option.image +`"/>
											</div>

											<div class="confirm-desc">
												`+ option.message +`
											</div>
										</div>



									</div>
								</div>
							</div>	
						</div>
					</div>
				`;
				break;
		}

		$('body').append(modalTemplate);

		$('.modal-close').on('click', function(){
			DS_MODAL.close($(this))
		})

		if(option.redirect){
			setTimeout( function(){
				window.location.href= option.redirect.dest
			}, option.redirect.timeout)
		}

	},
	close: function(elm){
		elm.parents('.modal').remove();
	}
};
