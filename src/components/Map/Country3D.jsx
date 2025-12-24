import React, { useMemo, useRef } from 'react';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { normalizeName } from '../../utils/geography';
import earthTextureSrc from '../../assets/earth_texture.png';

// Utility: Convert GeoJSON feature to Three.js Shapes
function featureToShapes(feature) {
    const shapes = [];
    // Increase resolution for better shape details
    const projection = d3.geoMercator().fitSize([150, 150], feature);
    const path = d3.geoPath().projection(projection);

    // We need to access the coordinates directly. 
    // But d3 path generator returns SVG path string 'M...L...'. 
    // It's easier to iterate coordinates if we just project them manually.

    // Handle Polygon and MultiPolygon
    const geometries = feature.geometry.type === 'MultiPolygon'
        ? feature.geometry.coordinates
        : [feature.geometry.coordinates];

    geometries.forEach(polygon => {
        // polygon is [outerRing, innerRing1, innerRing2...]
        const outerRing = polygon[0];
        const shape = new THREE.Shape();

        outerRing.forEach((point, i) => {
            const [x, y] = projection(point);
            if (i === 0) shape.moveTo(x, -y); // Invert Y for 3D world
            else shape.lineTo(x, -y);
        });

        // Holes
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

const CountryMesh = ({ feature, texture }) => {
    const meshRef = useRef();

    // Auto-rotation slightly
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
        }
    });

    const shapes = useMemo(() => featureToShapes(feature), [feature]);

    const extrudeSettings = useMemo(() => ({
        depth: 4, // Thicker for more substance
        bevelEnabled: true,
        bevelThickness: 0.5,
        bevelSize: 0.5,
        bevelSegments: 4
    }), []);

    // Fix texture UVs -> Scale texture larger so it doesn't tile 100 times
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.015, 0.015); // This maps ~66 units to 1 texture repeat. Object is 150 units. So ~2.5 repeats.

    return (
        <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.6}>
            <Center>
                <mesh ref={meshRef} castShadow receiveShadow>
                    <extrudeGeometry args={[shapes, extrudeSettings]} />
                    {/* Face Material: Texture with some emission to prevent being too dark */}
                    <meshStandardMaterial
                        map={texture}
                        roughness={0.5}
                        metalness={0.1}
                        emissive="#444444"
                        emissiveIntensity={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            </Center>
        </Float>
    );
};

const Country3D = ({ topo, targetName }) => {
    if (!topo || !targetName) return null;

    const texture = useLoader(THREE.TextureLoader, earthTextureSrc);

    const feature = useMemo(() => {
        const features = topojson.feature(topo, topo.objects.countries).features;
        const normTarget = normalizeName(targetName);
        return features.find(f =>
            normalizeName((f.properties && f.properties.name) || "") === normTarget
        );
    }, [topo, targetName]);

    if (!feature) return null;

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 200]} fov={45} />

                {/* Lighting Setup - High Key to prevent darkness */}
                <ambientLight intensity={2.5} />
                <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={2.0} />
                <directionalLight position={[50, 100, 100]} intensity={3.0} castShadow />
                <pointLight position={[-50, -50, 50]} intensity={2.0} color="#ffffff" />

                <Environment preset="city" /> {/* Generic reflections for realism */}

                <CountryMesh feature={feature} texture={texture} />

                <OrbitControls enableZoom={true} minDistance={100} maxDistance={400} autoRotate={false} />
            </Canvas>
        </div>
    );
};

export default Country3D;
