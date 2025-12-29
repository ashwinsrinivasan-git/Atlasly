import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, PerspectiveCamera, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { normalizeName } from '../../utils/geography';
import earthTextureSrc from '../../assets/earth_texture.png';

// Utility: Convert GeoJSON feature to Three.js Shapes
function featureToShapes(feature) {
    const shapes = [];
    const projection = d3.geoMercator().fitSize([200, 200], feature); // Slightly larger
    const geometries = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];

    geometries.forEach(polygon => {
        const outerRing = polygon[0];
        const shape = new THREE.Shape();

        outerRing.forEach((point, i) => {
            const [x, y] = projection(point);
            if (i === 0) shape.moveTo(x, -y);
            else shape.lineTo(x, -y);
        });

        for (let i = 1; i < polygon.length; i++) {
            const holePath = new THREE.Path();
            const ring = polygon[i];
            ring.forEach((point, j) => {
                const [x, y] = projection(point);
                if (j === 0) holePath.moveTo(x, -y);
                else holePath.lineTo(x, -y);
            });
            shape.holes.push(holePath);
        }
        shapes.push(shape);
    });
    return shapes;
}

const CountryMesh = ({ feature, status, onClick, name }) => {
    const meshRef = useRef();
    const [hovered, setHover] = useState(false);

    const shapes = useMemo(() => featureToShapes(feature), [feature]);

    const extrudeSettings = useMemo(() => ({
        depth: status === 'visited' ? 4 : (status === 'guessed' ? 3 : 1),
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelSegments: 2
    }), [status]);

    // Colors
    const color = useMemo(() => {
        if (hovered) return '#fbbf24'; // Amber hover
        if (status === 'visited') return '#3b82f6'; // Blue
        if (status === 'guessed') return '#10b981'; // Green
        return '#4b5563'; // Grey
    }, [status, hovered]);

    // Emissive
    const emissive = useMemo(() => {
        if (hovered) return '#f59e0b';
        if (status === 'visited') return '#1d4ed8';
        if (status === 'guessed') return '#047857';
        return '#1f2937';
    }, [status, hovered]);

    return (
        <mesh
            ref={meshRef}
            onClick={(e) => { e.stopPropagation(); onClick(name); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
            onPointerOut={(e) => setHover(false)}
        >
            <extrudeGeometry args={[shapes, extrudeSettings]} />
            <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.2}
                emissive={emissive}
                emissiveIntensity={0.4}
            />
            {hovered && (
                <Html distanceFactor={100}>
                    <div className="tooltip">
                        {name}
                        {status === 'visited' && ' (Visited)'}
                        {status === 'guessed' && ' (Solved)'}
                    </div>
                </Html>
            )}
        </mesh>
    );
};

const WorldGlobe = ({ topo, profile, onToggleVisited }) => {
    if (!topo) return null;

    const features = useMemo(() => {
        return topojson.feature(topo, topo.objects.countries).features;
    }, [topo]);

    // We can't render ONLY individual meshes for the whole world in this detailed extrusion way efficiently without optimizations. 
    // BUT for ~200 countries, if we keep poly count low (bevelSegments=2), it might be acceptable for a "Premium" mode.
    // Let's filter out tiny islands to save performance if needed, or just go for it.

    // Position/Layout Logic:
    // This is tricky. d3.geoMercator projects to a 2D plane. We are positioning them in 3D space.
    // The previous Country3D component projected *each country individually* to center it.
    // If we want a WORLD map, we need a single projection for ALL countries.
    // BUT `CountryMesh` logic above uses `fitSize([200,200], feature)` which centers EACH country.
    // We need to change that logic.

    // Actually, "Ashwin Mode" requested a "World Map View".
    // Let's create a flat map view (Mercator) in 3D space, which is interactive.
    // It's cooler than a simple 2D SVG because it tilts and has depth.

    const projection = useMemo(() => {
        // Create a single global projection
        return d3.geoMercator().scale(150).translate([480, 250]); // Arbitrary scale/translate, we'll center via <Center>
    }, []);

    // We need a modified shape generator that uses the GLOBAL projection
    // BUT converting that to valid THREE.Shapes for extraneous geometry is complex because of "holes" and disjoint parts.

    // SIMPLIFICATION:
    // Let's use the existing "individual centered" logic but manually position them? No, that's hard.
    // Let's just iterate and use the global projection logic inside the loop component?
    // No, `featureToShapes` needs to be aware of the global transform.

    return (
        <div style={{ width: '100%', height: '100%', cursor: 'grab' }} className="map-canvas-container">
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 800], fov: 50, near: 1, far: 5000 }}>
                <ambientLight intensity={2.5} />
                <pointLight position={[100, 100, 200]} intensity={2.0} />

                <SuspendedWorld
                    features={features}
                    profile={profile}
                    onToggleVisited={onToggleVisited}
                />

                <OrbitControls
                    enableRotate={true}
                    enableZoom={true}
                    enablePan={true}
                    mouseButtons={{
                        LEFT: THREE.MOUSE.PAN,      // Left click pans
                        MIDDLE: THREE.MOUSE.DOLLY,  // Middle zooms
                        RIGHT: THREE.MOUSE.ROTATE   // Right click rotates
                    }}
                    touches={{
                        ONE: THREE.TOUCH.PAN,           // One finger pans
                        TWO: THREE.TOUCH.DOLLY_ROTATE   // Two fingers zoom + rotate
                    }}
                    minDistance={300}
                    maxDistance={2000}
                    panSpeed={1.5}
                    makeDefault
                />
            </Canvas>
            <style>{`
                .map-canvas-container:active {
                    cursor: grabbing !important;
                }
            `}</style>
        </div>
    );
};

// Separate component to handle the shape generation loop
const SuspendedWorld = ({ features, profile, onToggleVisited }) => {
    // Generate shapes with a shared projection
    // To make it look like a globe, we'd need spherical projection.
    // To make it a map, we use Mercator.
    // Let's do a nice flat map that floats.

    // Larger scale for a bigger map, centered at origin
    const projection = d3.geoEquirectangular().scale(360).translate([0, 0]);
    const path = d3.geoPath(projection);

    return (
        <Center>
            <group> {/* No rotation - keep map right-side up */}
                {features.map((feature, i) => {
                    const name = feature.properties.name || "Unknown";
                    const norm = normalizeName(name);

                    let status = 'none';
                    if (profile.visited.some(v => normalizeName(v) === norm)) status = 'visited';
                    else if (profile.guessed.some(g => normalizeName(g) === norm)) status = 'guessed';

                    return (
                        <WorldCountryMesh
                            key={i}
                            feature={feature}
                            projection={projection}
                            status={status}
                            onClick={() => onToggleVisited(name)}
                            name={name}
                        />
                    );
                })}
            </group>
        </Center>
    );
}

const WorldCountryMesh = ({ feature, projection, status, onClick, name }) => {
    // Custom shape logic using the PASSED projection
    const shapes = useMemo(() => {
        const shapeList = [];
        const geometries = feature.geometry.type === 'MultiPolygon'
            ? feature.geometry.coordinates
            : [feature.geometry.coordinates];

        geometries.forEach(polygon => {
            const outerRing = polygon[0];
            const shape = new THREE.Shape();

            // Project
            outerRing.forEach((p, i) => {
                const [x, y] = projection(p);
                // D3 y is down, Three y is up. We'll flip the whole group later or invert here.
                // Let's invert here for consistency with shape drawing
                if (i === 0) shape.moveTo(x, -y);
                else shape.lineTo(x, -y);
            });

            // Holes
            for (let k = 1; k < polygon.length; k++) {
                const holePath = new THREE.Path();
                polygon[k].forEach((p, j) => {
                    const [x, y] = projection(p);
                    if (j === 0) holePath.moveTo(x, -y);
                    else holePath.lineTo(x, -y);
                });
                shape.holes.push(holePath);
            }
            shapeList.push(shape);
        });
        return shapeList;
    }, [feature, projection]);

    const [hovered, setHover] = useState(false);

    const extrudeSettings = useMemo(() => ({
        depth: (status === 'visited' || status === 'guessed') ? 8 : 3,
        bevelEnabled: false,
    }), [status]);

    const color = useMemo(() => {
        if (hovered) return '#fbbf24';
        if (status === 'visited' || status === 'guessed') return '#3b82f6';
        return '#4b5563';
    }, [status, hovered]);

    return (
        <mesh
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
            onPointerOut={(e) => setHover(false)}
        >
            <extrudeGeometry args={[shapes, extrudeSettings]} />
            <meshStandardMaterial color={color} />
            {hovered && (
                <Html distanceFactor={80} zIndexRange={[100, 0]}>
                    <div style={{
                        background: 'rgba(0,0,0,0.9)',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        {name}
                        {status === 'visited' && <span style={{ color: '#60a5fa' }}> (Visited)</span>}
                        {status === 'guessed' && <span style={{ color: '#34d399' }}> (Solved)</span>}
                    </div>
                </Html>
            )}
        </mesh>
    );
};

export default WorldGlobe;
