(function($){

rocket.pageview.index = rocket.pageview.extend({

    el: '#index_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.index_header(
            $.extend({}, me.options)
            ,me
        ));

        me.setup(new rocket.subview.index_lines(
            $.extend({}, me.options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()
                // @note: omit form keydown
                && $(e.target).closest('form').length == 0){
                ec.trigger('keydown', {
                    event: e
                });
            }
        });
    }

});

})(Zepto);
