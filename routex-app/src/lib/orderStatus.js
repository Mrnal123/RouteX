const DISPLAY_BY_CONVEX_STATUS = {
  pending: "Pending",
  assigned: "Sorting",
  "out-for-delivery": "In Transit",
  delivered: "Delivered",
  cancelled: "Flagged",
};

const BADGE_CLASS_BY_DISPLAY_STATUS = {
  "In Transit": "text-primary border-primary/20 bg-primary/5 shadow-[0_0_12px_rgba(0,241,254,0.1)]",
  Sorting: "text-amber-400 border-amber-400/20 bg-amber-400/5",
  Delivered: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
  Pending: "text-white/30 border-white/10 bg-white/5",
  Flagged: "text-rose-500 border-rose-500/20 bg-rose-500/5 shadow-[0_0_12px_rgba(244,63,94,0.1)]",
};

const TABLE_BADGE_CLASS_BY_DISPLAY_STATUS = {
  "In Transit": "text-primary bg-primary/10",
  Sorting: "text-amber-400 bg-amber-500/10",
  Delivered: "text-emerald-400 bg-emerald-500/10",
  Pending: "text-white/40 bg-white/5",
  Flagged: "text-rose-400 bg-rose-500/10",
};

export function toDisplayOrderStatus(status) {
  return DISPLAY_BY_CONVEX_STATUS[status] ?? "Pending";
}

export function getOrderBadgeClass(status) {
  const displayStatus = toDisplayOrderStatus(status);
  return BADGE_CLASS_BY_DISPLAY_STATUS[displayStatus] ?? BADGE_CLASS_BY_DISPLAY_STATUS.Pending;
}

export function getOrderTableBadgeClass(status) {
  const displayStatus = toDisplayOrderStatus(status);
  return TABLE_BADGE_CLASS_BY_DISPLAY_STATUS[displayStatus] ?? TABLE_BADGE_CLASS_BY_DISPLAY_STATUS.Pending;
}
