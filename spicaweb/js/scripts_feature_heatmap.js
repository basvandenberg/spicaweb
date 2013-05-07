// global settings
var min_num_classes = 1;
var max_num_classes = 7;
var min_num_features = 1;
var max_num_features = Infinity;

function updateContent(labeling_name, class_ids, feat_ids, changed_classes, changed_features) {

    // TODO should also work for one feature...
    if(feat_ids.length < 2) {
        $("div#heatmap img").replaceWith($('<img>'))
        $("div#feat_error").remove()
        $("div#heatmap").before(
            '<div id="feat_error" class="alert alert-info alert-error fade in"><p><strong>Info: </strong>Select two or more features using the feature filter in the right panel.</p></div>'
        );
    }
    else {
        $("div#feat_error").remove()
    }

    if(class_ids.length < 1) {
        $("div#heatmap img").replaceWith($('<img>'))
        $("div#class_error").remove()
        $("div#heatmap").before(
            '<div id="class_error" class="alert alert-info alert-error fade in"><p><strong>Info: </strong>Select one or more labels using the label filter in the right panel</p></div>'
        );
    }
    else {
        $("div#class_error").remove()
    }

    if(feat_ids.length > 1 && class_ids.length > 0){

        $("div#heatmap img").replaceWith(
            $('<img>')
                .attr({'src':'aheatmap?feat_ids=' + feat_ids + 
                                     '&labeling_name=' + labeling_name + 
                                     '&class_ids=' + class_ids + 
                                     '&figtype=png'})
                .load(function() {
                })
            )
        return false;
    }
}
