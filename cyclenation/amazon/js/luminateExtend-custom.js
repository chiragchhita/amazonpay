(function($) {
  /* define init variables for your organization */
  jqcn(function() {
    jqcn('#from_url_js').val(document.referrer);
	  
    /* UI handlers for the donation form example */
    if(jqcn('.donation-form').length > 0) {
      jqcn('.donate-select label').click(function() {
        if(jqcn(this).next('div').is('.level-other-input')) {
			jqcn('.level-other-input').slideDown();
          jqcn('#other-amount-entered').removeAttr('disabled');
          jqcn('#other-amount-entered').attr('name', 'other_amount_entered');
          jqcn('#other-amount-entered').focus();
        }
        else {
			jqcn('.level-other-input').slideUp();			
          jqcn('#other-amount-entered').attr('disabled', 'disabled');
          jqcn('#other-amount-entered').removeAttr('name');
        }
	  });

	  jqcn('.donate-select label').click(function() {
		jqcn('.donate-select .active').removeClass('active');
		jqcn(this).addClass('active');
	  });
      
	  jqcn('.gift-select label').click(function(){
			showLevels(jqcn(this).prev('input').data('frequency'),this);
	  });

		// Get amount passed from query string
		let amount = jqcn.getQuerystring("amount");
		if (amount.length > 0) {
			populateAmount(amount);
		}

      jqcn('.donation-form').submit(function() {
		//move contact info details to billing info if any fields are blank
		jqcn('[id^=billing\\_]').each(function(){
		  if (jqcn(this).val() == ""){
			   jqcn(this).val(jqcn("[id='"+jqcn(this).attr("id").replace("billing_","donor_")+"']").val());
		  }
		});

		// jqcn('input[name=compliance]').val("true");
		
        window.scrollTo(0, 0);
        jqcn(this).hide();
        jqcn(this).before('<div class="well donation-loading">' + 
                         'Thank You!  We are now processing your gift ...' + 
                       '</div>');
      });

		jqcn('.donation-form').validate();				   
		
		jqcn.validator.addMethod(
			"validDonation", 
			function(value, element) {
				if (value == 0 || (value >= 25 && value <= 500)) {
					return true;
				} else {
					return false;
				}
			},
			"Please enter an amount between $25 and $500"
		);

      jqcn('#donate-submit').click(function() {
		var form =jqcn('form.donation-form');
		jqcn(form).validate().settings.ignore = ":disabled,:hidden";
		if (jqcn(form).valid()) {
			if (jqcn('input[name=other_amount]').val() < 25) {
				alert("Please enter an amount $25 or greater");
				return false;
			}
			submitAmazonDonation();
		} else {
			const h = document.querySelector(".section-header-container");
			h.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
			return false;
		}
      });
    }
  });
})(jqcn);

// Get Amazon confirmation id
if (location.href.indexOf("amazonCheckoutSessionId") > 0) {
	// hide form - show loading
	window.scrollTo(0, 0);
	jqcn('.donation-form').hide();
	jqcn('.donation-form').before('<div class="well donation-loading">' +
			'Thank You!  We are now processing your donation from Amazon ...' +
			'</div>');
}

function donateAmazon(amazonCheckoutSessionId) {
	let lsForm = localStorage.getItem('ahaDonate');
	if (lsForm != null) {
		// verify checkout
		populateForm(lsForm);
		const amzAmt = localStorage.getItem('amz_aha_amt');
		amazonPayVerifyCheckout(amazonCheckoutSessionId, amzAmt);
	} else {
		// handle missing data
		console.log('no data found');
		jqcn('.donation-form').prepend('<div id="donation-errors" role="alert" aria-atomic="true" aria-live="assertive"><div class="alert alert-danger" role="alert">There was an error. Please check your payment details and try again.</div></div>');
		jqcn('.donation-loading').remove();
		jqcn('.donation-form').show();
	}
}

function showLevels(frequency, sel) {
	jqcn('.radio-label').removeClass("active");
	jqcn(sel).addClass("active");
    jqcn('.donate-select label.radio-level').removeClass("active");
	if (frequency == "recurring") {
		jqcn('.recurring').show();
		jqcn('.onetime').hide();
		jqcn('input[name=recurring]').val('true');
		jqcn("#consentWidgetDiv").show();
	    jqcn('.recurring label.radio-level:eq(1)').click();
	} else {
		jqcn('.recurring').hide();
		jqcn('.onetime').show();
		jqcn('input[name=recurring]').val('false');
		jqcn("#consentWidgetDiv").hide();
	    jqcn('.onetime label.radio-level:eq(1)').click();
	}
}

(function ($) {
	jqcn.extend({
		getQuerystring: function(name){
		  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		  var regexS = "[\\?&]" + name + "=([^&#]*)";
		  var regex = new RegExp(regexS);
		  var results = regex.exec(location.href);
		  if(results == null)
			return "";
		  else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
		}
	});
})(jqcn);

const amzConfirmationId = jqcn.getQuerystring('amazonCheckoutSessionId');
jqcn(document).ready(function(){
	if (amzConfirmationId) {
		donateAmazon(amzConfirmationId);
	}
});

//copy donor fields to billing
jqcn('[id^=donor_]').each(function(){
  jqcn(this).blur(function(){
    jqcn("[id='"+jqcn(this).attr("id").replace("donor_","billing_")+"']").val(jqcn(this).val());
  });
});

jqcn('#other-amount-entered').on('blur', function(){
	jqcn('#confirmationAmt').text(jqcn('input[name=other_amount]').val());
});
jqcn('#cover_fee, .radio-level').on('click', function(){
	jqcn('#confirmationAmt').text(jqcn('input[name=other_amount]').val());
});

//autofill from querystring data
jqcn('input[name="first_name"]').val(jqcn.getQuerystring("first"));
jqcn('input[name="last_name"]').val(jqcn.getQuerystring("last"));
jqcn('input[name="street1"]').val(jqcn.getQuerystring("street1"));	
jqcn('input[name="dstreet2"]').val(jqcn.getQuerystring("street2"));	
jqcn('input[name="city"]').val(jqcn.getQuerystring("city"));	
jqcn('input[name="state"]').val(jqcn.getQuerystring("state"));	
jqcn('input[name="zip"]').val(jqcn.getQuerystring("zip"));	
jqcn('input[name="email"]').val(jqcn.getQuerystring("email"));	

//check for any passed parameters
if (jqcn.getQuerystring("s_src")) {
	jqcn('input[name=source]').val(jqcn.getQuerystring("s_src"));
}

if (jqcn.getQuerystring("msource")) {
	jqcn('input[name=source]').val(jqcn.getQuerystring("msource"));
}

// if (jqcn.getQuerystring("amount")) {
// 	jqcn('label.active').removeClass("active");
// 	jqcn('label.level_other').addClass("active");
// 	jqcn('.level-other-input').slideDown();
// 	jqcn('#other-amount-entered').removeAttr('disabled');
// 	jqcn('#other-amount-entered').attr('name', 'other_amount_entered');
// 	jqcn('input[name=other_amount]').val(jqcn.getQuerystring("amount"));
// 	jqcn('input[name=other_amount_entered]').val(jqcn.getQuerystring("amount"));
// }

// END QUERY STRING CODE 
function displayEventInfo() {
	var eid = jQuery('input[name=fr_id]').val();
	var dtype = (jQuery('input[name=proxy_type_value]').val() == 20) ? "p" : ((jQuery('input[name=proxy_type_value]').val() == 21) ? "e" : "t");
	var pid = (dtype == "p") ? jQuery('input[name=cons_id]').val() : "";
	var tid = (dtype == "t") ? jQuery('input[name=team_id]').val() : "";
	var tr_info = "https://www2.heart.org/site/SPageNavigator/reus_donate_amazon_tr_info.html";
	if (jQuery('input[name=instance]').val() == "heartdev") {
		tr_info = "https://secure3.convio.net/heartdev/site/SPageNavigator/reus_donate_amazon_tr_info.html";
	}
	jQuery.getJSON(tr_info+"?pgwrap=n&fr_id="+eid+"&team_id="+tid+"&cons_id="+pid+"&callback=?",function(data2){
		//jQuery('.page-header h1').html(data2.event_title);
		if (data2.team_name != "" && dtype == "t") {
			jQuery('.donation-form-container').before('<div class="donation-detail"><strong>Donating to Team Name:</strong><br/><a href="'+decodeURIComponent(jQuery('input[name=from_url]').val())+'">'+data2.team_name+'</a></div>');
		}
		if (data2.event_title != " " && dtype == "e") {
			jQuery('.donation-form-container').before('<div class="donation-detail"><strong>Donating to Event:</strong><br/><a href="'+decodeURIComponent(jQuery('input[name=from_url]').val())+'">'+data2.event_title+'</a></div>');
		}
		if (data2.part_name != " " && dtype == "p") {
			jQuery('.donation-form-container').before('<div class="donation-detail"><strong>Donating to Participant:</strong><br/><a href="'+decodeURIComponent(jQuery('input[name=from_url]').val())+'">'+data2.part_name+'</a></div>');
		}

		jQuery('input[name=form_id]').val(data2.don_form_id);
	});
}
displayEventInfo();
