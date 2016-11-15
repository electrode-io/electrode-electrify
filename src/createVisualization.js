import pretty from 'prettysize';
import schemes from './schemes';
import d3 from 'd3';
import { arc, initArc, bounceHigh, arcTween, hoverTween, rotateTween } from './utils';
import createModes, { highlightMode } from './mode';
import createPalette from './palette';
import map from 'lodash/map';
import each from 'lodash/each';

export default function renderElectrify(stats) {
    const root = stats,
      height = 500,
      width = 850,
      radius = Math.min(width, height) * 0.45,
      deg = 120
    
    const modeInitial = stats.mode || 'size'
    const modeFns = {
        count: () => 1
      , size: (d) => d.size
    }
    
    const svg = d3.select('.chart').append('svg')
      .attr("preserveAspectRatio", "xMinYMin meet") 
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2},${height * .52})`)

    createPalette(schemes, useScheme, changeAssetScheme);

    const partition = d3.layout.partition()
      .sort(null)
      .size([2 * Math.PI, radius * radius])
      .value(modeFns[modeInitial])

    //
    // Creates the title text in
    // the center of the rings.
    //
    const title = svg.append('text')
      .text(root.name)
      .attr('x', 0)
      .attr('y', -5)
      .style('font-size', '18px')
      .style('fill', 'white')
      .style('font-weight', 500)
      .style('alignment-baseline', 'middle')
      .style('text-anchor', 'middle')

    //
    // Likewise, this is the file
    // percentage size stat below the title
    //
    const percentageSize = svg.append('text')
      .text(pretty(root.value || root.size))
      .attr('x', 0)
      .attr('y', 20)
      .style('fill', 'white')
      .style('font-size', '16px')
      .style('font-weight', 300)
      .style('alignment-baseline', 'middle')
      .style('text-anchor', 'middle')

    //
    // Likewise, this is the file
    // size stat below the title
    //
    const size = svg.append('text')
      .text('(' + pretty(root.value || root.size) + ')')
      .attr('x', 0)
      .attr('y', 40)
      .style('fill', 'white')
      .style('font-size', '16px')
      .style('alignment-baseline', 'middle')
      .style('text-anchor', 'middle')

    //
    // Each arc is wrapped in a group element,
    // to apply rotation transforms while
    // changing size and shape.
    //
    const groups = svg.datum(root).selectAll('g')
      .data(partition.nodes)
      .enter()
      .append('g')
      .attr('transform', `rotate(${deg})`)

    const maxdepth = groups[0].reduce((max, el) => Math.max(max, el.__data__.depth), 0)

    //
    // Actually create the arcs for each
    // file.
    //
    const path = groups.append('path')
      .attr('d', initArc)
      .attr('display', d => d.depth ? null : 'none')
      .style('stroke', '#2B2B2B')
      .style('stroke-width', '0')
      .style('fill-rule', 'evenodd')
      .each(function(d) {
        d.x0 = d.x
        d.dx0 = d.dx
        d.el = this
      })

    let found = [];
    const _select = (node, selector) => {
      node.enabled = selector(node);
      if (node.enabled) {
        found.push(node);
      }
      if (node.children) {
        for (let c of node.children) {
          _select(c, selector);
        }
      }
    }
    _select(root, () => true);

    d3.select('#search').on('keyup', function() {
      const text = this.value.replace(/^\s+/, "").replace(/\s+$/, "")
      if (text.length > 0) {
        found = [];
        const re = new RegExp(text, 'i');
        _select(root, (node) => node.name.match(re) !== null);
        if (found.length === 1) {
          title.text(found[0].name)
          size.text(pretty(found[0].value || found[0].size))
        } else {
          title.text("Multiple found")
          let completeSize = 0
          for (let n of found) {
            completeSize += n.size;
          }
          size.text(`${pretty(completeSize)} total`)
        }
      } else {
        _select(root, () => true);
      }
      groups
        .select('path')
        .transition()
        .duration(200)
        .style('opacity', d => {
          return d.enabled ? 1.0 : 0.2
        })
    })

    //
    // Colour scheme functionality.
    //
    // Triggered immediately with the default
    // scheme, must be passed a d3 selection.
    //
    let background
      , scheme = 0
      , specials
      , color

    useScheme(scheme)
    function useScheme(n) {
      specials = schemes[n].specials

      const colors = schemes[n].main
      Object.keys(specials).forEach((key) => {
        const idx = colors.indexOf(specials[key].toLowerCase())
        if (idx === -1) return
        colors.splice(idx, 1)
      })

      color = d3.scale
        .ordinal()
        .range(colors)

      let _path = path.transition()
        .duration(600)
        .ease(bounceHigh, 1000)
        .delay(d => d.x * 100 + d.y / maxdepth * 0.06125);

      _path.style('fill', (d) => {
        const name = d.children ? d.name : d.parent.name
        d.c = schemes[n].modifier.call(d
          , specials[name] || color(name)
          , root
        )
        return d.c
      })
    }

    let ptrans = 0
    path.transition()
      .duration(1000)
      .each(() => ptrans++)
      .ease('elastic', 2, 1)
      .delay((d, i) => d.x * 100 + (i % 4) * 250 + d.y / maxdepth * 0.25)
      .attr('d', arc)
      .each('interrupt', () => {
        d3.select('#search').transition().duration(200).style('opacity', 1)
      })
      .each('end', () => {
        ptrans--;
      })

    //
    // Rotates the newly created
    // arcs back towards their original
    // position.
    //
    let gtrans = 0
    groups.transition()
      .duration(3250)
      .each(() => gtrans++)
      .delay((d, i) => d.x * 100 + (i % 4) * 250 + d.y / maxdepth * 0.25 + 250)
      .attrTween('transform', rotateTween(deg))
      .each('end', () => {
        gtrans--;
        if (ptrans === 0 && gtrans === 0) {
          d3.select('#search').transition().duration(200).style('opacity', 1)
        }
      })

    groups.on('mouseover', (d) => {
      highlight(d)
      title.text(d.name)

      let sizeInPercentage = (d.value/root.value*100).toFixed(2);
      percentageSize.text(sizeInPercentage + " %")

      size.text('(' + pretty(d.value || d.size) + ')')
    }).on('mouseout', (d) => {
      unhighlight(d)
      title.text(root.name)
      size.text(pretty(root.value || root.size))
    })

    highlight.tween = hoverTween(1)
    function highlight(d) {
      if (d.el) d3.select(d.el)
        .transition()
        .delay(d => (d.depth - 1) * 300 / maxdepth)
        .ease('back-out', 10)
        .duration(500)
        .attrTween('d', highlight.tween)
        .style('fill', d => d.c)

      if (d.children) {
        let i = d.children.length
        while (i--) highlight(d.children[i])
      }
    }

    unhighlight.tween = hoverTween(0)
    function unhighlight(d) {
      if (d.el) d3.select(d.el)
        .transition()
        .delay(d => (d.depth - 1) * 300 / maxdepth)
        .ease('back-out', 4)
        .duration(500)
        .attrTween('d', unhighlight.tween)
        .style('fill', d => d.c)

      if (d.children) {
        let i = d.children.length
        while (i--) unhighlight(d.children[i])
      }
    }

    createModes(updateMode);

    updateMode(modeInitial, false)

    function updateMode(mode, update) {
      highlightMode(mode);

      if (!update) return

      groups
        .data(partition.value(modeFns[mode]).nodes)
        .select('path')
        .transition()
        .duration(1500)
        .attrTween('d', arcTween)
    }
  ///////////////////////////  ASSET VISUALIZATION  //////////////////////////////////////////
    const barHeight = 70;
    const assetData = stats.assets.sort((x,y) => d3.ascending(y.size, x.size));
    const maxAssetFileSize = d3.max(map(assetData, (d)=>d.size));
    const minAssetFileSize = d3.min(map(assetData, (d)=>d.size));
    const logScale = d3.scale
      .log()
      .domain([minAssetFileSize, maxAssetFileSize])
      .range([0, width])

    each(assetData, (asset)=> asset.logScaledSize = logScale(asset.size))

    const chart = d3.select('.assets').append("svg");
    chart.attr("preserveAspectRatio", "xMinYMin meet") 
      .attr("viewBox", `0 0 ${width} ${barHeight*assetData.length*2}`)
      .append("g")
      .classed("asset")

    const asset = chart.selectAll("g.asset")
      .data(assetData)
      .enter()
      .append("g")

    asset.append("text")
      .attr("y", (d,i) => i*barHeight*2)
      .attr("dy", "1em")
      .text((d) => d.name)
      .style("font-size", "2em")
      .style('fill', 'white')

    let bars = asset.append('rect')
      .attr("transform", (d,i) => `translate(30,${i*barHeight*2+barHeight})`)
      .attr('height', barHeight*0.7)
      .attr('width', (d => d.size))

    bars.style('fill', changeAssetScheme(0))
      .attr('width', '0')
      .transition()
      .duration(2000)
      .attr('width', (d) => d.logScaledSize)

    bars
      .on('mouseover', function() { //do not use arrow fn
        d3.select(this)
          .transition()
          .ease('back-out', 5)
          .duration(500)
          .attr('height', barHeight*0.8)
        })
      .on('mouseleave', function() { //do not use arrow fn
        d3.select(this)
          .transition()
          .ease('back-out', 5)
          .duration(500)
          .attr('height', barHeight*0.7)
        })

    asset.append("text")
      .attr("x", "50")
      .attr("y", (d,i) => i*barHeight*2+barHeight*1.35)
      .attr("dy", ".35em")
      .text((d) => pretty(d.size))
      .style("font-size", "2.6em")
      .style('fill', 'white')
      .on('mouseover', function(d, i) { //do not use arrow fn
        bars.each(function(e, j){
          if( j == i){
            d3.select(this)  
              .transition()
              .ease('back-out', 5)
              .duration(500)
              .attr('height', barHeight*0.8)
          }
        })
      })
      .on('mouseleave', function(d, i) { //do not use arrow fn
        bars.each(function(e, j){
          if (j == i){
            d3.select(this)  
              .transition()
              .ease('back-out', 5)
              .duration(500)
              .attr('height', barHeight*0.7)
          }
        })
      })

    function changeAssetScheme(n) {
      const mainColor = schemes[n].main[0];
      if(bars) { 
        bars.transition()
        .duration(1000)
        .ease(bounceHigh, 1000)
        .delay(() => Math.random()*800)
        .style("fill", mainColor)
      }
      return mainColor;
    }
  }