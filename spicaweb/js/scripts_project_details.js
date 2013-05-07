
function get_url_root() {
    var path = window.location.href;
    var path_list = path.split('/');
    path_list.pop();
    path_list.pop();
    var root_url = path_list.join('/');
    return root_url;
}

$(document).ready(function() {

    // enable popover info box
    $('.info-button').popover({trigger: "hover", html: "true"});

    // 
    $("form#create-new-project>button").button();
   
    // check form input, before submit
    $("form#upload-labeling").submit(function(e){

        // check labeling name
        var isFormValid = true;

        var labeling_name = $("form#upload-labeling input#data_name").val()
        var labeling_file = $("form#upload-labeling span.fileupload-preview").html();
        if(!isValidLabelingName(labeling_name)) {
            form_alert("upload-labeling", "Incorrect labeling name");
            isFormValid = false;
        }
        else if(labeling_file == '') {
            form_alert("upload-labeling", "No labeling file selected");
            isFormValid = false;
        }
        else {
            $("form#upload-labeling>button").button('loading');
        }

        return isFormValid;
    });



    $('a.download').bind('click', function(event) {
        var data_type = $(this).parent().attr('class');
        var data_name = $(this).attr('id');
        var url = get_url_root() + '/download?data_type=' + data_type +
                '&data_name=' + data_name;
        event.preventDefault();
        window.location.href=url;
    });

    $('.upload').bind('click', function() {
        
        var data_name = $(this).attr('id')
 
        $( ".dialog#" + data_name ).dialog({
            autoOpen: true,
            height: 210,
            width: 400,
            modal: true,
            buttons: {
                "Upload file": function() {
                    var url = get_url_root() + '/upload';
                    $(".upload#" + data_name).attr('action', url);
                    $(".upload#" + data_name).submit();
                    $( this ).dialog( "close" );
                },
                Cancel: function() {
                    $( this ).dialog( "close" );
                }
            },
            close: function() {
            }
        });
 
        $( ".upload#" + data_name )
            .click(function() {
                $( ".dialog#" + data_name ).dialog( "open" );
            });

        $( "input#lname" )
            .change(function() {
                var lab_id = $("input#data_name").val();
                $("a.upload.labeling").attr("id", lab_id);
                $("form.upload.labeling").attr("id", lab_id);
            });
    });
});

// hide alerts
function hide_alerts() {
    $("form > div.alert").remove()
}

// show alert msg above the submit button of the form with form_id
function form_alert(form_id, msg) {
    hide_alerts();
    $("form#" + form_id + "> :submit").before(
    '<div class="alert alert-block alert-error fade in"><p>' + msg + '</p></div>'
    );
}

// check labeling name
function isValidLabelingName(projectid) {
    return /^([0-9a-zA-Z_-]){1,30}$/.test(projectid);
}
