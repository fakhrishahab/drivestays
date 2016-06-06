
var DS_MODAL = {
	open: function(option, fn){
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
			case 'confirm-delete':
				modalTemplate = `
					<div class="modal modal-container" id="modal-upload">
						<!--<div class="ds-close modal-close"></div>-->
						<div class="modal-table">
							<div class="modal-cell">
								<div class="modal-content-container small">
									<div class="ds-close modal-close"></div>
									<div class="modal-content content">
										
										<div class="modal-confirm">
											<div class="confirm-icon">
												<img src="`+ option.image +`"/>
											</div>

											<div class="confirm-desc">
												`+ option.message +`
											</div>

											<div class="ds-row push-top">
												<div class="col-6">
													<button class="btn-find" id="btn-confirm-ok">OK</button>
												</div>
												<div class="col-6">
													<button class="btn-find btn-orange" id="btn-confirm-cancel">Cancel</button>
												</div>
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

		$('body').append(modalTemplate)

		$('.modal-close').on('click', function(){
			DS_MODAL.close($(this))
		})

		if (option.redirect) {
		    setTimeout(function () {
		        window.location.href = option.redirect.dest
		    }, option.redirect.timeout)
		}

		if (option.close) {
		    setTimeout(function () {
		        DS_MODAL.close()
		    }, option.close.timeout)
		}

		$('#btn-confirm-cancel').on('click', function(){
			DS_MODAL.close()
		})

		$('#btn-confirm-ok').on('click', function(){
			fn(true);
		})
	},
	close: function (elm) {
	    if (elm) {
	        elm.parents('.modal').remove();
	    } else {
	        $('.modal-container').remove();
	    }
	},
	callback: function(){
		return true;
	}
};
