import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { normalizeName } from '../../utils/geography';

import earthTexture from '../../assets/earth_texture.png';

const CountrySilhouette = ({ topo, targetName, theme = 'light' }) => {
    const svgRef = useRef(null);

    useEffect(() => {
        if (!topo || !svgRef.current || !targetName) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("path").remove(); // Clear paths but keep defs

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

        // Styling
        // We use the pattern 'earth-pattern' defined below

        svg.append("path")
            .datum(target)
            .attr("d", path)
            .attr("transform", "translate(30, 30)")
            .attr("fill", "url(#earth-pattern)")
            .attr("stroke", "rgba(255,255,255,0.4)")
            .attr("stroke-width", 2) // Thicker stroke for 3D rim effect
            .attr("stroke-linejoin", "round")
            .style("filter", "url(#realistic-shadow)")
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
            preserveAspectRatio="xMidYMid meet"
            style={{ maxWidth: '100%', maxHeight: '100%', margin: '0 auto', display: 'block', overflow: 'visible' }}
            aria-label="Country silhouette"
        >
            <defs>
                <pattern id="earth-pattern" patternUnits="userSpaceOnUse" width="520" height="420">
                    <image href={earthTexture} x="0" y="0" width="520" height="420" preserveAspectRatio="xMidYMid slice" />
                </pattern>
                <filter id="realistic-shadow" height="150%">
                    {/* Inner shadow for 3D depth */}
                    <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />
                    <feOffset in="blur" dx="4" dy="8" result="offsetBlur" />
                    <feFlood floodColor="rgba(0,0,0,0.5)" result="color" />
                    <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />

                    {/* Bevel/Emboss feel */}
                    <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.75" specularExponent="20" lightingColor="#ffffff" result="specular">
                        <fePointLight x="-5000" y="-10000" z="20000" />
                    </feSpecularLighting>
                    <feComposite in="specular" in2="SourceAlpha" operator="in" result="specular" />
                    <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litObj" />

                    <feMerge>
                        <feMergeNode in="shadow" />
                        <feMergeNode in="litObj" />
                    </feMerge>
                </filter>
            </defs>
        </svg>
    );
};

export default CountrySilhouette;
