async function init() {
    var dataset = [];

    await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
        .then(res => res.json())
        .then(data => dataset = data);
    
    
    // // Converte as datas presente no dataset.
    dataset.forEach(d => {
        d.Year = (d3.timeParse("%Y"))(d.Year);
        d.Time = d3.timeParse("%M:%S")(d.Time);
    });

    // Dimensões do gráfico.
    const margin = {bottom: 20, left: 70 };
    const width = 900 - margin.left;
    const height = 600 - margin.bottom;

    // Escala X (tempo).
    var minYear = d3.min(dataset, d => d.Year);
    var maxYear = d3.max(dataset, d => d.Year);
    minYear = d3.timeYear.offset(minYear, -1);
    maxYear = d3.timeYear.offset(maxYear, 1);

    const xScale = d3.scaleTime()
        .domain([minYear, maxYear])
        .range([0, width]);

    // Escala Y (linear).
    const yScale = d3.scaleTime()
        .domain(d3.extent(dataset, d => d.Time))
        .range([0, height])

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // Adiciona barras no gráfico.
    const svg = d3.select("svg")
    svg.selectAll("circle")
        .data(dataset)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year)) // Posição X.
        .attr("cy", d => yScale(d.Time)) // Posição Y.
        .attr("r", 7) // Raio do circulo.
        .classed("dot", true) // Classe.
        .attr("id", d => ((d.Doping != "") ? "doping":"no-doping"))
        .attr("data-xvalue", d => d.Year)
        .attr("data-yvalue", d => d.Time.toISOString())
        .on("mouseover", function(event, d) { // Quando o mouse passar por cima da barra.
            d3.select(this).style("stroke-width", "3px") // Altera a cor da barra selecionada.
            tooltip.html(`${d.Name}: ${d.Nationality}<br>Year: ${d.Year.getFullYear()}, Time: ${d.Time.getMinutes()}:${d.Time.getSeconds()}${((d.Doping != "") ? "<br><br>"+d.Doping:"")}`)
                .attr("data-year", d.Year)
                .attr("data-xvalue", d.Time)
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            })
        .on("mouseout", function(d) {
            d3.select(this).style("stroke-width", "1px") // Altera a cor da barra selecionada.
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        

    // Eixo X.
    const xAxisGroup = svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("id", "x-axis");

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));

    // Eixo Y.
    const yAxisGroup = svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .attr("id", "y-axis");
    const yAxis = d3.axisRight(yScale).tickFormat(d3.timeFormat("%M:%S"));

    // Adiciona os eixos.
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // Título do eixo Y.
    svg.append("text")
    .attr("transform", `translate(${width + 45},${height/2}) rotate(90)`)
    .style("text-anchor", "middle")
    .text("Time in Minutes");


    const legendGroup = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - 250}, ${height/10})`);

    const legendItems = [
        {"text": "No doping allegations", "id":"no-doping"},
        {"text": "Riders with doping allegation", "id":"doping"}
    ]
    legendGroup.selectAll("text")
        .data(legendItems)
        .enter()
        .append("text")
        .text(d => d.text)
        .attr("id", "legend")
        .attr("y", (d, i) => i * 20)

    legendGroup.selectAll("rect")
        .data(legendItems)
        .enter()
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("y", (d, i) => (i * 20)-11.25)
        .attr("x", -20)
        .attr("id", d => d.id)
}; init();