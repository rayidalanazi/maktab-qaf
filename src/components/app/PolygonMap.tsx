"use client";

// Vanilla Leaflet (no react-leaflet, no draw plugin) — client-only, static-export safe.
// mode="draw": owner taps to add vertices, drags to move, undo/clear; emits [lat,lng][].
// mode="view": read-only saved polygon + live "you are here" dot + accuracy circle.
// The polygon is presentation only — the inside/outside decision is computed in the RPC.

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type * as L from "leaflet";
import type { LatLng } from "@/lib/data/types";

interface Props {
  mode: "draw" | "view";
  value?: LatLng[];
  onChange?: (vertices: LatLng[]) => void;
  center?: LatLng;
  zoom?: number;
  trackMe?: boolean;
  heightClass?: string;
}

const RIYADH: LatLng = [24.7136, 46.6753];

export function PolygonMap({
  mode, value, onChange, center = RIYADH, zoom = 16, trackMe = false, heightClass = "h-72",
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const LRef = useRef<typeof import("leaflet") | null>(null);

  const ptsRef = useRef<LatLng[]>(value ? [...value] : []);
  const polyRef = useRef<L.Polygon | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const meMarkerRef = useRef<L.Marker | null>(null);
  const meCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // ---- build map ONCE -------------------------------------------------------
  useEffect(() => {
    let disposed = false;

    (async () => {
      const Lmod = await import("leaflet");
      const Lx = (Lmod.default ?? Lmod) as typeof import("leaflet");
      if (disposed || !hostRef.current) return;
      LRef.current = Lx;

      // guard StrictMode / fast-refresh double-mount
      // @ts-expect-error private leaflet flag
      if (hostRef.current._leaflet_id) hostRef.current._leaflet_id = undefined;

      const map = Lx.map(hostRef.current, {
        center: (ptsRef.current[0] ?? center) as L.LatLngExpression,
        zoom,
        zoomControl: true,
        attributionControl: true,
      });
      mapRef.current = map;

      Lx.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      drawPolygon();

      if (mode === "draw") {
        map.on("click", (e: L.LeafletMouseEvent) => {
          ptsRef.current = [...ptsRef.current, [e.latlng.lat, e.latlng.lng]];
          drawPolygon();
          emit();
        });
      }

      if (ptsRef.current.length >= 2) {
        map.fitBounds(Lx.latLngBounds(ptsRef.current as L.LatLngExpression[]).pad(0.25));
      }

      if (mode === "view" && trackMe) startTracking(Lx, map);

      setTimeout(() => { if (!disposed && mapRef.current) mapRef.current.invalidateSize(); }, 0);
    })();

    return () => {
      disposed = true;
      if (watchIdRef.current != null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      polyRef.current = null;
      markersRef.current = [];
      meMarkerRef.current = null;
      meCircleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- view mode: re-render when the saved polygon prop changes -------------
  useEffect(() => {
    if (mode !== "view" || !mapRef.current || !LRef.current) return;
    ptsRef.current = value ? [...value] : [];
    drawPolygon();
    if (ptsRef.current.length >= 2) {
      mapRef.current.fitBounds(
        LRef.current.latLngBounds(ptsRef.current as L.LatLngExpression[]).pad(0.25),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  function emit() { onChangeRef.current?.([...ptsRef.current]); }

  function drawPolygon() {
    const Lx = LRef.current; const map = mapRef.current;
    if (!Lx || !map) return;

    if (polyRef.current) { polyRef.current.remove(); polyRef.current = null; }
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const pts = ptsRef.current;
    if (pts.length >= 2) {
      polyRef.current = Lx.polygon(pts as L.LatLngExpression[], {
        color: "#D6FF3D", weight: 3, fillColor: "#D6FF3D", fillOpacity: 0.15,
      }).addTo(map);
    }

    if (mode === "draw") {
      pts.forEach(([lat, lng], i) => {
        const mk = Lx.marker([lat, lng], {
          draggable: true,
          icon: Lx.divIcon({
            className: "",
            html: `<div style="width:13px;height:13px;border-radius:50%;background:#D6FF3D;border:2px solid #111;box-shadow:0 0 0 2px #D6FF3D55"></div>`,
            iconSize: [13, 13], iconAnchor: [7, 7],
          }),
        }).addTo(map);
        mk.on("drag", (ev: L.LeafletEvent) => {
          const ll = (ev.target as L.Marker).getLatLng();
          ptsRef.current[i] = [ll.lat, ll.lng];
          if (polyRef.current) polyRef.current.setLatLngs(ptsRef.current as L.LatLngExpression[]);
        });
        mk.on("dragend", emit);
        markersRef.current.push(mk);
      });
    }
  }

  function startTracking(Lx: typeof import("leaflet"), map: L.Map) {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        if (!meMarkerRef.current) {
          meMarkerRef.current = Lx.marker([lat, lng], {
            icon: Lx.divIcon({
              className: "",
              html: `<div style="width:16px;height:16px;border-radius:50%;background:#2D9CFF;border:3px solid #fff;box-shadow:0 0 8px #2D9CFFcc"></div>`,
              iconSize: [16, 16], iconAnchor: [8, 8],
            }),
          }).addTo(map);
          meCircleRef.current = Lx.circle([lat, lng], { radius: accuracy, color: "#2D9CFF", weight: 1, fillOpacity: 0.08 }).addTo(map);
        } else {
          meMarkerRef.current.setLatLng([lat, lng]);
          meCircleRef.current?.setLatLng([lat, lng]).setRadius(accuracy);
        }
      },
      () => { /* non-fatal */ },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  }

  return (
    <div className="relative">
      <div
        ref={hostRef}
        dir="ltr"
        className={`${heightClass} w-full rounded-xl overflow-hidden border border-[var(--border)]`}
        style={{ zIndex: 0 }}
      />
      {mode === "draw" && (
        <div className="absolute top-2 left-2 z-[500] flex gap-1.5">
          <button
            type="button"
            className="btn btn-ghost text-xs py-1.5 px-2.5 !bg-[var(--bg-card)] shadow"
            onClick={() => { ptsRef.current = ptsRef.current.slice(0, -1); drawPolygon(); emit(); }}
          >
            ↶ تراجع
          </button>
          <button
            type="button"
            className="btn btn-ghost text-xs py-1.5 px-2.5 !bg-[var(--bg-card)] shadow"
            onClick={() => { ptsRef.current = []; drawPolygon(); emit(); }}
          >
            مسح
          </button>
        </div>
      )}
    </div>
  );
}
