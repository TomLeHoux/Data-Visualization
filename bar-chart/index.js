async function init() {
    var dataset = [];

    await fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
        .then(res => res.json())
        .then(data => dataset = data.data);
    
    
    // Converte as datas presente no dataset.
    const parseTime = d3.timeParse("%Y-%m-%d"); // Formato ano-mês-dia.
    dataset.forEach(d => {
        d[0] = parseTime(d[0]);
        d[1] = +d[1]
    });

    // Dimensões do gráfico.
    const margin = {bottom: 20, left: 50 };
    const width = 900 - margin.left;
    const height = 450 - margin.bottom;

    // Escala X (tempo).
    const xScale = d3.scaleTime()
        .domain(d3.extent(dataset, d => d[0]))
        .range([0, width]);

    // Escala Y (linear).
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d[1])])
        .range([height, 0]);

    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // Adiciona barras no gráfico.
    const svg = d3.select("svg")
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d[0])) // Posição X.
        .attr("y", d => yScale(d[1])) // Posição Y.
        .attr("width", 3.2) // Tamanho X.
        .attr("height", d => height - yScale(d[1])) // Tamanho Y.
        .classed("bar", true) // Classe.
        .attr("fill", "#938e9b")
        .attr("data-date", d => d[0].toISOString().substring(0, 10))
        .attr("data-gdp", d => d[1])
        .on("mouseover", function(event, d) { // Quando o mouse passar por cima da barra.
            d3.select(this).attr("fill", "#625f67") // Altera a cor da barra selecionada.
            
            tooltip.html(`${d3.timeFormat("%Y/%m/%d")(d[0])}<br>$${d[1].toLocaleString('en-US')} Billion`)
                .attr("data-date", d[0].toISOString().substring(0, 10))
                .attr("data-gdp", d[1])
                .style("left", `${event.pageX}px`)
                .style("top", `${event.pageY}px`);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("fill", "#938e9b")
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
    const yAxis = d3.axisRight(yScale);

    // Adiciona os eixos.
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

}; init();