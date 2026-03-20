import { Sky } from '@react-three/drei'

export default function EnvironmentSetup() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        castShadow
        position={[10, 20, 10]}
        intensity={1.5}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={0.1}
        shadow-camera-far={100}
      />
      <pointLight position={[-5, 8, -5]} intensity={0.5} color="#fff5e0" />
      <hemisphereLight groundColor="#334155" intensity={0.4} />
    </>
  )
}
