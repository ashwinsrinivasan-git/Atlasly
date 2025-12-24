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
    const projection = d3.geoMercator().fitSize([100, 100], feature);
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
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 0.2,
        bevelSize: 0.2,
        bevelSegments: 3
    }), []);

    // Fix texture UVs roughly
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(0.05, 0.05); // Scale texture to fit roughly

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Center>
                <mesh ref={meshRef} castShadow receiveShadow>
                    <extrudeGeometry args={[shapes, extrudeSettings]} />
                    {/* Face Material: Texture */}
                    <meshStandardMaterial map={texture} roughness={0.8} metalness={0.1} side={THREE.DoubleSide} />
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
                <PerspectiveCamera makeDefault position={[0, 0, 150]} fov={50} />
                <ambientLight intensity={0.5} />
                <spotLight position={[50, 50, 50]} angle={0.15} penumbra={1} intensity={2} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={1} />

                <CountryMesh feature={feature} texture={texture} />

                <OrbitControls enableZoom={true} minDistance={50} maxDistance={300} autoRotate={false} />
            </Canvas>
        </div>
    );
};

export default Country3D;
