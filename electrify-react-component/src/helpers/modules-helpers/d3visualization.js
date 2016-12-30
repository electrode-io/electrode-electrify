import d3 from "d3";
import pretty from "prettysize";
import schemes from "./schemes";
import { arc, initArc, bounceHigh, /*arcTween,*/ hoverTween, rotateTween } from "./d3-utils";

/*eslint-disable no-magic-numbers*/

export default function (root, svgElement) { //eslint-disable-line func-style, max-statements
  const width = 850;
  const height = 500;
  const radius = Math.min(width, height) * 0.45;
  const deg = 120;
  const modeFns = {
    count: () => 1,
    size: (d) => d.size
  };

// create repsonsive SVG canvas
  const svg = d3.select(svgElement)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("overflow", "visible")
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

//partition data by file size initially
  const partition = d3.layout.partition()
    .sort(null)
    .size([2 * Math.PI, radius * radius])
    .value(modeFns.size);

//title text in the center of the rings.
  const title = svg.append("text")
    .text(root.name)
    .attr("x", 0)
    .attr("y", -5)
    .style("font-size", "18px")
    .style("fill", "white")
    .style("font-weight", 500)
    .style("alignment-baseline", "middle")
    .style("text-anchor", "middle");

//file percentage size below the title hardcoded to 100% in intial render
  const percentageSize = svg.append("text")
    .text("100%")
    .attr("x", 0)
    .attr("y", 20)
    .style("fill", "white")
    .style("font-size", "16px")
    .style("font-weight", 300)
    .style("alignment-baseline", "middle")
    .style("text-anchor", "middle");

//file size below the title
  const size = svg.append("text")
    .text(`("${pretty(root.value || root.size)})`)
    .attr("x", 0)
    .attr("y", 40)
    .style("fill", "white")
    .style("font-size", "16px")
    .style("alignment-baseline", "middle")
    .style("text-anchor", "middle");

// Each arc is wrapped in a group element to apply rotation transforms while
// changing size and shape.
  const groups = svg.datum(root).selectAll("g")
    .data(partition.nodes)
    .enter()
    .append("g")
    .attr("transform", `rotate(${deg})`);
  const maxdepth = groups[0].reduce((max, el) => Math.max(max, el.__data__.depth), 0);

// create the arcs for each file.
  const path = groups.append("path")
    .attr("d", initArc)
    .attr("display", (d) => d.depth ? null : "none") //eslint-disable-line no-arrow-condition
    .style("stroke", "#2B2B2B")
    .style("stroke-width", "0")
    .style("fill-rule", "evenodd")
    .each(function (d) {
      d.x0 = d.x;
      d.dx0 = d.dx;
      d.el = this; //eslint-disable-line no-invalid-this
    });

//
// TODO: link this search function to the input in the navbar
//

  /*
  let found = [];
  const _select = (node, selector) => {
    node.enabled = selector(node);
    if (node.enabled) {
      found.push(node);
    }
    if (node.children) {
      for (const c of node.children) {
        _select(c, selector);
      }
    }
  };
  _select(root, () => true);

  d3.select(domElements.search).on("keyup", function () {
    const text = this.value.replace(/^\s+/, "").replace(/\s+$/, "");
    if (text.length > 0) {
      found = [];
      const re = new RegExp(text, "i");
      _select(root, (node) => node.name.match(re) !== null);
      if (found.length === 1) {
        title.text(found[0].name);
        size.text(pretty(found[0].value || found[0].size));
      } else {
        title.text("Multiple found");
        let completeSize = 0;
        for (const n of found) {
          completeSize += n.size;
        }
        size.text(`${pretty(completeSize)} total`);
      }
    } else {
      _select(root, () => true);
    }
    groups
      .select("path")
      .transition()
      .duration(200)
      .style("opacity", (d) => {
        return d.enabled ? 1.0 : 0.2;
      });
  });
  */

// color scheme
  function useScheme() { //eslint-disable-line func-style
    const specials = schemes.specials;
    const colors = schemes.main;

    Object.keys(specials)
      .forEach((k) => {
        const idx = colors.indexOf(specials[k].toLowerCase()); //
        if (idx === -1) { return; }
        colors.splice(idx, 1);
      });

    const color = d3.scale
      .ordinal()
      .range(colors);

    const _path = path.transition()
      .duration(600)
      .ease(bounceHigh, 1000)
      .delay((d) => d.x * 100 + d.y / maxdepth * 0.06125);

    _path.style("fill", (d) => {
      const name = d.children ? d.name : d.parent.name;
      d.c = specials[name] || color(name);
      return d.c;
    });
  }
  useScheme();

//Rotates the newly created arcs back towards their original position.
  let ptrans = 0;
  path.transition()
    .duration(1000)
    .each(() => ptrans++)
    .ease("elastic", 2, 1)
    .delay((d, i) => d.x * 100 + (i % 4) * 250 + d.y / maxdepth * 0.25)
    .attr("d", arc)
    .each("end", () => {
      ptrans--;
    });
  let gtrans = 0;
  groups.transition()
    .duration(3250)
    .each(() => gtrans++)
    .delay((d, i) => d.x * 100 + (i % 4) * 250 + d.y / maxdepth * 0.25 + 250)
    .attrTween("transform", rotateTween(deg))
    .each("end", () => {
      gtrans--;
      // if (ptrans === 0 && gtrans === 0) {
      //   d3.select(domElements.search).transition().duration(200).style("opacity", 1);
      // }
    });

//highlight & expand relevant arcs on mouseover
  function highlight(d) { //eslint-disable-line func-style
    if (d) {
      d3.select(d.el)
        .transition()
        .delay((d) => (d.depth - 1) * 300 / maxdepth) //eslint-disable-line no-shadow
        .ease("back-out", 10)
        .duration(500)
        .attrTween("d", highlight.tween)
        .style("fill", (d) => d.c); //eslint-disable-line no-shadow
    }
    if (d.children) {
      let i = d.children.length;
      while (i--) { highlight(d.children[i]); }
    }
  }
  highlight.tween = hoverTween(1);

  function unhighlight(d) { //eslint-disable-line func-style
    if (d.el) {
      d3.select(d.el)
        .transition()
        .delay((d) => (d.depth - 1) * 300 / maxdepth) //eslint-disable-line no-shadow
        .ease("back-out", 4)
        .duration(500)
        .attrTween("d", unhighlight.tween)
        .style("fill", (d) => d.c); //eslint-disable-line no-shadow
    }
    if (d.children) {
      let i = d.children.length;
      while (i--) { unhighlight(d.children[i]); }
    }
  }

  unhighlight.tween = hoverTween(0);

  groups
    .on("mouseover", (d) => {
      highlight(d);
      title.text(d.name)
      .style("font-size", `${Math.min(radius / d.name.length, 40)}px`);
      const sizeInPercentage = (d.value / root.value * 100).toFixed(2);
      percentageSize.text(`${sizeInPercentage}%`);
      size.text(`(${pretty(d.value || d.size)})`);
    })
    .on("mouseout", (d) => {
      unhighlight(d);
      title.text(root.name);
      size.text(pretty(root.value || root.size));
      percentageSize.text(`${(root.value / root.size) * 100}%`);
    });

//
//TODO: link updateMode function to MUI mode selection buttons
//
  /*
  const updateMode = function (mode, update) {
    groups
      .data(partition.value(modeFns[mode]).nodes)
      .select("path")
      .transition()
      .duration(1500)
      .attrTween("d", arcTween);
  };
  */
}
