    jqcn(document).ready(function() {
        jqcn('#from_url_js').val(document.referrer);

	var evid = jqcn.getQuerystring("FR_ID");
	var apiURL = 'https://www2.heart.org/site/CRTeamraiserAPI?luminateExtend=1.7.1&method=getTeamraisersByInfo&name=%25%25%25&list_filter_column=frc.fr_id&list_filter_text='+evid+'&list_page_size=500&list_ascending=false&list_sort_column=event_date&api_key=wDB09SQODRpVIOvX&response_format=json&suppress_response_codes=true&v=1.0&ts=1536362358137';
	if (jqcn('input[name=instance]').val() == "heartdev") {
		apiURL = 'https://dev2.heart.org/site/CRTeamraiserAPI?luminateExtend=1.7.1&method=getTeamraisersByInfo&name=%25%25%25&list_filter_column=frc.fr_id&list_filter_text='+evid+'&list_page_size=500&list_ascending=false&list_sort_column=event_date&api_key=wDB09SQODRpVIOvX&response_format=json&suppress_response_codes=true&v=1.0&ts=1536362358137';
        }
	jqcn.getJSON(apiURL,function(data){
		if(data.getTeamraisersResponse != null) {
                   var regtst = /\w{3}-+/;
	   	   var match = regtst.exec(data.getTeamraisersResponse.teamraiser.greeting_url);
                   if (match != null) {
   		      jqcn('input[name=affiliate]').val(match[0].substr(0,3));
                   } else {
   		      jqcn('input[name=affiliate]').val('GEN');
                   }
                } else {
		   jqcn('input[name=affiliate]').val('GEN');
                }
        });
	    
	/* UI handlers for the donation form example */
        if (jqcn('.donation-form').length > 0) {
            jqcn('.donate-select label').click(function() {
                if (jqcn(this).next('div').is('.level-other-input')) {
                    jqcn('.level-other-input').slideDown();
                    jqcn('#other-amount-entered').removeAttr('disabled');
                    jqcn('#other-amount-entered').attr('name', 'other_amount_entered');
                    jqcn('#other-amount-entered').focus();
                } else {
                    jqcn('.level-other-input').slideUp();
                    jqcn('#other-amount-entered').attr('disabled', 'disabled');
                    jqcn('#other-amount-entered').removeAttr('name');
                }
            });

            // Get amount passed from query string
            let amount = jqcn.getQuerystring("amount");
            if (amount.length > 0) {
                populateAmount(amount);
            }

            jqcn('.donation-form').submit(function() {
                //move contact info details to billing info if any fields are blank
                jqcn('[id^=billing\\_]').each(function() {
                    if (jqcn(this).val() == "") {
                        jqcn(this).val(jqcn("[id='" + jqcn(this).attr("id").replace("billing_", "donor_") + "']").val());
                    }
                });

                jqcn('input[name=compliance]').val("true");

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
                    if (value == 0 || (value >= 10 && value <= 500)) {
                        return true;
                    } else {
                        return false;
                    }
                },
                "Please enter an amount between $10 and $500"
            );

            jqcn('#donate-submit').click(function() {
                var form = jqcn('form.donation-form');
                jqcn(form).validate().settings.ignore = ":disabled,:hidden";
                if (jqcn(form).valid()) {
                    if (jqcn('input[name=other_amount]').val() < 10) {
                        alert("Please enter an amount $10 or greater");
                        return false;
                    }
					braintree_aha.submitGooglePayDonation();
                } else {
                    return false;
                }
            });
        }

    });

(function($) {
    jqcn.extend({
        getQuerystring: function(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(location.href);
            if (results == null)
                return "";
            else
                return decodeURIComponent(results[1].replace(/\+/g, " "));
        }
    });
})(jqcn);

function donateGooglePay() {
	window.scrollTo(0, 0);
	jqcn('.donation-form').hide();
	jqcn('.processing').hide();
	var amt = jqcn('input[name=other_amount]').val();
	var ref = 'GOOGLEPAY:'+jqcn('input[name=processorAuthorizationCode]').val();
	//save off amazon id into custom field
	jqcn('input[name=check_number]').val(ref);
	jqcn('input[name=payment_confirmation_id]').val(ref);
	jqcn('input[name=gift_display_name]').val(jqcn('input[name="first_name"]').val() + ' ' + jqcn('input[name="last_name"]').val());

	//make offline donation in luminate to record transaction
	if (jqcn('input[name="df_preview"]').val() != "true") donateOffline(donateOfflineCallback);

	var from_url = jqcn('input[name="from_url"]').val();
	var email = jqcn('input[name="email"]').val();
	var first = jqcn('input[name="first_name"]').val();
	var last = jqcn('input[name="last_name"]').val();
	var street1 = jqcn('input[name="street1"]').val();
	var street2 = jqcn('input[name="street2"]').val();
	var city = jqcn('input[name="city"]').val();
	var state = jqcn('select[name="state"]').val();
	var zip = jqcn('input[name="zip"]').val();

	jqcn('.donation-loading').remove();
	jqcn('.donate-now, .header-donate').hide();
	jqcn('.thank-you').show();
	var ty_url = "/amazonpay/cyclenation/googlepay/thankyou.html";
	jqcn.get(ty_url, function(datat) {
		jqcn('.thank-you').html(jqcn(datat).find('.thank-you').html());
		jqcn('p.from_url').html("<a href='"+from_url+"'>Click here</a>");
		jqcn('p.first').html(first);
		jqcn('p.last').html(last);
		jqcn('p.street1').html(street1);
		jqcn('p.street2').html(street2);
		jqcn('p.city').html(city);
		jqcn('p.state').html(state);
		jqcn('p.zip').html(zip);
		jqcn('p.email').html(email);
		jqcn('p.amount').html("$" + amt);
		jqcn('p.confcode').html(ref);
		jqcn('.share-url a').each(function(){
			jqcn(this).attr("href", jqcn(this).attr("href").replace("%returnurl%",escape(from_url)));
		});
	});

	/* ECOMMERCE TRACKING CODE */
	ga('require', 'ecommerce');
	ga('ecommerce:addTransaction', {
		'id': ref,
		'affiliation': 'AHA Google Pay Donation',
		'revenue': amt,
		'city': jqcn('input[name="donor.address.city"]').val(),
		'state': jqcn('select[name="donor.address.state"]').val() // local currency code.
	});
	ga('ecommerce:send');
	ga('send', 'pageview', '/donateok.asp');
}

//copy donor fields to billing
jqcn('[id^=donor_]').each(function() {
    jqcn(this).blur(function() {
        jqcn("[id='" + jqcn(this).attr("id").replace("donor_", "billing_") + "']").val(jqcn(this).val());
    });
});
 
var eid = jqcn('input[name=fr_id]').val();
var dtype = (jqcn('input[name=proxy_type_value]').val() == 20 || jqcn('input[name=proxy_type_value]').val() == 2) ? "p" : ((jqcn('input[name=proxy_type_value]').val() == 21) ? "e" : "t");
var pid = (dtype == "p") ? jqcn('input[name=cons_id]').val() : "";
var tid = (dtype == "t") ? jqcn('input[name=team_id]').val() : "";
	var tr_info = "https://www2.heart.org/site/SPageNavigator/reus_donate_amazon_tr_info.html";
	if (jqcn('input[name=instance]').val() == "heartdev") {
	tr_info = "https://secure3.convio.net/heartdev/site/SPageNavigator/reus_donate_amazon_tr_info.html";
}
jqcn.getJSON(tr_info+"?pgwrap=n&fr_id="+eid+"&team_id="+tid+"&cons_id="+pid+"&callback=?",function(data2){
	//jqcn('.page-header h1').html(data2.event_title);
	if (data2.team_name != "" && dtype == "t") {
		jqcn('.donation-form-container').before('<div class="donation-detail"><strong>Donating to Team Name:</strong><br/><a href="'+jqcn('input[name=from_url]').val()+'">'+data2.team_name+'</a></div>');
	}
	if (data2.event_title != " " && dtype == "e") {
		jqcn('.donation-form-container').before('<div class="donation-detail"><strong>Donating to Event:</strong><br/><a href="'+jqcn('input[name=from_url]').val()+'">'+data2.event_title+'</a></div>');
	}
	if (data2.part_name != " " && dtype == "p") {
		jqcn('.donation-form-container').before('<div class="donation-detail"><strong>Donating to Participant:</strong><br/><a href="'+jqcn('input[name=from_url]').val()+'">'+data2.part_name+'</a></div>');
	}

	jqcn('input[name=form_id]').val(data2.don_form_id);
});
