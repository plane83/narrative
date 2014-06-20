/**
 * KBase widget to display an lists within categories.
 */
(function($, undefined) {
    $.KBWidget({
        name: 'CategoryViewWidget',
        version: '1.0.0',
        options: {
            data: null
        },
        init: function(options) {
            this._super(options);
            return this.render();
        },
        render: function() {
            // creater main comtainer
            var index = Math.floor((Math.random()*1000)+1);
            var main  = $('<div>').attr('id', index);
            // Create accordian
            if (this.options.data !== null) {
                main.addClass('panel-group');
                var i, j;
                for (i = 0; i < this.options.data.length; i++) {
                    var catid = index+'_'+i;
                    var cnum  = this.options.data[i]['items'].length
                    var clist = $('<ul>').addClass('list-group').css({'margin':'2','padding':'2'});
                    for (j = 0; j < cnum; j++) {
                        clist.append(
                            $('<li>').addClass('list-group-item')
                                .css({'margin':'2','padding':'2'})
                                .html(this.options.data[i]['items'][j])
                        );
                    }
                    main.append(
                        $('<div>').addClass('panel panel-default').css({'margin':'2','padding':'2'})
                        .append(
                            $('<div>').addClass('panel-heading').css({'margin':'2','padding':'2'}).append(
                                $('<h4>').addClass('panel-title').css({'margin':'2','padding':'2'}).append(
                                    $('<a>').attr({'data-toggle':'collapse', 'data-parent':'#'+index, 'href':'#'+catid})
                                        .append($('span').addClass('badge').html(cnum))
                                        .html(this.options.data[i]['title'])
                                )
                            )
                        ).append(
                           $('<div>').attr('id', catid).css({'margin':'2','padding':'2'}).addClass('panel-collapse collapse').append(
                               $('<div>').addClass('panel-body').css({'margin':'2','padding':'2'}).append(clist)
                            )
                        )
                    );
                }
            }
            // put container in cell
            this.$elem.append(main);
            return this;
        }
    });
})(jQuery);