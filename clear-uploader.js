/* =========================================================
 * clear-uploader.js (required jQuery 1.10.2+)
 * (c) 2013 Andrey Kozlov Tomsk
 * Created to work with the module Kohana (can be used independently)
 * ==========================================================
 * Settings:
 *  object type:
 *      (string)    php_url     - url php script that handles the Ajax request
 *      (object)    user_data   - any user data to be transmitted together with files, can be null
 *      (int)       delay       - delay before hiding ClearUploader elements (1500 by default)
 * ==========================================================
 * Examples:
 *  Input button (HTML):
 *      <input type="button" class="clearuploader-btn clearuploader-btn-success" value="Choose files..." onclick="$(this).next().click()">
 *      <input type="file" class="hide" name="ClearUploader" multiple="multiple" onchange='functionName(this, id)' /> // id - for example
 *
 *  Available classes/styles for input:
 *      clearuploader-btn-primary   - blue
 *      clearuploader-btn-warning   - orange
 *      clearuploader-btn-danger    - red
 *      clearuploader-btn-success   - green
 *      clearuploader-btn-info      - gray-blue
 *      clearuploader-btn-upload    - black
 *
 *  jQuery function (AJAX POST-type asynchronous):
 *      function functionName(element, id){ // element - this, id - for example
 *          $(element).ClearUploader({
 *              php_url: "ajax/anyPHPscript" // GET for example
 *              , user_data: {
 *                  id: id
 *                  , folder: "user/" // folder - for example (any another data), NOT Objects!
 *                  // etc.
 *              }
 *              , delay: 15000 // value - for example (1500 by default)
 *              , style: "primary" // the above upload-button styles, value - for example ("upload" by default)
 *          });
 *      }
 *
 *  PHP script receives:
 *      $_FILES['file']     - ONE! of the selected file!
 *      $_POST['cu_id']     - will contain your ID
 *      $_POST['cu_folder'] - will contain "user/"
 *      // etc.
 * ==========================================================
 * Obtaining data from Ajax (for PHP scripts)
 *  (object)    $_FILES['file']     - ONE! of the selected file type FormData() with fields:
 *      (int)       error       - Error capture file
 *      (string)    name        - Filename
 *      (int)       size        - File size
 *      (string)    tmp_name    - Temporary storage location
 *      (string)    type        - File type (grouped)
 *  (string)    $_POST['cu_*']      - Where * object field user_data
 * ==========================================================
 * Events trigger:
 *      complete        - On AJAX complete and all the features work finished
 *      before_sending  - Files before sending Ajax
 *      after_sending   - Files after sending Ajax
 *  Example of use:
 *      function functionName(element, id){ // element - this, id - for example
 *          $(element).on('complete', function () {
 *              // your code...
 *          })
 *      }
 * ==========================================================
 * License: MIT, GPLv3
 * @license http://www.opensource.org/licenses/mit-license.php
 * @license http://www.gnu.org/licenses/gpl.html
 * @project jQuery.ClearUploader
 * ==========================================================*/

!function( $ ) {

    // Clear-Uploader Object

    var ClearUploader = function(element, options){
        // Global options
        this.options = {};
        //this.viewMode = options.viewMode||0;
        this.options.php_url = (typeof(options.php_url) == "undefined") ? null : options.php_url;
        this.options.user_data = (typeof(options.user_data) == "undefined") ? null : options.user_data;
        this.options.delay = (typeof(options.delay) == "undefined") ? 1500 : options.delay;
        this.options.style = (typeof(options.style) == "undefined") ? "upload" : options.style;

        // input type="file", that caused the event
        this.element = $(element);

        // Selected Files
        this.files = this.element.context.files;

        this.content = '';

        // Row for each file in to Table
        if (this.files.length > 0) {
            var rows = '';
            var file_number = 1;
            jQuery.each(this.files, function() {
                rows += '<tr class="clearuploader-success">' +
                            '<td>' + file_number + '&nbsp;<input type="checkbox" checked></td>' +
                            '<td>' + this.name + '</td>' +
                            '<td>' + (Math.round(parseFloat(this.size/1000000) * 100) / 100).toString().replace('.', ',') + '</td>' +
                            '<td>' + this.name.substr( this.name.lastIndexOf('.') + 1 ).toUpperCase() + '</td>' +
                            '<td>' + CU_settings.inscriptions.ok + '</td>' +
                        '</tr>';
                file_number++;
            });
            this.content = rows;
        };

        // General template dialog Button + Table
        this.template =
            '<div class="clearuploader-button-block hide">' +
                '<button class="clearuploader-btn clearuploader-btn-' + this.options.style + '">' + CU_settings.inscriptions.upload + '</button>' +
            '</div>' +
            '<div class="clearuploader-row hide">' +
                '<table class="clearuploader-table clearuploader-table-hover">' +
                    '<thead>' +
                        '<tr>' +
                            '<th class="span1">#</th>' +
                            '<th class="span5">' + CU_settings.inscriptions.file_name + '</th>' +
                            '<th class="span2">' + CU_settings.inscriptions.file_size + '</th>' +
                            '<th class="span2">' + CU_settings.inscriptions.file_type + '</th>' +
                            '<th class="span2">' + CU_settings.inscriptions.file_status + '</th>' +
                        '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                        this.content +
                    '</tbody>' +
                '</table>' +
            '</div>';

        // Unbind triggers
        this.element.unbind('complete').unbind('before_sending').unbind('after_sending');

        // Hide current Button + Table
        $('div.clearuploader-button-block').remove();
        $('div.clearuploader-row').remove();

        // If Table exist rows
        if (this.content !== '') {

            // Insert dialog Button + Table
            this.element.after ( this.template );

            // Show current Button + Table
            $('div.clearuploader-button-block').removeClass('hide');
            CU_settings.show($('div.clearuploader-row'));

            // Event to checkbox
            $('.clearuploader-table :checkbox').on({
                change: $.proxy(this.toggleStatus, this)//,
            });

            // Event to Button
            $('button.clearuploader-btn-upload').on({
                click: $.proxy(this.uploadFiles, this)//,
            });
        }
        //this.table_id = this.table_id||(new Date()).getTime();
    }

    // Inscriptions and functions of the class
    var CU_settings = {
        inscriptions: {
            // Button
            upload: "Загрузить!"
            // Table head
            , file_name: "Название файла"
            , file_size: "Размер, Mb"
            , file_type: "Тип"
            , file_status: "Статус"
            // File statuses
            , ok: "Загружать!"
            , skip: "Пропустить!"
            , loading: "Загружаю..."
            , complete: "Загружен!"
            , omitted: "Пропущен!"
            , error: "Ошибка передачи!"
        },

        // Message colors
        classes: ['clearuploader-success', 'clearuploader-error', 'clearuploader-warning', 'clearuploader-info'],

        // Showing element
        show: function(element) {
            $(element).fadeIn('slow', function() {
                $(this).removeClass('hide');
            });
        },

        // Hiding element
        hide: function(element, delay) {
            setTimeout( function() {
                $(element).fadeOut('slow', function() {
                    $(this).remove();
                });
            }, delay);
        },

        // Removing classes
        removeClass: function(element) {
            jQuery.each(CU_settings.classes, function(class_name) {
                if ($(element).hasClass( class_name )) {
                    $(element).removeClass( class_name );
                }
            });
        }
    }

    // ClearUploader prototype
    ClearUploader.prototype = {
        constructor: ClearUploader,

        // Function performed by the status change
        toggleStatus: function() {
            $('.clearuploader-table :checkbox').each(function() {
                if ($(this).prop('checked') !== $(this).closest('tr').hasClass('clearuploader-success')) {
                    $(this).closest('tr').toggleClass('clearuploader-success').toggleClass('clearuploader-warning');
                    $(this).closest('tr').children('td').last().text( $(this).prop('checked') ? CU_settings.inscriptions.ok : CU_settings.inscriptions.skip );
                }
            });
        },

        // Function performed by pressing the upload button
        uploadFiles: function() {
            var default_AJAX = {
                type: $.ajaxSetup()['type']
                , processData: $.ajaxSetup()['processData']
                , contentType: $.ajaxSetup()['contentType']
                , url: $.ajaxSetup()['url']
            };

            $.ajaxSetup({
                type: "POST"
                , processData: false
                , contentType: false
                , url: this.options.php_url
            });

            var element = this.element;
            var user_data = this.options.user_data;
            var delay = this.options.delay;

            element.trigger('before_sending');

            jQuery.each(this.files, function() {
                var row_object = $('div.clearuploader-row tr > td:contains(' + this.name + ')').closest('tr');
                if (row_object.hasClass('clearuploader-success')) {
                    row_object.children('td').last().text( CU_settings.inscriptions.loading );

                    var file = new FormData();
                    file.append('file', this);

                    jQuery.each(user_data, function(key, value) {
                        file.append('cu_' + key, value);
                    });

                    $.ajax({
                        complete: function(result) {
                            // For tests
                            //console.log(result);
                            result = jQuery.parseJSON(result.responseText);
                            if (result.error) {
                                CU_settings.removeClass(row_object);
                                row_object.addClass('clearuploader-error').children('td').last().text( result.response );
                                CU_settings.hide(row_object, delay);
                            } else {
                                row_object.children('td').last().text( CU_settings.inscriptions.complete );
                                CU_settings.hide(row_object, delay);
                            }
                        },
                        data: file
                    });
                } else {
                    row_object.children('td').last().text( CU_settings.inscriptions.omitted );
                    CU_settings.hide(row_object, delay);
                };
            });

            element.trigger('after_sending');

            CU_settings.hide($('div.clearuploader-button-block'), delay);
            CU_settings.hide($('div.clearuploader-row'), delay);
            $.ajaxSetup({
                type: default_AJAX['type']
                , processData: default_AJAX['processData']
                , contentType: default_AJAX['contentType']
                , url: default_AJAX['url']
            });

            setTimeout( function() {
                element.trigger('complete');
            }, delay + $.fx.speeds.slow);
        }
    }

    // Adding in jQuery
    $.fn.ClearUploader = function ( options ) {
        return new ClearUploader(this, options);
    }

    // ClearUploader constructor
    $.fn.ClearUploader.Constructor = ClearUploader;

}( window.jQuery );
