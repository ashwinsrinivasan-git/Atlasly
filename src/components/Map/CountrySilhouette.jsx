import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { normalizeName } from '../../utils/geography';

const CountrySilhouette = ({ topo, targetName, theme = 'light' }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!topo || !svgRef.current || !targetName) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const features = topojson.feature(topo, topo.objects.countries).features;
        const normTarget = normalizeName(targetName);

        const target = features.find(f =>
            normalizeName((f.properties && f.properties.name) || "") === normTarget
        );

        if (!target) return;

        const width = 520;
        const height = 420;

        // Fit projection to feature
        const projection = d3.geoMercator()
            .fitSize([width - 60, height - 60], target);

        const path = d3.geoPath().projection(projection);

        // Theme colors
        let fill = "#2563eb";
        let stroke = "#1e40af";

        if (theme === "dark") {
            fill = "#3b82f6";
            stroke = "#1d4ed8";
        } else if (theme === "ocean") {
            fill = "#0ea5e9";
            stroke = "#0284c7";
        }

        // Add filter for drop shadow
        const defs = svg.append("defs");
        const filter = defs.append("filter")
            .attr("id", "drop-shadow")
            .attr("height", "130%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");

        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 2)
            .attr("dy", 4)
            .attr("result", "offsetBlur");

        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "offsetBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        svg.append("path")
            .datum(target)
            .attr("d", path)
            .attr("transform", "translate(30, 30)")
            .attr("fill", fill)
            .attr("stroke", stroke)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .style("filter", "url(#drop-shadow)")
            .attr("opacity", 0);

        // Animate in
        svg.select("path")
            .transition().duration(1000).ease(d3.easeExpOut)
            .attr("opacity", 1);

    }, [topo, targetName, theme]);

    return (
        <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 520 420"
            style={{ maxWidth: '600px', maxHeight: '500px', margin: '0 auto', display: 'block' }}
            aria-label="Country silhouette"
        />
    );
};

export default CountrySilhouette;
