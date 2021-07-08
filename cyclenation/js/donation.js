// Post offline gift to Luminate
function donateOffline(donateOfflineCallback) {
	let params = jQuery('.donation-form').serialize();

	jQuery.ajax({
		method: "POST",
		async: false,
		cache: false,
		dataType: "json",
		url: "https://tools.heart.org/donate/convio-offline/addOfflineDonation-tr.php?" + params + "&callback=?",
		success: donateOfflineCallback
	});
}

/**
 * Get the Transaction ID and Confirmation Code for transactions added via the API
 * @param {*} responseData - From the donateOffline success callback
 */
function donateOfflineCallback(responseData) {
	const campaign_name = $('input[name=campaign_name]').length ? $('input[name=campaign_name]').val() : "CycleNation";
	const ddCompanyId = (jQuery("#double_the_donation_company_id").val() !== "") ? jQuery("#double_the_donation_company_id").val() : jQuery('input[name=doublethedonation_company_id]').val();


	const widgetData = {
		// transactionId: responseData.data.donationResponse.donation.transaction_id,
		confirmationCode: responseData.addGift.addGiftResponse.gift.checkNumber,
		transactionDate: responseData.addGift.addGiftResponse.gift.date,
		email: jQuery('input[name="email"]').val(),
		firstName: jQuery('input[name="first_name"]').val(),
		lastName: jQuery('input[name="last_name"]').val(),
		amt: jQuery('input[name=other_amount]').val(),
		form: campaign_name,
		ddCompanyId: ddCompanyId
	};

	// Call only if the widget is on the form
	// if (ddCompanyId.length || jQuery('input[name=doublethedonation_company_id]').length > 0) {
		doubleDonationConfirmation(widgetData);
	// }
}

/**
 * Post matching gift info
 * @param {*} widgetData
 */
function doubleDonationConfirmation(widgetData) {

	var domain = doublethedonation.integrations.core.strip_domain(widgetData.email);
	doublethedonation.plugin.load_config();
	doublethedonation.plugin.set_donation_id(widgetData.confirmationCode);
	doublethedonation.plugin.set_donation_campaign(widgetData.form);
	doublethedonation.plugin.email_domain(domain);

	if (widgetData.ddCompanyId !== "") {
		doublethedonation.plugin.set_company(widgetData.ddCompanyId);
	}

	doublethedonation.integrations.core.register_donation({
		"360matchpro_public_key": "w5JH5j9ID4Cf6zMh",
		"campaign": widgetData.form,
		"donation_identifier": widgetData.confirmationCode,
		"donation_amount": widgetData.amt,
		"donor_first_name": widgetData.firstName,
		"donor_last_name": widgetData.lastName,
		"donor_email": widgetData.email,
		"doublethedonation_company_id": widgetData.ddCompanyId,
		"doublethedonation_status": null
	});

	// delay triggering the widget
	setTimeout(function() {
		if (window.doublethedonation) {
			doublethedonation.plugin.load_plugin();
		}
	}, 1500);
}

// Double the Donation Widget
if(!window.doublethedonation) {
	jQuery("#dd-company-name-input").html("<div class='form-row'><div class='form-content'><input type='text'/></div></div>");
}
jQuery(document).on("doublethedonation_company_id", function () {
	var dtd_company_id = jQuery('input[name="doublethedonation_company_id"]').val();
	jQuery("#double_the_donation_company_id").val(dtd_company_id);
});

// Get amount from URL
function populateAmount(amount) {
	var match = jQuery('label[data-amount="' + amount + '"]');
	if(match.length>=1){
		jQuery(match).click();
		jQuery('#confirmationAmt').text(amount);
		// feeOption.coverFee();
	} else {
		jQuery('label.active').removeClass("active");
		jQuery('label.level_other').addClass("active");
		jQuery('.level-other-input').slideDown();
		jQuery('#other-radio').prop({'checked': true}).attr({'aria-checked': true});
		jQuery('#other-amount-entered').removeAttr('disabled');
		jQuery('#other-amount-entered').attr('name', 'other_amount_entered');
		jQuery('input[name=other_amount], input[name=gift_amount], input[name=other_amount_entered]').val(amount);
		jQuery('#confirmationAmt').text(amount);
		// feeOption.coverFee();
	}
}

// GA Donation Success
(function(){
	var a = document.createElement('script');
	a.type = 'text/javascript';
	a.src = '../amazonpay/cyclenation/js/gaDonationSuccess.js';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(a, s);
})();
