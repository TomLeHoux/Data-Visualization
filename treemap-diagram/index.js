async function init() {
    const width  = 900;
    const height = 450;

    var data = await fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json")
        .then(res => res.json())
        .then(data => data.children);

    
    const root = d3.hierarchy({children: data}, d => d.children)
        .sum(d => { return d.value; });

    const treemapLayout = d3.treemap()
        .size([width - 100, height])
        .padding(1)
        // .round(true)

    treemapLayout(root);

    const cores = {
        "Action": "#5C3C92",
        "Drama": "#2E4053",
        "Adventure": "#229954",
        "Family": "#C0392B",
        "Animation": "#E74C3C",
        "Comedy": "#F39C12",
        "Biography": "#8E44AD"
      }
                  
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);


    var nodes = d3.select("svg")
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => parseInt(d.data.value))
        .attr("class", "tile")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", d => cores[d.data.category])
        .on("mouseover", function(event, d) {
            tooltip.html(`Name: ${d.data.name}<br>Category: ${d.data.category}<br>Value: ${d.data.value}`)
                .attr("data-value", d.data.value)
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })


    var labels = d3.select("svg")
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => d.y0)
        .attr("font-size", "12px")
        .attr("fill", "white")
        .selectAll("tspan")
        .data(function(d) {
            console.log(d);
            const maxX = d.x1 - d.x0;
            const maxY = d.y1 - d.y0;
            const charWeight = 8;

            if (d.data.name.length * charWeight > maxX) {
                const words = d.data.name.split(/[\s-]+/);
                let new_lines = [[]];
                let words_size = 0;
                let line_index = 0;

                for (let word of words) {
                    if (word.length * charWeight > maxX) {
                        const letters = Math.floor((maxX - (word.length * charWeight)) / charWeight);
                        word = word.slice(0, letters);
                    }

                    if (new_lines.length * 23 > maxY) break

                    if ((words_size + word.length) * charWeight > maxX) {
                        new_lines.push([]);
                        line_index++;
                        words_size = 0;
                    };

                    new_lines[line_index].push(word);
                    words_size += word.length;
                };

                let new_data = [];
                for (let line of new_lines) {
                    let this_line = _.cloneDeep(d);
                    this_line.data.name = line.join(" ");
                    new_data.push(this_line);
                };
                return new_data;
            }
            return d
        })
        .enter()
        .append("tspan")
        .text(d => d.data.name)
        .attr("x", d => d.x0 + 5)
        .attr("dy", "1.2em");
        

    const legendGroup = d3.select("svg")
        .append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${width - 70}, ${height / 2 - 50})`);
        
    legendGroup.selectAll("text")
        .data(Object.entries(cores))
        .enter()
        .append("text")
        .text(d => d[0])
        .attr("x", 0)
        .attr("y", (d, i) => i * 20)
        .attr("font-size", "12px")

    legendGroup.selectAll("rect")
        .data(Object.entries(cores))
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", d => d[1])
        .attr("y", (d, i) => (i * 20) - 11.55)
        .attr("x", -20)
    
}; init();