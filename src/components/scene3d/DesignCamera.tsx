import { OrbitControls, Grid } from '@react-three/drei'

export default function DesignCamera() {
  return (
    <>
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={80}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
      <Grid
        position={[0, -0.02, 0]}
        infiniteGrid
        cellSize={0.5}
        cellThickness={0.3}
        sectionSize={5}
        sectionThickness={0.8}
        cellColor="#334155"
        sectionColor="#475569"
        fadeDistance={40}
        fadeStrength={2}
      />
    </>
  )
}
