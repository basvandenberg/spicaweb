function updateContent(labeling_name, class_ids, feat_ids, changed_classes, changed_features) {

    if(feat_ids.length == 0) {
        $("div#feat_error").remove()
        $("ul.histograms").before(
            '<div id="feat_error" class="alert alert-info alert-error fade in"><p><strong>Info:</strong><br />Select one ore more features using the <a href="http://localhost:8080/spice/doc/tutorial1.html#filter-sidebar">feature filter</a> in the right panel. The right panel is closed by default, click on the dark gray box with the arrow to open it.</p></div>'
        );
    }
    else {
        $("div#feat_error").remove()
    }

    if(class_ids.length < 1) {
        $("div#class_error").remove()
        $("ul.histograms").before(
            '<div id="feat_error" class="alert alert-info alert-error fade in"><p><strong>Info:</strong><br />Select one ore more labels using the <a href="http://localhost:8080/spice/doc/tutorial1.html#filter-sidebar">label filter</a> in the right panel. The right panel is closed by default, click on the dark gray box with the arrow to open it.</p></div>'
        );
    }
    else {
        $("div#class_error").remove()
    }

    if(class_ids.length > 2) {
        $("div#class_error").remove()
        $("ul.histograms").before(
            '<div id="feat_error" class="alert alert-info alert-error fade in"><p><strong>Info:</strong><br />Currently, you cannot visualize more than two labels at the same time in a histogram. Please, select one or two labels using the <a href="http://localhost:8080/spice/doc/tutorial1.html#filter-sidebar">label filter</a> in the right panel.</p></div>'
        );
    }
    else {
        $("div#class_error").remove()
    }

    var count = 0;

    // add/update/remove histograms based on feature and label selection
    $("ol.feats li").each(function () {
        var currentId = $(this).attr('id');
        var hist_li = $("li.hist#" + currentId);
        if($(this).hasClass('ui-selected')) {
            if(hist_li.length == 0) {
                show_hist(currentId, class_ids);
            }
            else if(changed_classes) {
                $("li.hist#" + currentId).remove();
                show_hist(currentId, class_ids);
            }
        }
        else {
            $("li.hist#" + currentId).hide('fast', function(){ $("li.hist#" + currentId).remove(); });
        }
    });

}

// obtain histogram and show
function show_hist(cid, class_ids) {

    // remove histograms if no class labels are selected
    if(class_ids.length < 1 || class_ids.length > 2) {

        $("li.hist").hide('fast', function(){$("li.hist").remove();});
        //$("li.loadhist").hide('fast', function(){$("li.loadhist").remove();});
    }
    else {

        var spinner = $('<img>')
            .attr('src', '../../img/loading1.gif')
            .attr('width', '40px')
            .attr('height', '40px');
        var loading = $('<div></div>')
            .addClass('loading')
            .append(spinner);

        $('#histogram-list').append(
            $('<li>')
                .attr('id', cid)
                .addClass('hist')
                .append(loading)
        );

        // construct post data
        var labels_str = class_ids.join(",");
        var labeling = $("select#labeling_select").val()
        
        url = 'ahistogram?feat_ids=' + cid
                      + '&labeling_name=' + labeling
                      + '&class_ids=' + labels_str;

        $.getJSON(url, function(data) {

            console.log(data);

            var feat_id = data['feature-id'];
            $('#' + feat_id).empty();

            var width = 840;
            var height = 300;

            var margin = 10;
            var title_height = 20;
            var x_axis_height = 60;
            var y_axis_width = 20;

            var grid_width = width - 2 * margin - y_axis_width;
            var grid_height = height - 
                    (2 * margin + x_axis_height + title_height);

            var num_hists = data['legend'].length;
            var num_bins = data[data['legend'][0]].length;

            var total_bin_width = Math.floor(grid_width / num_bins);
            var margin_between_bins = 3;

            var margin_between_bars = 1;
            if((total_bin_width - (2 * margin_between_bins)) % 2 == 0) {
                margin_between_bars = 2;
            }

            var bar_width = (total_bin_width
                    - (2 * margin_between_bins)
                    - ((num_hists - 1) * margin_between_bars)) / 2;

            var max_bar_height = height - (2 * margin + title_height + x_axis_height);

            var y_grid = data['y-grid'];
            var y_step = max_bar_height / y_grid[y_grid.length - 1];

            var x_grid = data['bin-edges'];
            var x_step = total_bin_width / x_grid[x_grid.length - 1];

            var max_x = x_grid[x_grid.length - 1];
            var min_x = x_grid[0];
            function x_px(x_val) {

                var perc = (x_val - min_x) / (max_x - min_x);
                var x = perc * grid_width;
                return margin + y_axis_width + x;
            }

            var max_y = y_grid[y_grid.length - 1];
            var min_y = y_grid[0];
            function y_px(y_val) {

                var perc = (y_val - min_y) / (max_y - min_y);
                var y = perc * grid_height;
                return height - (margin + x_axis_height + y);
            }

            // viewport
            var svg = d3.select('#' + feat_id)
              .append('svg')
                .attr('width', width)
                .attr('height', height);

            var y_offset = height - (margin + x_axis_height)
            var x_offset = margin + y_axis_width

            // y grid lines
            var y_grid_lines = svg.append('g')
                .selectAll('line.y-grid')
                .data(y_grid)
              .enter()
                .append('line')
                .attr('class', 'y-grid')
                .attr('stroke', '#999999')
                .attr('stroke-width', '1px')
                .attr('x1', x_offset)
                .attr('y1', function(d){
                    return y_px(d);
                })
                .attr('x2', width - margin)
                .attr('y2', function(d) {
                    return y_px(d);
                });

            // y grid labels
            var y_grid_labels = svg.append('g')
                .selectAll('text.y-grid')
                .data(y_grid)
              .enter()
                .append('text')
                .attr('class', 'y-grid')
                .attr('font-size', '9pt')
                .style('text-anchor', 'end')
                .text(function(d) {
                    return d.toString();
                })
                .attr('x', margin + y_axis_width - 4)
                .attr('y', function(d) {
                    return y_px(d) + 4;
                })

            // x grid lines
            var x_grid_lines = svg.append('g')
                .selectAll('line.x-grid')
                .data(x_grid)
              .enter()
                .append('line')
                .attr('class', 'x-grid')
                .attr('stroke', '#999999')
                .attr('stroke-width', '1px')
                .attr('y1', y_offset)
                .attr('x1', function(d){
                    return x_px(d);
                })
                .attr('y2', margin + title_height)
                .attr('x2', function(d) {
                    return x_px(d);
                });

            // x grid labels
            var x_grid_labels = svg.append('g')
                .selectAll('text.x-grid')
                .data(x_grid)
              .enter()
                .append('text')
                .attr('class', 'x-grid')
                .attr('font-size', '9pt')
                .style('text-anchor', 'end')
                .text(function(d) {
                    return d.toFixed(3);
                })
                .attr('x', 0)
                .attr('y', 0)
                .attr('transform', function(d) {
                    return 'translate(' + (x_px(d) + 5).toString() + ', ' + (height - margin - x_axis_height + 10).toString() + ') rotate(-65)';
                });

            // x axis label
            var x_axis_label = svg.append('g')
                .append('text')
                .attr('class', 'x-axis-label')
                .text(data['x-label'])
                .style('text-anchor', 'middle')
                .attr('x', (grid_width / 2) + margin + y_axis_width)
                .attr('y', height - (margin + 3))

            // histograms
            var colors = ['#204a87', '#fce94f', '#204a87', 'fce94f'];
            for(var leg_i = 0; leg_i < data['legend'].length; leg_i++) {

                var legend = data['legend'][leg_i];
                var hist_data = data[legend];

                var g = svg.append('g');
                g.selectAll('rect')
                    .data(hist_data)
                  .enter()
                    .append('rect')
                    .attr('stroke', '#2e3436')
                    .attr('stroke-width', 1)
                    .attr('fill', function(d, i) {

                        return colors[leg_i];
                    })
                    .attr('x', function(d, i) {

                        var x_off = x_px(x_grid[i]);
                        return x_off
                                + margin_between_bins
                                + leg_i * (bar_width + margin_between_bars);
                    })
                    .attr('y', function(d) {

                        return y_offset - d * y_step;
                    })
                    .attr('width', bar_width)
                    .attr('height', function(d) {

                        return d * y_step;
                    });
            }

            // legend
            svg.append('g')
                .selectAll('text.legend')
                .data(data['legend'])
              .enter()
                .append('text')
                .attr('class', 'legend')
                .style('text-anchor', 'end')
                .text(function(d) {
                    return d;
                })
                .attr('x', width - (margin + 27))
                .attr('y', function(d, i) {
                    return margin + title_height + 18 + i*20;
                });

            svg.append('g')
                .selectAll('rect.legend')
                .data(data['legend'])
              .enter()
                .append('rect')
                .attr('fill', function(d, i) {
                    return colors[i];
                })
                .attr('width', 13)
                .attr('height', 13)
                .attr('x', width - (margin + 23))
                .attr('y', function(d, i) {
                    return margin + title_height + 6 + i*20;
                })
                .attr('stroke', '#2e3436')
                .attr('stroke-width', '1px')

            // title
            svg.append('g')
                .append('text')
                .text(data['title'])
                .attr('x', margin + y_axis_width)
                .attr('y', 20);
        });
        
        return false;
    }
}
