
var DS_MODAL = {
	open: function(option, fn){
		var modalTemplate = '';

		switch(option.status){
			case 'preload-full':
				modalTemplate = `
					<div class="modal modal-container modal-white body-content">

					</div>
				`;
				break;
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
			case 'contact-host' :
				modalTemplate = `
					<div class="modal modal-container" id="modal-upload">
						<!--<div class="ds-close modal-close"></div>-->
						<div class="modal-table">
							<div class="modal-cell">
								<div class="modal-content-container medium">
									<div class="ds-close modal-close"></div>
									<div class="modal-content">
										<h2>Contact Host</h2>

										<div class="ds-row push-top">
											<div class="col-4">

											</div>
										</div>

										<div class="ds-row">
											<div class="col-4 modal-content__image-container">
												<div class="modal-content__image-circle" style="background-image:url('./assets/images/users.jpg')">
												</div>
												<div class="modal-content__image-name">John Doe</div>
											</div>

											<div class="col-8">
												<div>When are you camping?</div>
												<div class="ds-row push-top">
													<div class="col-md-12 col-6">
								                        <div class="input-el outline">
								                            <span class="ds-calendar"></span>
								                            <input type="text" placeholder="Arrival" tabindex="4" class="datepicker-from" id="modal-arrival-input" data-validate="required" data-date-type="start">
								                            <div class="float-calendar"></div>
								                        </div>
								                    </div>
								                    <div class="col-md-12 col-6">
								                        <div class="input-el outline">
								                            <span class="ds-calendar"></span>
								                            <input type="text" placeholder="Arrival" tabindex="4" class="datepicker-from" id="modal-departure-input" data-validate="required" data-date-type="start">
								                            <div class="float-calendar"></div>
								                        </div>
								                    </div>
												</div>

												<div class="ds-row push-top">
													<div class="col-12">
														<div class="input-el outline">
															<textarea rows="7" placeholder="Start Type Your Message"></textarea>
														</div>
													</div>
												</div>

												<div class="ds-row push-top">
													<div class="col-12">
														<button class="btn-find" id="btn-confirm-ok">Send Message</button>
													</div>
												</div>
											</div>
										</div>

										

										
										<!--<div class="modal-confirm">
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
										</div>-->

									</div>
								</div>
							</div>	
						</div>
					</div>
				`;
				break
		}

		var template = $(modalTemplate).hide().fadeIn(100);
		$('body').append(template)

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
	        elm.parents('.modal').fadeOut('100', function() {
	        	elm.parents('.modal').remove();
	        });
	    } else {
	        $('.modal-container').fadeOut('100', function() {
	        	$('.modal-container').remove();
	        });
	    }
	},
	callback: function(){
		return true;
	}
};
