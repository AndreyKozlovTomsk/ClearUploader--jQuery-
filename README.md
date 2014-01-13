ClearUploader--jQuery-
======================

ASYNCHRONOUS SENDING FILES TO THE SERVER WITH THE USER DATA!

Created to work with the module Kohana (can be used independently)

==========================================================
Settings:

	object type:
		(string)    php_url     - url php script that handles the Ajax request
		(object)    user_data   - any user data to be transmitted together with files, can be null
		(int)       delay       - delay before hiding ClearUploader elements (1500 by default)
		
==========================================================
Examples:

	Input button (HTML):
		<input type="button" class="clearuploader-btn clearuploader-btn-success" value="Choose files..." onclick="$(this).next().click()">
    	<input type="file" class="hide" name="ClearUploader" multiple="multiple" onchange='functionName(this, id)' /> // id - for example

	Available classes/styles for input:
    	clearuploader-btn-primary   - blue
    	clearuploader-btn-warning   - orange
    	clearuploader-btn-danger    - red
    	clearuploader-btn-success   - green
    	clearuploader-btn-info      - gray-blue
    	clearuploader-btn-upload    - black

	jQuery function (AJAX POST-type asynchronous):
	    function functionName(element, id){ // element - this, id - for example
        	$(element).ClearUploader({
            	php_url: "ajax/anyPHPscript" // GET for example
            	, user_data: {
                	id: id
                	, folder: "user/" // folder - for example (any another data), NOT Objects!
                	// etc.
            	}
            	, delay: 15000 // value - for example (1500 by default)
            	, style: "primary" // the above upload-button styles, value - for example ("upload" by default)
        	});
    	}

==========================================================
PHP script receives:

	$_FILES['file']     - ONE! of the selected file!
	$_POST['cu_id']     - will contain your ID
	$_POST['cu_folder'] - will contain "user/"
	// etc.

==========================================================
Obtaining data from Ajax (for PHP scripts)

	(object)    $_FILES['file']     - ONE! of the selected file type FormData() with fields:
    	(int)       error       - Error capture file
    	(string)    name        - Filename
    	(int)       size        - File size
    	(string)    tmp_name    - Temporary storage location
    	(string)    type        - File type (grouped)
	(string)    $_POST['cu_*']      - Where * object field user_data

==========================================================
Event trigger:

	complete        - On AJAX complete and all the features work finished
	before_sending  - Files before sending Ajax
	after_sending   - Files after sending Ajax
    	
Example of use:

	function functionName(element, id){ // element - this, id - for example
    	$(element).on('complete', function () {
    	    // your code...
    	})
	}
