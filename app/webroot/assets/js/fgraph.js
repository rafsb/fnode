const
PRISM = {
    ALIZARIN:"#E84C3D"
    , PETER_RIVER:"#2C97DD"
    , SUN_FLOWER:"#F2C60F"
    , AMETHYST:"#9C56B8"
    , TURQUOISE:"#00BE9C"
    , EMERLAND: "#39CA74"

    , POMEGRANATE: "#BE3A31"
    , BELIZE_HOLE: "#2F81B7"
    , ORANGE: "#F19B2C"
    , WISTERIA: "#8D48AB"
    , GREEN_SEA: "#239F85"
    , NEPHRITIS: "#30AD63"
};

class FGraph {

    axis(o){
        if(this.node){

            const
            rects = this.rects
            , fsize = app.em2px()
            ;;
            // Y axis
            !o.noyaxis&&this.node.app(
                SVG("path", "--axis --y", { d: [
                    "M"
                    , [ 0, 0 ]
                    , "L"
                    , [ 0, rects.height ]
                ].join(" ") }, { "stroke-width": o.strokeWidth || 2, fill: "none", stroke: o.strokeColor || app.colors("FONT") + "44" })
            );
            // X axis
            !o.noxaxis&&this.node.app(
                SVG("path", "--axis --x", { d: [
                    "M"
                    , [ 0          , rects.height ]
                    , "L"
                    , [ rects.width, rects.height ]
                ].join(" ") }, { "stroke-width": o.strokeWidth || 2, fill: "none", stroke: o.strokeColor || app.colors("FONT") + "44" })
            )            
        }
    }

    guides(o){
        if(this.node){

            const
            rects   = this.rects
            , fsize = app.em2px()
            , ydots = 2 + (o.ydots || 2)
            , xdots = 2 + (o.xdots || 4)
            , ypace = rects.height / ydots
            , xpace = rects.width / xdots
            , node  = this.node
            ;;
            // Y Guides
            !o.noxguides&&app.iterate(0, xdots, i => {
                node.app(
                    SVG("path", "--guide --x", { d: [
                        "M"
                        , [ i * xpace, 0            ]
                        , "L"
                        , [ i * xpace, rects.height ]
                    ].join(" ") }, { stroke: o.strokeColor || app.colors("FONT") + "0A", "stroke-width": o.strokeWidth || 1 })
                )
            });
            // X Guides
            !o.noyguides&&app.iterate(0, ydots, i => {
                node.app(
                    SVG("path", "--guide --y", { d: [ 
                        "M"
                        , [ 0, i * ypace ]
                        , "L"
                        , [ rects.width, i * ypace ] 
                    ].join(" ") }, { stroke: o.strokeColor || app.colors("FONT") + "0A", "stroke-width": o.strokeWidth || 1 })
                )
            });
        }
    }

    draw(o){
        if(this.target&&this.node){
            app.series_ = o.series;
            const
            target     = this.target
            , node     = this.node
            , rects    = this.rects
            , entities = o.series.extract(serie => serie.extract(s => s.key)[0])
            , series   = o.series.extract(serie => serie.extract(s => s.content.array())[0])
            , labels   = o.series.extract(serie => serie.extract(s => s.content.keys())[0])[0]
            , xmax     = series.extract(s => s.length).calc(MAX)
            , ymax     = Math.max(1, series.extract(s => s.calc(MAX)).calc(MAX)*1.1)
            , fsize    = app.em2px()             
            , xpace    = rects.width / xmax
            , colors   = this.colors
            , labelbar = DIV("-absolute -row -zero-bottom-left -flex")
            , entitybar= DIV("-absolute -zero-top-right -flex", { padding:'.25em', 'flex-direction': 'column' })
            ;;

            !o.nolabels&&labels.tiny(2 + (o.xdots || 4)).each(l => labelbar.app(SPAN(l, '-ellipsis -content-center', { padding: '.25em' })))

            var type;;
            switch(this.type.toLowerCase()){
                case "line"     : type = "L"    ; break;
                case "default"  : type = "L"    ; break;
                case "smooth"   : type = "S"    ; break;
                case "curve"    : type = "C"    ; break;
            }

            entities.each((name, idx) => {

                const
                serie   = series[idx]
                , color = colors[idx] ? colors[idx] : PRISM.array()[idx%PRISM.array().length]
                , h = rects.height
                , d = [ "M" ]
                ;;

                if(!serie.length) return;

                // Calculate last posituin
                serie.pop();
                serie.push(serie.calc(TREND))
                serie.push(serie.calc(TREND))

                !o.noentities&&entitybar.app(
                    DIV("-content-right", { padding:".25em", background: 'linear-gradient(to left, ' + o.css.background + ',' + o.css.background + ', transparent)' }).app(
                        DIV("-right -circle", { height:"1em", width: "1em", marginLeft: "1em", background:color, border: '1px solid ' + app.colors('FONT') + '44' })
                    ).app(
                        SPAN(name, "-right")
                    )
                )
                
                serie.each((n, i) => {

                    n = n ? n : 0.0001;

                    const
                    x = parseInt(i * xpace)
                    , y =  parseInt(Math.min(h - h * n / ymax, h - fsize * 2))
                    , plate = node.get(".-hint-plate")[i]
                    ;

                    if(!plate) node.app(
                        SVG("rect", "-hint-plate -pointer --tooltip", { 
                            width: type == "bars" ? fsize : xpace
                            , height: type == "bars" ? h - y  : h 
                            , x: x
                            , y: type == "bars" ? h - y : 0
                        }, { 
                            fill: type == "bars" ? color : app.colors("FONT")+44
                            , opacity:type == "bars" ? 1 : 0 
                        }).on("mouseenter", function(){ 
                            $("#"+node.uid()+" .-hint-plate").not(this).stop().anime({ opacity: type == "bars" ? .32 : 0 });
                            this.css({ opacity: type == "bars" ? 1 : .16 })
                        }).on("mouseleave", function(){ 
                            $("#"+node.uid()+" .-hint-plate").stop().anime({ opacity: type == "bars" ? .64 : 0 }) 
                        }).data({ tip: "<b>" + labels[i] + "</b><br/>" + name + ": " + (n*1.0).nerdify() + "<br/>" })
                    ); else plate.dataset.tip = plate.dataset.tip + name +": " + (n*1.0).nerdify() + "<br/>";

                    if(type=="C") d.push([ parseInt(x - xpace / 2), y ]);
                    d.push([ x, y ]);
                    if(!i) d.push(type);
                    if(type=="C") d.push([ parseInt(x + xpace / 2), y ]);
                });

                if(type == "S" && serie.length % 2 == 0) d.push([ rects.width, (h * serie.last() / ymax) ]);
                if(type != "bars") node.app(SPATH(d.join(" "), "--line -avoid-pointer", { fill:"none", stroke: color, "stroke-width": 3 }))
            });
            
            target.app(entitybar).app(labelbar);

            app.tooltips();
        }
    }

    constructor(o){
        this.target = (o.target || (this.target || $("#app")[0])).css({ overflow: 'hidden' }).empty();
        this.rects  = this.target.getBoundingClientRect();
        this.type   = o.type || "line";
        this.colors = o.colors || PRISM;
        
        o.css = binds({ background: app.colors("BACKGROUND") }, o.css || {})
        
        if(!this.node){
            const
            cls    = "-absolute -zero"
            , attr = binds({ height: this.rects.height, width: this.rects.width, "viewBox": "0 0 " + this.rects.width + " " + this.rects.height }, o.attr || {})
            , css  =  binds({ }, o.css || {})
            ;;
            this.node = SVG("svg", cls, attr, css)
        }
        this.target.app(this.node);

        const pallete = app.colors(), base = { color: pallete.FONT+"AA", strokeColor: pallete.FONT+"22"};
        if(!o.noaxis) this.axis(binds(base, o.axis||{}));
        if(!o.noguides) this.guides(binds(base, o.guides || {}));
        if(o.series&&o.series.length) this.draw(o);
    }
}