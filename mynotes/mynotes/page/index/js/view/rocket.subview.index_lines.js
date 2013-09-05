(function($){

rocket.subview.index_lines = rocket.subview.extend({

    el: '#index_page_lines'

    ,lineTemplate: _.template($('#template_index_lines').text())

    ,init: function(options){
        var me = this;

        me.model = new rocket.model.article_list(
            {}
            ,$.extend({}, me.options)
        );

        me.isFirstLoad = true;
        me.contextNum = 49;

        me.$currentLine = null;

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);

        me.model.on('change', me.onmodelchange, me);

        ec.on('keydown', me.onkeydown, me);
    }

    ,render: function(model){
        var me = this,
            data = model.getData();

        switch(me.getRenderMode(model)){
            case 'APPEND':
                console.log(data);
                me.$el.append(
                    me.lineTemplate({
                        articles: data 
                    })
                );
                break;
            case 'PREPEND':
                me.$el.prepend(
                    me.lineTemplate({
                        articles: data 
                    })
                );
                break;
        }

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.hideLoading();
            me.highlightFirstLine();
        }
    }

    ,getRenderMode: function(model){
        var me = this,
            data = model.getData(),
            $lines = me.$('.line'),
            firstLineNo,
            lastLineNo;

        if(!$lines.length){
            return 'APPEND';
        } 

        firstLineNo = $lines.first().find('.line-number').text();
        lastLineNo = $lines.last().find('.line-number').text();

        if(data[0].article_id - 0 < firstLineNo - 0){
            return 'PREPEND';
        }

        if(data[0].article_id - 0 > lastLineNo - 0){
            return 'APPEND';
        }
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        me.render(model);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            if(me.isFirstLoad){
                me.model.fetch({
                    reqdata: {
                        from_article_id: 1
                        ,context_num: me.contextNum
                    }
                });
            }
            me.show();
        }
    }

    ,onkeydown: function(params){
        var me = this,
            e = params.event,
            key = e.which; 

        switch(key){
            // "g" key down
            case 71:
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "o" key down
            case 79:
                me.goArticle();
                break;

            // "j" key down
            case 74:
                me.goDown();
                break;

            // "k" key down
            case 75:
                me.goUp();
                break;

            // "/" key down
            case 191:
                me.startSearch();
                e.preventDefault();
                e.stopPropagation();
                break;

        }
    }

    ,highlightFirstLine: function(){
        var me = this,
            $lines = me.$('.line'),
            $firstLine = $lines.first();

        if($firstLine.length){
            me.$currentLine 
                && me.$currentLine.removeClass('current-line');
            $firstLine.addClass('current-line');
            me.$currentLine = $firstLine;
        }
    }

    ,highlightLastLine: function(){
        var me = this,
            $lines = me.$('.line'),
            $lastLine = $lines.last();

        if($lastLine.length){
            me.$currentLine 
                && me.$currentLine.removeClass('current-line');
            $lastLine.addClass('current-line');
            me.$currentLine = $lastLine;
        }
    }

    ,highlightNextLine: function(){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $nextLine = $currentLine.next();

        if($nextLine.length){
            $currentLine.removeClass('current-line');
            $nextLine.addClass('current-line');
            me.$currentLine = $nextLine;
        }
    }

    ,highlightPrevLine: function(){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $prevLine = $currentLine.prev();

        if($prevLine.length){
            $currentLine.removeClass('current-line');
            $prevLine.addClass('current-line');
            me.$currentLine = $prevLine;
        }
    }

    ,goFirst: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightFirstLine();
        me.scrollIntoView();
    }

    ,goLast: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightLastLine();
        me.scrollIntoView();
    }

    ,goDown: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightNextLine();
        me.scrollIntoView();

        if(me.isArrivingEnd('next')){
            console.log('arriving tail...');
            me.getMoreNext();
        }
    }

    ,goUp: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightPrevLine();
        me.scrollIntoView();

        if(me.isArrivingEnd('prev')){
            console.log('arriving head...');
            me.getMorePrev();
        }
    }

    ,scrollIntoView: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }
        
        var $line = me.$currentLine, 
            viewHeight = me.$el.height(),
            viewScrollTop = me.el.scrollTop,
            lineTop = $line[0].offsetTop,
            lineHeight = $line.height();

        // console.log([
        //     viewHeight
        //     ,viewScrollTop
        //     ,lineTop
        //     ,lineHeight
        // ].join('_'));

        // @note: 当前行向下跑出视口
        if(lineTop + lineHeight > viewHeight + viewScrollTop){
            me.el.scrollTop = lineTop + lineHeight - viewHeight;
        }
        // @note: 当前行向上跑出视口
        else if(lineTop < viewScrollTop){
            me.el.scrollTop = lineTop;
        }

    }

    // 是否接近两端
    ,isArrivingEnd: function(direction){
        var me = this,
            $currentLine = me.$currentLine, 
            i = 3;

        if(!$currentLine.length
            || direction != 'prev'
                && direction != 'next'){
            return false;
        }

        while(i > 0){
            $currentLine = $currentLine[direction]();   
            if($currentLine.length == 0){
                break;
            }
            i--;
        } 

        // 距两端3行时触发
        if(i == 1){
            return true;
        }
        return false;
    }







    ,getMorePrev: function(){
        var me = this,
            $firstLine = me.$('.line').first(),
            articleID = 0; // 1-based

        if($firstLine.length){
            articleID = $firstLine.find('.line-number').text();
        }

        me.model.fetch({
            reqdata: {
                from_article_id: articleID - me.contextNum - 1 
                ,context_num: me.contextNum
            }
        });
    }

    ,getMoreNext: function(){
        var me = this,
            $lastLine = me.$('.line').last(),
            articleID = 0; // 1-based

        if($lastLine.length){
            articleID = $lastLine.find('.line-number').text();
        }

        me.model.fetch({
            reqdata: {
                from_article_id: articleID - 0 + 1 
                ,context_num: me.contextNum
            }
        });
    }

    ,goArticle: function(){
        var me = this;
        if(me.$currentLine){
            me.navigate([
                '#article'
                ,'/'
                ,me.$currentLine.find('.line-number').text()
            ].join(''));
        }
    }

    ,startSearch: function(){
        var me = this; 
        me.ec.trigger('startsearch');
    }

});

})(Zepto);
