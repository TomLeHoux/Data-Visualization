async function init() {
    const margin = {left: 100}
    const height = 600;

    const countries = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
    const education = await d3.json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json");

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    const points = d3.extent(education, d => d.bachelorsOrHigher)

    const colorScale = d3.scaleLinear()
        .domain(d3.extent(education, d => d.bachelorsOrHigher))
        .range(["#e7e5a7", "#c97a7a"])

    const getEducation = (id, key) => { return education.filter(data => { return data.fips == id })[0][key] }

    d3.json(countries).then(async topology => {  
        var geojson = topojson.feature(topology, topology.objects.counties);

        var svg = d3.select("svg");
        var path = d3.geoPath();
        svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county")
        .attr("data-fips", d => getEducation(d.id, "fips"))
        .attr("data-education", d => getEducation(d.id, "bachelorsOrHigher"))
        .attr("fill", (d) => colorScale(getEducation(d.id, "bachelorsOrHigher")))
        .on("mouseover", function(event, d) {
            const info = education.filter(data => { return data.fips == d.id })[0];
            tooltip.html(`${info.area_name}, ${info.state}: ${info.bachelorsOrHigher}%`)
                .attr("data-fips", getEducation(d.id, "fips"))
                .attr("data-education", getEducation(d.id, "bachelorsOrHigher"))
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

        const colorSize = 50
        const countries_points = d3.range(...points, 10);

        const legendScale = d3.scaleLinear()
            .domain(countries_points)
            .range([0, colorSize])
 
        const xLegend = d3.axisBottom(legendScale)
            .tickValues(countries_points)
            .tickFormat(d => `${d}%`)
    
        svg.append("g")
            .attr("transform", `translate(${margin.left}, ${height+colorSize+30})`) 
            .call(xLegend)
                
        svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${margin.left}, ${height+30+(colorSize/2)})`)
            .selectAll("rect")
            .data(countries_points.slice(0, -1))
            .enter()
            .append("rect")
            .attr("x", (d,i) => i*colorSize)
            .attr("y", 0)
            .attr("width", colorSize)
            .attr("height", colorSize/2)
            .style("stroke", "black")
            .style("stroke-width", "1px")
            .attr("fill", d => colorScale(d));           
    })


}; init();