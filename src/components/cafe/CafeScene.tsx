"use client";

import { useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  COUNTER_BACK_Y,
  FIELD,
  ITEM_LABEL,
  PATIENCE,
  STATIONS,
  TABLES,
  THREE_STAR_WITHIN,
  type Customer,
  type GameState,
} from "./engine";
import {
  ITEM_DATA_URI,
  ITEM_H,
  ITEM_W,
  PERSON_H,
  PERSON_W,
  itemSvg,
  personSvg,
  type Look,
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

/**
 * Rasterise a pixel-art SVG to a canvas texture at its NATIVE grid resolution
 * (e.g. 16×24). NearestFilter then lets the GPU upscale it blocky, so the 8-bit
 * pixels stay crisp at any size. Updates once the SVG image decodes.
 */
function useSvgTexture(svg: string, w: number, h: number): THREE.CanvasTexture {
  return useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    const img = new Image();
    img.onload = () => {
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
      }
      tex.needsUpdate = true;
    };
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(svg);
    return tex;
  }, [svg, w, h]);
}

/** A camera-facing pixel sprite, base sitting near the floor at `position`. */
function Sprite({
  svg,
  position,
  height,
  texW,
  texH,
}: {
  svg: string;
  position: [number, number, number];
  height: number;
  texW: number;
  texH: number;
}) {
  const tex = useSvgTexture(svg, texW, texH);
  return (
    <Billboard position={position}>
      <mesh>
        <planeGeometry args={[height * (texW / texH), height]} />
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

function Table({ x, z, r }: { x: number; z: number; r: number }) {
  const h = 0.42 + r * 0.45; // bigger tables stand a touch taller
  const legR = Math.min(0.09, r * 0.18);
  return (
    <group position={[x, 0, z]}>
      <ShadowBlob x={0} z={0} r={r * 1.05} />
      <mesh position={[0, h / 2, 0]} castShadow>
        <cylinderGeometry args={[legR, legR * 1.4, h, 12]} />
        <meshStandardMaterial color="#6b4a2b" />
      </mesh>
      <mesh position={[0, h + 0.035, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r, 0.07, 28]} />
        <meshStandardMaterial color="#caa472" />
      </mesh>
    </group>
  );
}

function CustomerView({ customer }: { customer: Customer }) {
  const t = TABLES[customer.table];
  const x = wx(t.x);
  const z = wz(t.y) + t.r * SCALE + 0.28; // sit at the near edge of the table
  const angry = customer.state === "reviewing" && customer.stars === 0;
  const svg = useMemo(
    () => personSvg({ ...customer.look, angry }),
    [customer.look, angry],
  );

  return (
    <group>
      <ShadowBlob x={x} z={z} r={0.32} />
      <Sprite svg={svg} position={[x, 0.66, z]} height={1.2} texW={PERSON_W} texH={PERSON_H} />
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
      <img
        src={ITEM_DATA_URI[customer.order]}
        alt={ITEM_LABEL[customer.order]}
        title={ITEM_LABEL[customer.order]}
        width={28}
        height={28}
        draggable={false}
        style={{ imageRendering: "pixelated" }}
      />
      <div className="h-2 w-16 overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full ${inThreeStarZone ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${remaining * 100}%` }}
        />
      </div>
    </div>
  );
}

/** Counter stations; each shows its item when ready, an empty mat while
 *  restocking. The item types are grouped left→right: coffee, iced, pastry. */
function CounterStations({ stations }: { stations: number[] }) {
  const svgs = useMemo(
    () => STATIONS.map((s) => itemSvg(s.item)),
    [],
  );
  return (
    <>
      {STATIONS.map((station, i) => {
        // counter group is at COUNTER_CZ, so position items in its local frame
        const x = wx(station.x);
        const ready = stations[i] <= 0;
        return (
          <group key={i}>
            {/* mat marks the slot */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.97, 0]}>
              <circleGeometry args={[0.16, 20]} />
              <meshStandardMaterial color={ready ? "#caa472" : "#9b8a70"} />
            </mesh>
            {ready && (
              <Sprite
                svg={svgs[i]}
                position={[x, 1.18, 0.02]}
                height={0.38}
                texW={ITEM_W}
                texH={ITEM_H}
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

const BARISTA_LOOK: Look = {
  skin: "#f0c49c",
  hair: "#3a2a1c",
  hairStyle: "short",
  hat: "none",
  hatColor: "#ffffff",
  shirt: "#6f4a2d",
  pants: "#34415c",
  glasses: false,
  beard: false,
  barista: true,
};

function Scene({ state }: { state: GameState }) {
  const b = state.barista;
  const baristaSvg = useMemo(() => personSvg(BARISTA_LOOK), []);

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
        <CounterStations stations={state.stations} />
      </group>

      {/* Tables */}
      {TABLES.map((t, i) => (
        <Table key={i} x={wx(t.x)} z={wz(t.y)} r={t.r * SCALE} />
      ))}

      {/* Customers */}
      {state.customers.map((c) => (
        <CustomerView key={c.id} customer={c} />
      ))}

      {/* Barista */}
      <ShadowBlob x={wx(b.x)} z={wz(b.y)} />
      <Sprite
        svg={baristaSvg}
        position={[wx(b.x), 0.72, wz(b.y)]}
        height={1.3}
        texW={PERSON_W}
        texH={PERSON_H}
      />
      {b.carry && (
        <Sprite
          svg={itemSvg(b.carry)}
          position={[wx(b.x) + 0.34, 0.52, wz(b.y)]}
          height={0.46}
          texW={ITEM_W}
          texH={ITEM_H}
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
