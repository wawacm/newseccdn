/*! VFM - veno file manager main administration functions
 * ================
 *
 * @Author  Nicola Franchini
 * @Support <http://www.veno.es>
 * @Email   <support@veno.it>
 * @version 3.6.0
 * @license Exclusively sold on CodeCanyon
 */
$(document).ready(function () {

    // Init EasyEditor inside appearance
    if (typeof EasyEditor !== 'undefined') {
        new EasyEditor('.easyeditor', {
            // css: ({
            //     minHeight: '300px',
            //     maxHeight: '500px'
            // }),
            onLoaded: function(){
            //     console.log('Easy Editor Loaded!');
            },
            buttons : ['bold', 'italic', 'link', 'h2', 'h3', 'h4', 'alignleft', 'aligncenter', 'alignright', 'quote', 'source', 'x'],
            buttonsHtml: {
                'bold': '<i class="bi bi-type-bold"></i>',
                'italic': '<i class="bi bi-type-italic"></i>',
                'link': '<i class="bi bi-link-45deg"></i>',
                'align-left': '<i class="bi bi-text-left"></i>',
                'align-center': '<i class="bi bi-text-center"></i>',
                'align-right': '<i class="bi bi-text-right"></i>',
                'quote': '<i class="bi bi-quote"></i>',
                'source': '<i class="bi bi-code-slash"></i>',
                'insert-image': '<i class="bi bi-image"></i>',
                'remove-formatting': '<i class="bi bi-slash-square"></i>'
            }
        });
    }
});
//
// Clear /thumbs/ and /share/ folder
//
$(document).ready(function(){
    var regenicon = '<div class="spinner-border spinner-border-sm ms-1" role="status"><span class="visually-hidden">Loading...</span></div>';
    var successicon = '<i class="bi bi-check-lg"></i>';
    var failicon = '<i class="bi bi-x-lg"></i>';

    $('.regen-thumb').on('click', function(){

        var butt = $(this);
        var place_icon = butt.find('.place-icon');

        if (!butt.hasClass('disabled')) {

            butt.addClass('disabled');

            place_icon.html(regenicon);

            $.ajax({
                method: "GET",
                url: "admin-panel/ajax/regen-thumbnails.php",
            })
            .done(function( msg ) {
                if (msg == 'success') {
                     place_icon.html(successicon);
                } else {
                    place_icon.html(failicon);
                    console.log(msg);
                }
                butt.removeClass('disabled');
                butt.removeClass('disabled');
            })
            .fail(function() {
                butt.removeClass('disabled');
                console.log('error clearing /thumbs/ folder');
                place_icon.html('<i class="bi bi-x-lg"></i>');
            });
        }
    });

    $('.regen-share').on('click', function(){
        var butt = $(this);
        var place_icon = butt.find('.place-icon');

        if (!butt.hasClass('disabled')) {

            butt.addClass('disabled');

            place_icon.html(regenicon);

            var selected = document.querySelector(".form-select[name='lifetime']");

            $.ajax({
                method: "POST",
                url: "admin-panel/ajax/clear-share.php",
                data: { 
                    'lifetime' : selected.value
                }
            })
            .done(function( msg ) {
                if (msg == 'success') {
                    place_icon.html(successicon);
                } else {
                    place_icon.html(failicon);
                    console.log(msg);
                }
                butt.removeClass('disabled');
               
            })
            .fail(function() {
                butt.removeClass('disabled');
                console.log('error clearing /share/ folder');
                place_icon.html(failicon);
            });
        }
    });

});

//
// call taginput plugin
//
$('.tagin').each(function(){
    new Tagin($(this)[0],{
        enter: true
    });
});


$('.toggle-sidebar').on('click', function(){
    var dest = $(this).data('bs-target');
    $(dest).toggleClass('open');
});

//
// toggle allow/reject extensions
//
function switchExtensions(){
    $('.togglext').each(function(){
        var collapser = $(this).closest('.toggle-wrap').find('.toggle-collapse');
        if ($(this).is(':checked')) {
            collapser.slideDown();
        } else {
            collapser.slideUp();
        }
    });
}

//
// Show / hide user quota menu when dropdown or new input
//
function showHideQuota(togglequota){
    var getnumber = togglequota.find('.getfolder-count');

    var setnew = togglequota.find('.assignnew');
    var quota = togglequota.find('.userquota');
    if (getnumber.text() > 0 || (setnew.val() && setnew.val().length)) {
        quota.fadeIn();
    } else {
        quota.fadeOut();
    }
}

$('.togglequota').each(function(){
    showHideQuota($(this));
});


$(document).on('input', '.togglequota .assignnew', function() {
    var togglequota = $(this).closest('.togglequota');
    showHideQuota(togglequota);
});

//
// confirm user deletion
//
$(document).on('click', '.remove', function(e) {
    //e.preventDefault();
    var todelete = $(this).closest(".removegroup").find(".deleteme").val();
    var answer = confirm('Are you sure you want to delete: ' + todelete + '?');
    if (answer == true) {
        $(".remove").find(".delme").val(todelete);
    }
    return answer;
});

//
// confirm language deletion
//
$(document).on('click', '.delete', function() {
    var answer = confirm('Are you sure you want entirely to delete this language?');
    return answer;
});

//
// delete logo
//
$(document).on('click', '.deletelogo', function(e) {
    e.preventDefault();
    $(this).addClass('d-none');
    var datasetting = $(this).data('setting');
    $('input[name=remove_'+datasetting+']').val(1);
    $('.'+datasetting+'-preview').attr('src', 'admin-panel/images/placeholder.png');
});

//
// Upload custom logo
//
$(document).on('change', '.btn-file :file', function() {
    var input = $(this),
    numFiles = input.get(0).files ? input.get(0).files.length : 1,
    label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});

//
// Switch audio notifications
//
$(document).on('change', '.audio-notif', function(){
    var loadmp3 = $(this).val();
    var audio_ping = new Audio(loadmp3);
    audio_ping.play();
});

//
// Show / Hide New User notification checkbox
//
function checkUserNotif(){

    $("#usernotif_again").val('');

    if ($('.newusermail').length) {
        if ($('.newusermail').val().length > 4){
            $('.usernotif').fadeIn();
        } else {
            $('.usernotif').fadeOut();
        }
    }

    if ($('#r-usermail').length) {
        if ($('#r-usermail').val().length > 4){
            $('.usernotif_again').fadeIn();
        } else {
            $('.usernotif_again').fadeOut();
        }
    }
}

//
// Update adminstration color scheme on the fly
//
function updateThemeColors(selector, hsl){
    var basecolor = Number(hsl.h) + ', ' + (Number(hsl.s)*100)+'%';
    var basecolortext = '#f8f9fa';
    if (Number(hsl.l) >= 0.6) {
        basecolortext = '#212529';
    }
    document.querySelector(":root").style.setProperty('--color-' + selector + '-text', basecolortext);
    document.querySelector(":root").style.setProperty('--base-color-' + selector, basecolor);
    document.querySelector(":root").style.setProperty('--base-l-' + selector, (hsl.l*100)+'%');
}

$(document).ready(function() {
    $(".admin-colorpicker").each(function(){
        var picker = $(this);
        var selector = picker.data('color-selector');
        picker.spectrum({
            type: "text",
            showPalette: true,
            showAlpha: false,
            showButtons: false,
            allowEmpty: false,
            preferredFormat: "hsl",
            move: function(color) {
                updateThemeColors(selector, color.toHsl());
            }
        });
    });
});

//
// switch header logo alignment on the fly
//
$(document).on('change', '.select-logo-alignment input:radio', function() {
    var value = 'text-start';
    switch($(this).val()) {
        case 'left':
            value = 'text-start';
            break;
        case 'center':
            value = 'text-center';
            break;
        case 'right':
            value = 'text-end';
            break;
        default:
            value = 'text-start';
    }
    $('.place-main-header').removeClass('text-start').removeClass('text-center').removeClass('text-end').addClass(value);
});

//
// switch wide / boxed header image
//
$(document).on('change', '.select-banner-width input:radio', function() {
    var value = '';
    switch($(this).val()) {
        case 'wide':
            value = '';
            break;
        case 'boxed':
            value = 'boxed';
            break;
        default:
            value = '';
    }
    $('.wrap-image-header').removeClass('boxed').addClass(value);
});

//
// toggle allow/reject extensions on the fly
//
$(document).on('change', '.togglext', function() {
    switchExtensions();
});

//
// toggle percent % in progress bar on the fly
//
$(document).on('change', "#percent", function() {
    var $input = $(this);
    if ($input.is( ":checked" )) {
        $('.progress-group').addClass('fullp');
    } else {
        $('.progress-group').removeClass('fullp');
    }
}).change();

//
// change individual progress bar color on the fly
//
function updateSingleBar($newclass) {
    $('.progress-single .progress-bar').removeClass().addClass('progress-bar').addClass($newclass);
}

function updateDefaultBar($newclass) {
    $('.first-progress').data('color', $newclass);
    $('.first-progress').next().find('.progress-bar').removeClass().addClass('progress-bar').addClass($newclass);

    if ($('.first-progress').is(':checked')) {
        updateSingleBar($newclass);
    }
}
$(document).on('change', '.pro input:radio', function() {
    var newclass = $(this).data('color');
    updateSingleBar(newclass);
});

$(document).on('click', '.fake-uploader', function() {
    var target = $(this).data('up-target');
    $(target).click();
});

function checkFixedlabel(){
    var scroll = $(window).scrollTop();
    var lab = $('.fixed-label');
    var labw = lab.width();
    if (scroll > 180) {
        $('.fixed-label').addClass('open');
    } else {
        $('.fixed-label').removeClass('open');
    }
}

$(window).scroll(function (event) {
    checkFixedlabel();
});

function updateSlider(selector){
    // selector.each(function(){
        var target = selector.data('vfm-target');
        $(target).val(selector.val());
    // });
}

function updateSliderRuler(selector){
    // selector.each(function(){
        var target = selector.data('vfm-target');
        $(target).val(selector.val()).change();
    // });
}

 /** 
 * ****************************************
 * Veno file manager Admin DocReady calls
 * ****************************************
 */
$(document).ready(function () {

    $('.newusermail').keyup(function() {
        checkUserNotif();
    });

    $('#r-usermail').keyup(function() {
        checkUserNotif();
    });

    $(document).ready(function() {
        checkUserNotif();
    });

    $('.notify_again').on( 'click', function(){
        var form = $(this).closest('form');
        $("#usernotif_again").val('1');
        form.submit();
    });

    $('.easyeditor-wrapper .easyeditor').addClass('header-bg');

    $('#toggle-navbar-brand-view').on("change", function() {
        if($(this)[0].checked){
            $('.nav-brand-group').addClass('d-none');
        } else {
            $('.nav-brand-group').removeClass('d-none');
        }
    });

    $('.show-brand-text').on('click', function(){
        $(this).closest('.nav-brand-group').find('#navbar-brand-text').removeClass('d-none');
    });

    $('#dark_header').on("change", function() {
        if($(this)[0].checked){
            $('.easyeditor-wrapper .easyeditor, .header-bg').css({
                'background-color': 'var(--color-dark-lighter)',
                'color': 'var(--color-dark-text)'
            });
        } else {
            $('.easyeditor-wrapper .easyeditor, .header-bg').css({
                'background-color': 'transparent',
                'color': 'var(--color-light-text)'
            });
        }
    });

    // save settings fixed label
    $('.fixed-label').removeClass('d-none').addClass('animated');

    checkFixedlabel();

    $('.fixed-label').on('click', function(){
        $('#settings-form').submit();
    });

    //
    // toggle allow/reject extensions
    //
    switchExtensions();

    updateSlider($('.set-slider'));

    //
    // slider
    //
    $('.set-slider').on("change", function() {
        updateSlider($(this));
    });

    $('.get-slider').on("input", function() {
        updateSliderRuler($(this));
    });

    // change header padding preview
    var header_padding = $('input[name=header_padding]');

    $('.place-main-header').css({
        'padding-top': header_padding.val()+'px',
        'padding-bottom': header_padding.val()+'px'
    });

    header_padding.on("change", function(slideEvt) {
        $('.place-main-header').css({
            'padding-top': $(this).val()+'px',
            'padding-bottom': $(this).val()+'px'
        });
    });

    // change logo margin preview
    var logo_margin = $('input[name=logo_margin]');

    $('.logo-preview').css({
        'margin-bottom': logo_margin.val()+'px'
    });
    logo_margin.on("change", function(slideEvt) {
        $('.logo-preview').css({
            'margin-bottom': $(this).val()+'px'
        });
    });

    //
    // preview image
    //
    $('.logo-selector').on('change', function(){
        var file = $(this).prop("files")[0];
        var previewclass = $(this).data('target');
        var preview = $(previewclass);
        var reader  = new FileReader();
        reader.onloadend = function () {
            preview.closest('.placeheader').find('.deletelogo').removeClass('d-none');
            preview.closest('.nav-brand-group').find('#navbar-brand-text').addClass('d-none').removeClass('d-flex');
            preview.attr('src', reader.result);
            preview.removeClass('d-none');
        };
        if (file) {
            reader.readAsDataURL(file);
        } else {
            preview.closest('.placeheader').find('.deletelogo').addClass('d-none');
            preview.closest('.nav-brand-group').find('#navbar-brand-text').removeClass('d-none').addClass('d-flex');
            preview.attr('src', 'admin-panel/images/placeholder.png');
        }
    });

    //
    // toggle users panel
    //
    $('.toggle').each(function(){
        if (!$(this).find('input[type=checkbox]').prop('checked')){
            $(this).closest('.toggle').next().slideToggle();
        }
    });
    $('.toggle').find('input[type=checkbox]').change(function(){
        if($(this).closest('.toggle').next().length) {
            $(this).closest('.toggle').next().slideToggle();
        } else {
            $(this).closest('.toggle').parent('.toggle').next().slideToggle();
        }
    });

    $('.toggle-reverse').each(function(){
        if ($(this).find('input[type=checkbox]').prop('checked')){
            $(this).closest('.toggle-reverse').prev().slideToggle();
        }
    });
    $('.toggle-reverse').find('input[type=checkbox]').change(function(){
        $(this).closest('.toggle-reverse').prev().slideToggle();
    });

    $('.toggle-reverse-next').each(function(){
        if ($(this).find('input[type=checkbox]').prop('checked')){
            $(this).closest('.toggle-reverse-next').next().slideToggle();
        }
    });
    $('.toggle-reverse-next').find('input[type=checkbox]').change(function(){
        $(this).closest('.toggle-reverse-next').next().slideToggle();
    });

    //
    // activate tooltips
    //
    $('.tooltipper').tooltip();

    //
    // info (?) popover 
    //
    $('.pop').popover();

    //
    // logo uploader
    //
    $('.pop').popover();
    $('.btn-file :file').on('fileselect', function (event, numFiles, label) {
        var input = $(this).parents('.input-group').find(':text');  
        input.val(label);
    });
});


/**
 * VFMupdater plugin
 */
var VFMupdater = (function(){
    "use strict";

    function updateOutput(message){
        const wrapper = document.querySelector('.update-output');        
        wrapper.innerHTML += message + '<br>';
    }

    function updateOutputError(message){
        const wrapper = document.querySelector('.update-output-error');
        const content = wrapper.querySelector('pre');
        wrapper.classList.remove('d-none');
        content.innerHTML += message + '\n';
    }

    function actionCallback(response = false, callback = false){
        if (response) {
            if (response.error) {
                if (Array.isArray(response.error)) {
                    for(var error of response.error){
                        updateOutputError(error);
                    }
                } else {
                    updateOutputError(response.error);
                }
            }
            if (response.result) {
                updateOutput(response.result);
                if (callback) {
                    setTimeout(function() {
                        callback();
                    }, 1000);
                }
            } else {
                console.log(response);
                action('end');
                updateOutput('Update aborted');
            }
        }
    }

    function action(action = false, callback = false){
        if (action) {
            var formData = new FormData();
            formData.append("action", action);
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'json';
            xhr.open("POST", 'admin-panel/updater/ajax.php', true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onreadystatechange = function() { // Call a function when the state changes.
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    if (action == 'getkey') {
                        toggleKey(this.response);
                    } else {
                        actionCallback(this.response, callback);                        
                    }
                }
            };
            xhr.send(formData);
        }
    }

    function downloadPackage(){
        action('download', expandPackage);
    }

    function expandPackage(){
        action('expand', preparePackage);
    }

    function preparePackage(){
        action('prepare', replaceFiles);
    }

    function replaceFiles(){
        action('replace', endProcess);
    }

    function endProcess(){
        window.onbeforeunload = null;
        action('end', reloadPage);
        // action('end');
    }

    function reloadPage(){

        const output_error = document.querySelector('.update-output-error');

        if (output_error.classList.contains('d-none')) {
            var timeleft = 3;
            var downloadTimer = setInterval(function(){
              if(timeleft <= 0){
                clearInterval(downloadTimer);
                window.location.reload(true);
              } else {
                document.querySelector(".countdown").innerHTML = "The page will reload after: " + timeleft + " seconds";
              }
              timeleft -= 1;
            }, 1000);
        }
    }

    function toggleKey(key){
        if (key) {
            var key_input = document.querySelector('#purchase-code');
            key_input.value = key;
        }
    }

    function init(){
        var startupdate = document.querySelector('.start-update');
        if (startupdate) {
            startupdate.addEventListener('click', function(e){
                this.classList.add('d-none');

                window.onbeforeunload = function() {
                    return 'Please do not leave this page during the upgrade.';
                };
                downloadPackage();
            });
        }

        var update_btn = document.querySelector('.update-purchase-code');
        var key_input = document.querySelector('#purchase-code');

        if (key_input && update_btn) {
            key_input.addEventListener('input', function(e){
                update_btn.disabled = false;
            });

            var fake_key = document.querySelector('.fake-key');

            key_input.addEventListener('focus', function(e){
                fake_key.classList.add('d-none');
                key_input.classList.add('d-block');
            });
            key_input.addEventListener('blur', function(e){
                fake_key.classList.remove('d-none');
                key_input.classList.remove('d-block');
            });
            action('getkey');
        }
    }

    return {
        init
    };
}());

VFMupdater.init();

/**
 * VFMuserManager plugin
 */
var VFMuserManager = (function(){
    "use strict";

    const archivemap = document.querySelector('.archive-map');
    /**
     * Folder tree toggler
     */
    function treeToggler(close = false){
        // Toggle single folder
        $('.toggle-tree').on('click', function(){
            $(this).next('ul').slideToggle();
            $(this).find('.tree-toggler').toggleClass("bi-dash-square bi-plus-square");
        });

        // Toggle all folders
        $('.toggle-all-tree').on('click', function(){
            var treetoggler = $(this).find('.tree-toggler');
            treetoggler.toggleClass("bi-dash-square-fill bi-plus-square-fill");

            if (treetoggler.hasClass('bi-dash-square-fill')) {
                $('.toggle-tree').each(function(){
                    $(this).next('ul').show();
                    $(this).find('.tree-toggler').removeClass('bi-plus-square').addClass('bi-dash-square');
                });
            } else {
                $('.toggle-tree').each(function(){
                    $(this).next('ul').hide();
                    $(this).find('.tree-toggler').removeClass('bi-dash-square').addClass('bi-plus-square');
                });
            }
        });

        if (close == true) {
            $('.toggle-all-tree').trigger('click');
        }
    }

    function highLightMainFolder(){
        
        const rootfolders = archivemap.querySelectorAll('li.level-1');

        rootfolders.forEach(function(rootfolder){
            const highlight = rootfolder.querySelector('.highlight');
            if (highlight) {
                highlight.classList.add('d-none');
            }
        });

        const checkeds = archivemap.querySelectorAll('.setuserfolder:checked');

        checkeds.forEach(function(checked){

            const parentli = archivemap.querySelector(checked.dataset.target);
            const thisrootfolder = checked.closest('.level-1');
            const highlight = thisrootfolder.querySelector('.highlight');
            const rootcheck = thisrootfolder.querySelector('.setuserfolder');

            if (thisrootfolder && thisrootfolder !== parentli && !rootcheck.checked) {
                if (highlight) {
                    highlight.classList.remove('d-none');
                }
            }
        });
    }

    function updateCheckValues(opentree){
        let exclude_folders = [];
        let folder_values = [];

        const checkeds = archivemap.querySelectorAll('.setuserfolder:checked');
        checkeds.forEach(function(checked){
            const thisparentlist = checked.closest('li');
            const thischildren = thisparentlist.querySelector('ul');
            if (thischildren) {
                const thischildrenli = thischildren.querySelectorAll('.setuserfolder');
                thischildrenli.forEach(function(child){
                    child.checked = checked.checked;
                    child.disabled = checked.checked;
                    if (child.checked) {
                        exclude_folders.push(child.value);
                    }
                    
                });
            }

            if (!exclude_folders.includes(checked.value) ) {
                folder_values.push(decodeURIComponent(checked.value));
            }

        });
        highLightMainFolder();
        updateFoldertreeBtn(opentree, folder_values);
    }

    function updateCheckFolder(treefolder, opentree){
        const thisparentlist = treefolder.closest('li');
        const thischildren = thisparentlist.querySelector('ul');
        if (thischildren) {
            const thischildrenli = thischildren.querySelectorAll('.setuserfolder');
            thischildrenli.forEach(function(child){
                child.checked = treefolder.checked;
                child.disabled = treefolder.checked;
            });
        }
        updateCheckValues(opentree);
    }

    //
    // Select user folders
    //
    function initFolderTree(opentree){

        const treefolders = archivemap.querySelectorAll('.setuserfolder');

        treefolders.forEach(function(treefolder){
            treefolder.addEventListener('change', function(e){
                updateCheckFolder(treefolder, opentree);
            });
        });
        updateCheckValues(opentree);
        highLightMainFolder();
    }

    function callFiletree(opentree) {

        const wrapresult = archivemap.querySelector('.modal-result');
        const selected = opentree.querySelector('.getfolder');

        archivemap.addEventListener('hidden.bs.modal', event => {
            wrapresult.innerHTML = "";
            wrapresult.classList.remove('loaded', 'fade', 'show');
        });

        if (!wrapresult.classList.contains('loaded')) {
            wrapresult.innerHTML = '<div class="position-relative w-100 h-100 top-0 start-0 d-flex justify-content-center align-items-center" style="min-height: 160px;"><div class="spinner-border"><span class="visually-hidden">Loading...</span></div></div>';
            var request = $.ajax({
                url: "ajax/get-filetree.php",
                method: "POST",
                data: { 
                    // 'action' : action,
                    'currentdir' : '', 
                    '__root' : '',
                    'checkbox' : true,
                    'selected' : selected.value
                }
            });

            request.done(function( msg ) {

                wrapresult.classList.add('d-none', 'fade');

                wrapresult.innerHTML = JSON.parse(msg);
treeToggler(false);
                initFolderTree(opentree);

                wrapresult.classList.remove('d-none');
                wrapresult.classList.add('loaded', 'show');

            });

            request.fail(function( jqXHR, textStatus ) {
                wrapresult.innerHTML = "Request failed: " + textStatus;
            });


        }
    }

    /*
     * Update Folders button and input
     */
    function updateFoldertreeBtn(opentree, values){
        const getfolder = opentree.querySelector(".getfolder");
        const foldercount = opentree.querySelector(".getfolder-count");
        getfolder.value = JSON.stringify(values);
        foldercount.textContent = values.length;
        var togglequota = getfolder.closest('.togglequota');
        showHideQuota($(togglequota));
    }

    /*
     * Setup Folders button and input from settings
     */
    function initFolderTreeBtn() {
        const opentrees = document.querySelectorAll('.foldertree-btn');
        opentrees.forEach(function(opentree){
            const values = opentree.querySelector('.getfolder').value;
            if (values) {
                updateFoldertreeBtn(opentree, JSON.parse(values));
            }
        });

        // Open modal archive map
        let fileTreeModal = new bootstrap.Modal(document.getElementById("archive-map"), {});
        opentrees.forEach(function(opentree){
            const btn = opentree.querySelector('button');
            btn.addEventListener('click', function(){
                callFiletree(opentree);
                fileTreeModal.show();
            });
        });

    }

    function populateUserFields(){
        const modaluser = document.querySelector('#modaluser');

        if (!modaluser) {
            return false;
        }

        const usrblocks = document.querySelectorAll('.usrblock');
        const getuserfields = modaluser.querySelectorAll('.getuser');
        const objectConstructor = ({}).constructor;

        // Reset modal fields
        getuserfields.forEach(function(userfield){
            userfield.value = "";
        });

        usrblocks.forEach(function(usrblock){
            usrblock.addEventListener('click', function(e){
                e.preventDefault();
                let username = '';
                const thisRow = usrblock.closest('.userrow');
                const senduserdata = thisRow.querySelectorAll('.send-userdata');
                senduserdata.forEach(function(userdata){
                    const key = userdata.dataset.key;
                    const getvals = modaluser.querySelectorAll(".getuser-" + key);

                    // popuplate modal-user values
                    getvals.forEach(function(getval){
                        if (key === 'disabled') {
                            if (userdata.value == 1) {
                                getval.checked = true;
                            } else {
                                getval.checked = false;
                            }
                        } else {
                            if (key === 'name') {
                                username = userdata.value;
                            }
                            var json = false;
                            try {  
                                json = JSON.parse(userdata.value);  
                            } catch (e) {  
                                // console.log('invalid json');
                            }
                            if (json.constructor === objectConstructor) {
                                json.forEach(function(value, index){
                                    const thisfield = modaluser.querySelector(".getuser-"+key+ " option[value='" + value + "']")
                                    if (thisfield) {
                                        thisfield.selected = true;
                                    }
                                });
                            } else {
                                if (getval) {
                                    getval.value = userdata.value;
                                }   
                            }
                        }
                    });
                });

                const modaltitle = modaluser.querySelector(".modal-title .modalusername")
                modaltitle.innerText = username;

                const getpass = modaluser.querySelector("#r-userpassnew");
                getpass.value = "";

                // Populate user-modal folders
                let data = [];
                const hiddenfolders = thisRow.querySelectorAll(".s-userfolders");
                hiddenfolders.forEach(function(hiddenfolder){
                    data.push(hiddenfolder.value);
                });

                const btn = modaluser.querySelector('.foldertree-btn');
                updateFoldertreeBtn(btn, data);      

                checkUserNotif();
            });
        });
    }

    function init(){
        initFolderTreeBtn();
        populateUserFields();
    }

    return {
        init
    };
}());

VFMuserManager.init();
