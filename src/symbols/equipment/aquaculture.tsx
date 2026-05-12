/**
 * Aquaculture / biotech / chemical-storage glyphs.
 *
 * Every glyph follows the house style:
 *  - 64×64 viewBox
 *  - stroke-only (theme-aware via SvgFrame), no fills except small accents
 *  - 1.5 px stroke width
 *
 * Components added here:
 *  - Bio-reactor raceway pond (algae)
 *  - Tubular photobioreactor (PBR)
 *  - Round culture tank (fish / shrimp)
 *  - Moving-bed bioreactor (MBBR / biofilter)
 *  - Protein skimmer / foam fractionator
 *  - Paddlewheel aerator
 *  - Oxygen cone (low-head oxygenator)
 *  - Settling cone / clarifier
 *  - Biomass collection vessel
 *  - IBC container (1000 L caged tote)
 *  - Chemical drum (200 L)
 */

import type { SymbolIconProps } from "@/symbols/types";
import { SvgFrame } from "@/symbols/svgUtil";

/** Open-pond raceway: stadium shape with a central divider and a paddlewheel
 *  at one end. Drawn top-down so it reads as "open shallow channel". */
export function BioreactorRaceway(props: SymbolIconProps) {
  return (
    <SvgFrame {...props} viewBox="0 0 96 64">
      {/* Outer pond perimeter (stadium). */}
      <rect x={4} y={14} width={88} height={36} rx={18} />
      {/* Central divider island. */}
      <rect x={20} y={24} width={56} height={16} rx={8} />
      {/* Paddlewheel at the left end — hub + four radial paddles. */}
      <circle cx={14} cy={32} r={4} />
      <line x1={14} y1={26} x2={14} y2={38} />
      <line x1={10} y1={28} x2={18} y2={36} />
      <line x1={18} y1={28} x2={10} y2={36} />
      {/* Subtle flow indication along one channel. */}
      <path
        d="M 30 18 L 70 18"
        strokeDasharray="2 3"
      />
      <path
        d="M 70 46 L 30 46"
        strokeDasharray="2 3"
      />
    </SvgFrame>
  );
}

/** Tubular photobioreactor — serpentine run of clear horizontal tubes on a
 *  stand. Three tubes plus two U-bends are enough to read as "tubular PBR". */
export function TubularPhotobioreactor(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Three horizontal tubes. */}
      <line x1={10} y1={16} x2={50} y2={16} />
      <line x1={14} y1={32} x2={54} y2={32} />
      <line x1={10} y1={48} x2={50} y2={48} />
      {/* U-bends alternating sides. */}
      <path d="M 50 16 Q 58 16, 58 24 Q 58 32, 54 32" />
      <path d="M 14 32 Q 6 32, 6 40 Q 6 48, 10 48" />
      {/* Inlet / outlet pipe stubs. */}
      <line x1={10} y1={16} x2={4} y2={16} />
      <line x1={50} y1={48} x2={60} y2={48} />
      {/* Stand. */}
      <line x1={8} y1={54} x2={56} y2={54} />
      <line x1={12} y1={54} x2={12} y2={60} />
      <line x1={52} y1={54} x2={52} y2={60} />
    </SvgFrame>
  );
}

/** Round culture tank — top view with centre drain and a swirl line. Common
 *  RAS / shrimp pond geometry. */
export function RoundCultureTank(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Tank wall. */}
      <circle cx={32} cy={32} r={26} />
      {/* Centre drain. */}
      <circle cx={32} cy={32} r={4} />
      {/* Side inlet stub. */}
      <line x1={4} y1={32} x2={6} y2={32} />
      <path d="M 6 28 L 6 36 L 12 32 Z" fill="currentColor" />
      {/* Bottom outlet stub. */}
      <line x1={32} y1={58} x2={32} y2={62} />
      {/* Swirl line implying tangential flow. */}
      <path d="M 14 32 Q 14 16, 32 16" strokeDasharray="2 3" />
      <path d="M 50 32 Q 50 48, 32 48" strokeDasharray="2 3" />
    </SvgFrame>
  );
}

/** Moving-bed bioreactor — rectangular vessel sprinkled with floating biofilm
 *  carrier elements (small ringed circles). */
export function MovingBedBioreactor(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <rect x={10} y={14} width={44} height={42} rx={2} />
      {/* Air diffuser at the bottom. */}
      <line x1={14} y1={50} x2={50} y2={50} strokeDasharray="3 2" />
      {/* Floating carrier elements — small "+"-marked discs. */}
      {[
        [18, 22],
        [28, 26],
        [40, 22],
        [48, 28],
        [22, 34],
        [34, 36],
        [44, 38],
        [18, 44],
        [30, 44],
      ].map(([cx, cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={2.4} />
          <line x1={cx - 1.2} y1={cy} x2={cx + 1.2} y2={cy} />
          <line x1={cx} y1={cy - 1.2} x2={cx} y2={cy + 1.2} />
        </g>
      ))}
    </SvgFrame>
  );
}

/** Protein skimmer / foam fractionator — tall narrow column with a collection
 *  cup on top and rising bubbles inside. */
export function ProteinSkimmer(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Column body. */}
      <rect x={22} y={14} width={20} height={42} />
      {/* Collection cup. */}
      <path d="M 18 14 L 18 6 L 46 6 L 46 14" />
      <line x1={18} y1={14} x2={46} y2={14} />
      {/* Bubbles rising inside the column. */}
      <circle cx={28} cy={44} r={1.8} />
      <circle cx={36} cy={40} r={1.5} />
      <circle cx={30} cy={34} r={1.5} />
      <circle cx={34} cy={28} r={1.2} />
      <circle cx={28} cy={22} r={1.4} />
      <circle cx={36} cy={18} r={1.2} />
      {/* Inlet (mid-body) and outlet (bottom) stubs. */}
      <line x1={42} y1={48} x2={50} y2={48} />
      <line x1={32} y1={56} x2={32} y2={62} />
    </SvgFrame>
  );
}

/** Paddlewheel aerator — half-submerged spoked wheel with splash marks. */
export function PaddlewheelAerator(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Water line. */}
      <line x1={2} y1={42} x2={62} y2={42} />
      {/* Wheel hub + rim. */}
      <circle cx={32} cy={32} r={18} />
      <circle cx={32} cy={32} r={3} fill="currentColor" />
      {/* Spokes. */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        const x = 32 + Math.cos(r) * 18;
        const y = 32 + Math.sin(r) * 18;
        return <line key={i} x1={32} y1={32} x2={x} y2={y} />;
      })}
      {/* Splash droplets above the water line on the active side. */}
      <circle cx={50} cy={36} r={1.4} fill="currentColor" />
      <circle cx={54} cy={32} r={1.4} fill="currentColor" />
      <circle cx={58} cy={38} r={1.4} fill="currentColor" />
    </SvgFrame>
  );
}

/** Oxygen cone — downward-pointing cone with O2 inlet top and water in/out. */
export function OxygenCone(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Cone body. */}
      <path d="M 12 10 L 52 10 L 36 56 L 28 56 Z" />
      <line x1={12} y1={10} x2={52} y2={10} />
      {/* O2 inlet on the apex of the inverted cone (top). */}
      <line x1={32} y1={2} x2={32} y2={10} />
      <text
        x={32}
        y={20}
        textAnchor="middle"
        fontSize={7}
        fill="currentColor"
        stroke="none"
      >
        O₂
      </text>
      {/* Side water inlet. */}
      <line x1={4} y1={20} x2={14} y2={20} />
      {/* Water + dissolved-O2 outlet at the bottom apex. */}
      <line x1={32} y1={56} x2={32} y2={62} />
      {/* Bubble accents inside. */}
      <circle cx={32} cy={32} r={1.5} />
      <circle cx={28} cy={38} r={1.2} />
      <circle cx={36} cy={40} r={1.2} />
    </SvgFrame>
  );
}

/** Settling cone / clarifier — cylindrical top, steep conical bottom, top
 *  overflow weir lip. Used for biomass settling and water polishing. */
export function SettlingCone(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Cylinder upper. */}
      <path d="M 10 10 L 10 30 L 54 30 L 54 10" />
      {/* Cone lower. */}
      <path d="M 10 30 L 32 58 L 54 30" />
      {/* Overflow weir lip. */}
      <line x1={6} y1={14} x2={58} y2={14} />
      {/* Top inlet stub. */}
      <line x1={32} y1={2} x2={32} y2={10} />
      {/* Bottom outlet (sludge / biomass underflow). */}
      <line x1={32} y1={58} x2={32} y2={62} />
      {/* Settled-solids layer indicator. */}
      <line x1={20} y1={48} x2={44} y2={48} strokeDasharray="2 2" />
    </SvgFrame>
  );
}

/** Biomass collection vessel — Imhoff-style cone-bottom holding tank with a
 *  sloped solids reading. Distinct from a clarifier in that it's a *holding*
 *  vessel after settling / harvest. */
export function BiomassCollectionVessel(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Cylindrical body. */}
      <rect x={14} y={8} width={36} height={32} />
      {/* Cone bottom. */}
      <path d="M 14 40 L 32 60 L 50 40 Z" />
      {/* Sight scale on the side of the cone. */}
      <line x1={18} y1={46} x2={20} y2={46} />
      <line x1={22} y1={52} x2={24} y2={52} />
      <line x1={26} y1={58} x2={28} y2={58} />
      {/* Lid + manway. */}
      <line x1={20} y1={8} x2={20} y2={4} />
      <line x1={26} y1={8} x2={38} y2={8} />
      <line x1={44} y1={8} x2={44} y2={4} />
      {/* Side inlet stub and bottom drain. */}
      <line x1={50} y1={20} x2={58} y2={20} />
      <line x1={32} y1={60} x2={32} y2={64} />
      {/* Accumulated biomass shading inside the cone (dashed). */}
      <path d="M 22 50 L 42 50" strokeDasharray="2 2" />
    </SvgFrame>
  );
}

/** IBC tote — caged cubic plastic tank on a pallet base with a bottom valve.
 *  The hallmark of any small-to-medium chemical / dosing skid. */
export function IbcContainer(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Outer cage frame. */}
      <rect x={8} y={8} width={48} height={42} />
      {/* Inner plastic tank — rounded-corner rectangle. */}
      <rect x={12} y={12} width={40} height={34} rx={3} />
      {/* Cage horizontal members. */}
      <line x1={8} y1={20} x2={56} y2={20} />
      <line x1={8} y1={32} x2={56} y2={32} />
      <line x1={8} y1={42} x2={56} y2={42} />
      {/* Cage vertical members. */}
      <line x1={20} y1={8} x2={20} y2={50} />
      <line x1={32} y1={8} x2={32} y2={50} />
      <line x1={44} y1={8} x2={44} y2={50} />
      {/* Top fill cap. */}
      <circle cx={20} cy={8} r={3} />
      <line x1={20} y1={5} x2={20} y2={2} />
      {/* Pallet base. */}
      <line x1={6} y1={50} x2={58} y2={50} />
      <line x1={10} y1={50} x2={10} y2={58} />
      <line x1={22} y1={50} x2={22} y2={58} />
      <line x1={42} y1={50} x2={42} y2={58} />
      <line x1={54} y1={50} x2={54} y2={58} />
      <line x1={6} y1={58} x2={58} y2={58} />
      {/* Front bottom outlet valve (small bowtie hint + nozzle). */}
      <line x1={50} y1={46} x2={58} y2={46} />
      <path
        d="M 56 44 L 56 48 L 60 46 Z"
        fill="currentColor"
      />
    </SvgFrame>
  );
}

/** Chemical drum (200 L / 55 gal) — vertical cylinder with raised ribs and
 *  bung holes on top. */
export function ChemicalDrum(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Top ellipse (chime). */}
      <ellipse cx={32} cy={10} rx={20} ry={4} />
      {/* Body. */}
      <line x1={12} y1={10} x2={12} y2={54} />
      <line x1={52} y1={10} x2={52} y2={54} />
      {/* Bottom ellipse (visible front half only). */}
      <path d="M 12 54 Q 32 62, 52 54" />
      {/* Two reinforcement ribs around the body. */}
      <path d="M 12 26 Q 32 30, 52 26" />
      <path d="M 12 26 Q 32 22, 52 26" strokeDasharray="2 2" />
      <path d="M 12 42 Q 32 46, 52 42" />
      <path d="M 12 42 Q 32 38, 52 42" strokeDasharray="2 2" />
      {/* Two bung holes on the lid. */}
      <circle cx={24} cy={10} r={2} />
      <circle cx={40} cy={10} r={2} />
      {/* Outlet at the bottom (gravity feed). */}
      <line x1={32} y1={58} x2={32} y2={62} />
    </SvgFrame>
  );
}
