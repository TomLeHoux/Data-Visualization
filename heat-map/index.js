async function init() {
    const margin = {left: 70, bottom: 90}
    const width  = 1200 - margin.left;
    const height = 450 - margin.bottom;
    var dataset = [];

    await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
        .then(res => res.json())
        .then(data => dataset = data);
        
    const baseTemp = dataset.baseTemperature;
    const meses = [
        'January', 'February', 'March', 'April',
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
    ];
    const colorSize = 30;
    const colorPoints = d3.range(...d3.extent(dataset.monthlyVariance, d => d.variance), 1.3).map(d => d.toFixed(1));

    // Escala de cores.
    const colorScale = d3.scaleSequential()
        .domain(d3.extent(dataset.monthlyVariance, d => d.variance).reverse())
        .interpolator(d3.interpolateRdBu)

    var years = new Set();
    var months = new Set();
    for (var key of dataset.monthlyVariance) {
        year = key.year; month = key.month;
        if (!years.hasOwnProperty(year)) { years.add(year) };
        if (!years.hasOwnProperty(month)) { months.add(month) };
    };

    const xScale = d3.scaleBand()
        .domain(years)
        .range([0, width])
        
    const yScale = d3.scaleBand()
        .domain(Array.from(months.values()).reverse())
        .range([height, 0])

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    const svg = d3.select("svg");

    const bars = svg.selectAll("rect")
        .data(dataset.monthlyVariance)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.variance))
        .classed("cell", true)
        .attr("data-month", d => d.month-1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance)
        .attr("transform", `translate(${margin.left}, 0)`)
        .on("mouseover", function(event, d) { // Quando o mouse passar por cima da barra.
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "2px")
            
            const temp = (d.variance+baseTemp).toFixed(1)
            const variance = (d.variance).toFixed(1)

            tooltip.html(`${d.year} - ${meses[d.month-1]}<br><br>${temp}C°<br>${variance}C°`)
                .attr("data-year", d.year)
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            })
        .on("mouseout", function(d) {
            d3.select(this)
                .style("stroke", "black")
                .style("stroke-width", "0px")
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

    // Título do eixo X.
    svg.append("text")
        .attr("transform", `translate(${width/2}, ${height+40})`)
        .text("Years")

    // Título do eixo Y.
    svg.append("text")
        .attr("transform", `translate(20, ${height/2}) rotate(270)`)
        .text("Months")
        
    // Escala de cores da legenda.
    const legendScale = d3.scaleLinear()
        .domain(colorPoints)
        .range([0, colorSize])

    const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(year => {if (year % 10 == 0) return year}));
    const yAxis = d3.axisLeft(yScale).tickFormat(d => meses[d-1]);
    const xLegend = d3.axisBottom(legendScale)
        .tickValues(colorPoints)
        .tickFormat(d => (parseFloat(d)+baseTemp).toFixed(1))

    // Eixo X.
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height})`)
        .attr("id", "x-axis")
        .call(xAxis)

    // Eixo Y.
    const yAxisGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .attr("id", "y-axis")
        .call(yAxis)
            
    // Legenda eixo X.
    const xLegendGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${height+colorSize+30})`)
        .call(xLegend)


    // Legenda.
    svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${margin.left}, ${height+30})`)
        .selectAll("rect")
        .data(colorPoints.slice(0, -1))
        .enter()
        .append("rect")
        .attr("x", (d,i) => i*colorSize)
        .attr("y", 0)
        .attr("width", colorSize)
        .attr("height", colorSize)
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .attr("fill", d => colorScale(d));
}; init();