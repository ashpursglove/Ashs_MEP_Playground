import type { SymbolIconProps } from "@/symbols/types";
import { SvgFrame } from "@/symbols/svgUtil";

/** Y-strainer — inline body with a diagonal screened leg. */
export function YStrainer(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <path d="M 24 32 L 40 32 L 48 48 L 32 48 Z" />
      <line x1={28} y1={36} x2={36} y2={44} />
      <line x1={32} y1={36} x2={40} y2={44} />
      <line x1={36} y1={36} x2={44} y2={44} />
    </SvgFrame>
  );
}

/** T-strainer — vertical screen perpendicular to the main pipe. */
export function TStrainer(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <rect x={26} y={32} width={12} height={20} />
      <line x1={26} y1={38} x2={38} y2={38} />
      <line x1={26} y1={44} x2={38} y2={44} />
    </SvgFrame>
  );
}

/** Basket strainer — vertical body with cylindrical basket inside. */
export function BasketStrainer(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <rect x={20} y={14} width={24} height={36} />
      <path d="M 24 32 L 24 46 L 40 46 L 40 32" />
      <line x1={28} y1={34} x2={28} y2={46} />
      <line x1={32} y1={34} x2={32} y2={46} />
      <line x1={36} y1={34} x2={36} y2={46} />
    </SvgFrame>
  );
}

/** Simplex (single) cartridge filter — vessel with cartridge tube. */
export function SimplexFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <rect x={22} y={14} width={20} height={36} rx={2} />
      <rect x={28} y={20} width={8} height={26} />
      <line x1={30} y1={22} x2={30} y2={44} />
      <line x1={34} y1={22} x2={34} y2={44} />
    </SvgFrame>
  );
}

/** Duplex filter — two parallel filter housings on a single inlet/outlet. */
export function DuplexFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <rect x={10} y={14} width={18} height={36} rx={2} />
      <rect x={36} y={14} width={18} height={36} rx={2} />
      <rect x={15} y={20} width={8} height={26} />
      <rect x={41} y={20} width={8} height={26} />
    </SvgFrame>
  );
}

/** Bag filter — vessel with hanging bag inside. */
export function BagFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <rect x={20} y={14} width={24} height={36} rx={2} />
      <path d="M 26 18 L 26 38 Q 26 46, 32 46 Q 38 46, 38 38 L 38 18 Z" />
      <line x1={26} y1={18} x2={38} y2={18} strokeWidth={2} />
    </SvgFrame>
  );
}

/** Cartridge filter — vessel labelled with vertical element. */
export function CartridgeFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <line x1={4} y1={32} x2={60} y2={32} />
      <rect x={22} y={10} width={20} height={44} rx={6} />
      <line x1={32} y1={14} x2={32} y2={50} />
      <line x1={28} y1={18} x2={36} y2={18} />
      <line x1={28} y1={26} x2={36} y2={26} />
      <line x1={28} y1={34} x2={36} y2={34} />
      <line x1={28} y1={42} x2={36} y2={42} />
    </SvgFrame>
  );
}

/** Sand / multimedia filter — cylindrical vessel with media layers. */
export function SandFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      <rect x={18} y={6} width={28} height={52} rx={6} />
      <line x1={18} y1={18} x2={46} y2={18} strokeDasharray="2 2" />
      <line x1={18} y1={28} x2={46} y2={28} strokeDasharray="2 2" />
      <line x1={18} y1={38} x2={46} y2={38} strokeDasharray="2 2" />
      <line x1={18} y1={48} x2={46} y2={48} strokeDasharray="2 2" />
    </SvgFrame>
  );
}

/**
 * Vibration filter / vibrating screen separator. Slurry enters on the left,
 * the screen splits it into two streams: filtrate (right, straight through)
 * and oversize / rejected solids (bottom). Vibration arcs above the body sell
 * the "shaker" character at a glance.
 */
export function VibrationFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Inlet pipe (top-left). */}
      <line x1={2} y1={20} x2={14} y2={20} />
      <path d="M 14 18 L 14 22 L 20 20 Z" fill="currentColor" />
      {/* Sloped screen body — slight downward tilt to suggest flow. */}
      <path d="M 14 16 L 56 22 L 56 38 L 14 32 Z" />
      {/* Mesh screen lines along the slope. */}
      <line x1={20} y1={22} x2={20} y2={30} />
      <line x1={28} y1={23} x2={28} y2={31} />
      <line x1={36} y1={24} x2={36} y2={32} />
      <line x1={44} y1={25} x2={44} y2={33} />
      <line x1={52} y1={26} x2={52} y2={34} />
      <line x1={16} y1={24} x2={56} y2={30} />
      {/* Filtrate outlet (right, fine fraction passing through). */}
      <line x1={56} y1={30} x2={62} y2={30} />
      {/* Oversize / rejected solids outlet (bottom-right). */}
      <line x1={48} y1={38} x2={48} y2={48} />
      <path d="M 44 46 L 52 46 L 48 52 Z" fill="currentColor" />
      {/* Vibration springs / supports underneath. */}
      <path d="M 16 38 L 12 50 M 20 38 L 24 50" />
      {/* Vibration arc indicators above the body. */}
      <path d="M 24 12 Q 32 6, 40 12" strokeDasharray="2 2" />
      <path d="M 22 8 Q 32 0, 42 8" strokeDasharray="2 2" />
    </SvgFrame>
  );
}

/**
 * Rotary drum filter — half-submerged screened drum, common in RAS / fish-farm
 * mechanical filtration. End-on view: a circle with a spiral / mesh and a
 * water-line cutting across the lower half.
 */
export function DrumFilter(props: SymbolIconProps) {
  return (
    <SvgFrame {...props}>
      {/* Drum housing. */}
      <rect x={6} y={10} width={52} height={44} rx={4} />
      {/* Inlet on the left. */}
      <line x1={2} y1={20} x2={6} y2={20} />
      <path d="M 6 18 L 6 22 L 10 20 Z" fill="currentColor" />
      {/* Filtrate outlet on the right. */}
      <line x1={58} y1={44} x2={62} y2={44} />
      {/* Drum disc with mesh pattern. */}
      <circle cx={32} cy={32} r={16} />
      <circle cx={32} cy={32} r={11} strokeDasharray="2 2" />
      <line x1={16} y1={32} x2={48} y2={32} />
      <line x1={32} y1={16} x2={32} y2={48} />
      <line x1={20} y1={20} x2={44} y2={44} />
      <line x1={44} y1={20} x2={20} y2={44} />
      {/* Half-submerged water line. */}
      <line x1={8} y1={40} x2={56} y2={40} />
      {/* Backwash spray bar on top. */}
      <line x1={20} y1={6} x2={44} y2={6} />
      <line x1={26} y1={6} x2={26} y2={12} strokeDasharray="1 2" />
      <line x1={32} y1={6} x2={32} y2={12} strokeDasharray="1 2" />
      <line x1={38} y1={6} x2={38} y2={12} strokeDasharray="1 2" />
      {/* Reject solids outlet at the bottom. */}
      <line x1={32} y1={54} x2={32} y2={60} />
    </SvgFrame>
  );
}
