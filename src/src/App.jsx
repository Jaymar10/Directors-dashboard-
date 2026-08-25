import { useState, useMemo, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import {
  Sparkles,
  Landmark,
  Terminal,
  ClipboardList,
  UserCog,
  ChevronDown,
  Plus,
  X,
  CircleDot,
} from "lucide-react";

// ---- Design tokens -------------------------------------------------------
const COLORS = {
  bg: "#0A0E13",
  surface: "#12181F",
  surface2: "#1A2129",
  border: "#232B35",
  textPrimary: "#E7ECF2",
  textSecondary: "#8391A0",
  textTertiary: "#4E5964",
  signal: "#45D8A0", // active
  amber: "#E3A94A", // standby / planned