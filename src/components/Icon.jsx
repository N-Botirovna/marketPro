// AUTO-curated icon registry — Phosphor webfont (@phosphor-icons/web) replaced
// by tree-shakeable SVG components. Only icons actually used in the app are
// imported here (see scripts/check-icons.mjs to re-audit). Add new icons to
// ICON_MAP below; the <Icon> component resolves them by their phosphor class.
import {
  Archive,
  ArrowCounterClockwise,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowUpRight,
  ArrowsClockwise,
  Book,
  BookOpen,
  BookOpenText,
  Books,
  CalendarBlank,
  Camera,
  CaretDown,
  CaretLeft,
  CaretRight,
  ChatCircle,
  ChatCircleText,
  Check,
  CheckCircle,
  CircleHalf,
  Clock,
  ClockClockwise,
  Envelope,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  FacebookLogo,
  FileText,
  ForkKnife,
  Gift,
  Globe,
  Handshake,
  Heart,
  HeartBreak,
  House,
  ImageSquare,
  Info,
  InstagramLogo,
  Link,
  List,
  ListBullets,
  LockKey,
  MagnifyingGlass,
  MapPin,
  Megaphone,
  Minus,
  MoonStars,
  Package,
  PaintBrush,
  PaperPlaneTilt,
  PencilSimple,
  PencilSimpleLine,
  Phone,
  Plus,
  Question,
  ShareNetwork,
  ShieldCheck,
  ShoppingCartSimple,
  SignIn,
  SignOut,
  Sparkle,
  Star,
  Storefront,
  Sun,
  Target,
  TelegramLogo,
  ThumbsUp,
  TiktokLogo,
  Trash,
  Truck,
  User,
  UserCheck,
  UserCircle,
  Users,
  UsersThree,
  Warning,
  WarningCircle,
  WhatsappLogo,
  X,
  XLogo,
  YoutubeLogo,
} from "@phosphor-icons/react/dist/ssr";

// phosphor glyph name (without the `ph-` prefix) -> SVG component
const ICON_MAP = {
  archive: Archive,
  "arrow-counter-clockwise": ArrowCounterClockwise,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-square-out": ArrowSquareOut,
  "arrow-up-right": ArrowUpRight,
  "arrows-clockwise": ArrowsClockwise,
  book: Book,
  "book-open": BookOpen,
  "book-open-text": BookOpenText,
  books: Books,
  "calendar-blank": CalendarBlank,
  camera: Camera,
  "caret-down": CaretDown,
  "caret-left": CaretLeft,
  "caret-right": CaretRight,
  "chat-circle": ChatCircle,
  "chat-circle-text": ChatCircleText,
  check: Check,
  "check-circle": CheckCircle,
  "circle-half": CircleHalf,
  clock: Clock,
  "clock-clockwise": ClockClockwise,
  envelope: Envelope,
  "envelope-simple": EnvelopeSimple,
  eye: Eye,
  "eye-slash": EyeSlash,
  "facebook-logo": FacebookLogo,
  "file-text": FileText,
  "fork-knife": ForkKnife,
  gift: Gift,
  globe: Globe,
  handshake: Handshake,
  heart: Heart,
  "heart-break": HeartBreak,
  house: House,
  "image-square": ImageSquare,
  info: Info,
  "instagram-logo": InstagramLogo,
  link: Link,
  list: List,
  "list-bullets": ListBullets,
  "lock-key": LockKey,
  "magnifying-glass": MagnifyingGlass,
  "map-pin": MapPin,
  megaphone: Megaphone,
  minus: Minus,
  "moon-stars": MoonStars,
  package: Package,
  "paint-brush": PaintBrush,
  "paper-plane-tilt": PaperPlaneTilt,
  "pencil-simple": PencilSimple,
  "pencil-simple-line": PencilSimpleLine,
  phone: Phone,
  plus: Plus,
  question: Question,
  "share-network": ShareNetwork,
  "shield-check": ShieldCheck,
  "shopping-cart-simple": ShoppingCartSimple,
  "sign-in": SignIn,
  "sign-out": SignOut,
  sparkle: Sparkle,
  star: Star,
  store: Storefront,
  storefront: Storefront,
  sun: Sun,
  target: Target,
  "telegram-logo": TelegramLogo,
  "thumbs-up": ThumbsUp,
  "tiktok-logo": TiktokLogo,
  trash: Trash,
  truck: Truck,
  user: User,
  "user-check": UserCheck,
  "user-circle": UserCircle,
  users: Users,
  "users-three": UsersThree,
  warning: Warning,
  "warning-circle": WarningCircle,
  "whatsapp-logo": WhatsappLogo,
  x: X,
  "x-logo": XLogo,
  "youtube-logo": YoutubeLogo,
};

// phosphor weight class -> @phosphor-icons/react `weight` prop
const WEIGHT_MAP = {
  "ph-fill": "fill",
  "ph-bold": "bold",
  "ph-light": "light",
  "ph-thin": "thin",
  "ph-duotone": "duotone",
};

/**
 * Drop-in replacement for the old `<i className="ph[-weight] ph-<name> ...">`
 * webfont icons. Parses the phosphor class string, renders the matching SVG
 * (size: 1em + currentColor, so existing font-size/color classes still apply),
 * and forwards any non-phosphor classes + props (style, aria-*, onClick...).
 *
 *   <Icon className="ph-fill ph-heart text-lg" aria-hidden="true" />
 *   <Icon className={dynamicPhClassString} />   // config-object driven usage
 */
export default function Icon({ className = "", weight, size, ...rest }) {
  let resolvedWeight = weight;
  let name = null;
  const passthrough = [];
  for (const token of className.split(/\s+/)) {
    if (!token) continue;
    if (token === "ph") continue; // regular weight (default)
    if (WEIGHT_MAP[token]) {
      resolvedWeight = resolvedWeight ?? WEIGHT_MAP[token];
      continue;
    }
    if (token.startsWith("ph-")) {
      name = token.slice(3);
      continue;
    }
    passthrough.push(token);
  }
  const Component = name ? ICON_MAP[name] : null;
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Icon] unknown phosphor icon: "${name}" (class="${className}")`);
    }
    return null;
  }
  return (
    <Component
      weight={resolvedWeight ?? "regular"}
      size={size}
      className={passthrough.join(" ") || undefined}
      {...rest}
    />
  );
}
