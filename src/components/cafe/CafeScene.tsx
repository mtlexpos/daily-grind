"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  COUNTER_BACK_Y,
  FIELD,
  PATIENCE,
  TABLES,
  THREE_STAR_WITHIN,
  type Customer,
  type GameState,
} from "./engine";
import {
  COFFEE_CUP_DATA_URI,
  CUP_ASPECT,
  PERSON_ASPECT,
  coffeeCupSvg,
  personSvg,
} from "./sprites";

/**
 * Three.js / R3F rendering of Barista Rush — a pure view of the engine state.
 * Logical (x, y) maps onto the ground plane as (x, z); y is height. Smaller
 * engine-y is the back of the room, so the counter renders against the back
 * wall (top of screen) and the camera looks toward it from the front.
 *
 * Characters and cups are hand-authored SVG sprites (see sprites.ts) rasterised
 * to textures, billboarded to face the camera.
 *
 * Loaded via next/dynamic with ssr:false (WebGL needs the browser).
 */

const SCALE = 0.012; // logical units → world units
const wx = (x: number) => (x - FIELD.w / 2) * SCALE;
const wz = (y: number) => (y - FIELD.h / 2) * SCALE;

const FLOOR_W = FIELD.w * SCALE + 1.4;
const FLOOR_D = FIELD.h * SCALE + 1.4;

// Counter spans the back strip (engine: y <= COUNTER_BACK_Y).
const COUNTER_CZ = wz(COUNTER_BACK_Y / 2);
const COUNTER_DEPTH = COUNTER_BACK_Y * SCALE;
const BACK_Z = wz(0) - 0.1;

/** Rasterise an SVG string to a canvas texture (updates once the image loads). */
function useSvgTexture(svg: string, w = 256, h = 256): THREE.CanvasTexture {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const img = new Image();
    img.onload = () => {
      ctx?.clearRect(0, 0, w, h);
      ctx?.drawImage(img, 0, 0, w, h);
      tex.needsUpdate = true;
    };
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    return tex;
  }, [svg, w, h]);
}

/** A camera-facing sprite, base sitting near the floor at `position`. */
function Sprite({
  svg,
  position,
  height,
  aspect,
}: {
  svg: string;
  position: [number, number, number];
  height: number;
  aspect: number;
}) {
  const res = 320;
  const tex = useSvgTexture(svg, Math.round(res * aspect), res);
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[height * aspect, height]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} alphaTest={0.5} />
      </mesh>
    </Billboard>
  );
}

function ShadowBlob({ x, z, r = 0.42 }: { x: number; z: number; r?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, z]}>
      <circleGeometry args={[r, 24]} />
      <meshBasicMaterial color="#3a2410" transparent opacity={0.2} />
    </mesh>
  );
}

function Table({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, 0.52, 12]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
      <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.34, 0.07, 24]} />
        <meshStandardMaterial color="#caa472" />
      </mesh>
    </group>
  );
}

function CustomerView({ customer }: { customer: Customer }) {
  const t = TABLES[customer.table];
  const x = wx(t.x);
  const z = wz(t.y) + 0.45; // sit on the camera side of the table
  const angry = customer.state === "reviewing" && customer.stars === 0;
  const svg = useMemo(
    () => personSvg({ skin: customer.skin, hair: customer.hair, shirt: customer.shirt, angry }),
    [customer.skin, customer.hair, customer.shirt, angry],
  );

  return (
    <group>
      <ShadowBlob x={x} z={z} r={0.32} />
      <Sprite svg={svg} position={[x, 0.62, z]} height={1.1} aspect={PERSON_ASPECT} />
      <Html
        position={[x, 1.5, z]}
        center
        distanceFactor={8}
        pointerEvents="none"
        zIndexRange={[20, 0]}
      >
        <CustomerBubble customer={customer} />
      </Html>
    </group>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z"
            fill="#f5a623"
            stroke="#d98b0e"
            strokeWidth="1"
          />
        </svg>
      ))}
    </span>
  );
}

function CustomerBubble({ customer }: { customer: Customer }) {
  if (customer.state === "reviewing") {
    return (
      <div className="flex select-none items-center gap-1 whitespace-nowrap rounded-full bg-white px-3 py-1.5 shadow ring-1 ring-black/10">
        {customer.stars === 0 ? (
          <span className="text-base font-bold text-red-600">✕ walked out</span>
        ) : (
          <Stars n={customer.stars} />
        )}
      </div>
    );
  }
  const remaining = Math.max(0, 1 - customer.wait / PATIENCE);
  const inThreeStarZone = customer.wait <= THREE_STAR_WITHIN;
  return (
    <div className="flex select-none flex-col items-center gap-1 rounded-2xl bg-white px-3 py-1.5 shadow ring-1 ring-black/10">
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny inline SVG data-uri, not a network image */}
      <img src={COFFEE_CUP_DATA_URI} alt="" width={26} height={26} draggable={false} />
      <div className="h-2 w-16 overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full ${inThreeStarZone ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${remaining * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Cups sitting on the counter; an empty saucer shows while one restocks. */
function CounterCups({ cups }: { cups: number[] }) {
  const cupSvg = useMemo(() => coffeeCupSvg(), []);
  const span = FLOOR_W - 2;
  return (
    <>
      {cups.map((timer, i) => {
        const x = -span / 2 + (span * i) / (cups.length - 1);
        const ready = timer <= 0;
        return (
          <group key={i}>
            {/* saucer marks the slot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.97, 0]}>
              <circleGeometry args={[0.16, 20]} />
              <meshStandardMaterial color={ready ? "#caa472" : "#9b8a70"} />
            </mesh>
            {ready && (
              <Sprite
                svg={cupSvg}
                position={[x, 1.16, 0.02]}
                height={0.34}
                aspect={CUP_ASPECT}
              />
            )}
          </group>
        );
      })}
    </>
  );
}

function CameraSetup() {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, 0.3, 0.6);
  }, [camera]);
  return null;
}

function Scene({ state }: { state: GameState }) {
  const b = state.barista;
  const baristaSvg = useMemo(
    () => personSvg({ skin: "#f0c49c", hair: "#3a2a1c", shirt: "#3f7d5a", barista: true }),
    [],
  );

  return (
    <>
      <CameraSetup />
      <ambientLight intensity={0.85} />
      <hemisphereLight args={["#fff6e8", "#7a5a3a", 0.4]} />
      <directionalLight
        position={[6, 12, 7]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[1024, 1024]}
      >
        <orthographicCamera attach="shadow-camera" args={[-9, 9, 9, -9, 0.1, 40]} />
      </directionalLight>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[FLOOR_W, FLOOR_D]} />
        <meshStandardMaterial color="#e9dcc6" />
      </mesh>

      {/* Back + side walls for a sense of room */}
      <mesh position={[0, 1.5, BACK_Z]} receiveShadow>
        <planeGeometry args={[FLOOR_W, 3]} />
        <meshStandardMaterial color="#d8c3a1" side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[-FLOOR_W / 2, 1.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[FLOOR_D, 3]} />
        <meshStandardMaterial color="#cdb795" side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[FLOOR_W / 2, 1.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
      >
        <planeGeometry args={[FLOOR_D, 3]} />
        <meshStandardMaterial color="#cdb795" side={THREE.DoubleSide} />
      </mesh>

      {/* Counter (against the back wall) */}
      <group position={[0, 0, COUNTER_CZ]}>
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[FLOOR_W, 0.9, COUNTER_DEPTH]} />
          <meshStandardMaterial color="#5b3a1e" />
        </mesh>
        <mesh position={[0, 0.92, 0]} castShadow receiveShadow>
          <boxGeometry args={[FLOOR_W, 0.08, COUNTER_DEPTH + 0.08]} />
          <meshStandardMaterial color="#7a5026" />
        </mesh>
        <CounterCups cups={state.cups} />
      </group>

      {/* Tables */}
      {TABLES.map((t, i) => (
        <Table key={i} x={wx(t.x)} z={wz(t.y)} />
      ))}

      {/* Customers */}
      {state.customers.map((c) => (
        <CustomerView key={c.id} customer={c} />
      ))}

      {/* Barista */}
      <ShadowBlob x={wx(b.x)} z={wz(b.y)} />
      <Sprite
        svg={baristaSvg}
        position={[wx(b.x), 0.66, wz(b.y)]}
        height={1.2}
        aspect={PERSON_ASPECT}
      />
      {b.carrying && (
        <Sprite
          svg={coffeeCupSvg()}
          position={[wx(b.x) + 0.34, 0.5, wz(b.y)]}
          height={0.4}
          aspect={CUP_ASPECT}
        />
      )}
    </>
  );
}

export default function CafeScene({ state }: { state: GameState }) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 8.6, 9], fov: 42 }}
      className="h-full w-full"
    >
      <color attach="background" args={["#f3e7d3"]} />
      <Scene state={state} />
    </Canvas>
  );
}
