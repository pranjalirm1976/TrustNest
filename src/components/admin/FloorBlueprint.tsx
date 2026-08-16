"use client";

import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for clean Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Bed = {
  id: string;
  identifier: string;
  status: string;
};

type Room = {
  id: string;
  roomNumber: string;
  capacity: number;
  beds: Bed[];
};

type Floor = {
  id: string;
  name: string;
  level: number;
  facilities: string[];
  rooms: Room[];
};

type Property = {
  id: string;
  name: string;
  floors: Floor[];
};

export default function FloorBlueprint({ property }: { property: Property }) {
  const [activeFloorId, setActiveFloorId] = useState<string>(property.floors[0]?.id || "");
  const activeFloor = property.floors.find((f) => f.id === activeFloorId);

  if (!activeFloor) return null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Floor Toggle Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-700 pb-4">
        {property.floors
          .sort((a, b) => a.level - b.level)
          .map((floor) => (
            <button
              key={floor.id}
              onClick={() => setActiveFloorId(floor.id)}
              className={cn(
                "px-6 py-2 rounded-t-lg font-semibold text-sm transition-all duration-200 border-t border-x",
                activeFloorId === floor.id
                  ? "bg-slate-800 border-emerald-600 text-emerald-400"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              {floor.name}
            </button>
          ))}
      </div>

      {/* Blueprint Legend */}
      <div className="flex gap-6 text-xs font-mono text-slate-400 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500 rounded-sm" /> VACANT
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-800 border border-slate-600 rounded-sm" /> OCCUPIED
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-500/20 border border-amber-500 rounded-sm" /> MAINTENANCE
        </div>
      </div>

      {/* Architectural CAD Grid */}
      <div className="bg-slate-900 border-2 border-emerald-900/50 p-6 sm:p-10 rounded-xl shadow-2xl relative overflow-hidden">
        
        {/* Subtle Grid Background for CAD feel */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#059669 1px, transparent 1px), linear-gradient(90deg, #059669 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
          
          {/* Render Common Facilities */}
          {activeFloor.facilities.map((facility, idx) => (
            <div key={idx} className="col-span-1 md:col-span-2 row-span-1 border border-emerald-800/30 bg-slate-800/40 p-6 flex items-center justify-center rounded flex-col gap-2">
              <span className="text-emerald-700/70 font-mono text-sm tracking-widest uppercase">{facility}</span>
            </div>
          ))}

          {/* Render Rooms */}
          {activeFloor.rooms.map((room) => (
            <div
              key={room.id}
              className="group col-span-1 aspect-square border-2 border-emerald-700/80 bg-slate-800/80 p-4 rounded-sm hover:bg-emerald-900/40 transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-emerald-400 font-bold text-xl font-mono">RM {room.roomNumber}</span>
                <span className="text-xs text-slate-500 font-mono">{room.capacity} BEDS</span>
              </div>

              {/* Bed Layout inside Room */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                {room.beds.map((bed) => (
                  <div
                    key={bed.id}
                    title={`${bed.identifier} - ${bed.status}`}
                    className={cn(
                      "h-8 rounded-sm border flex items-center justify-center text-[10px] font-mono",
                      bed.status === "VACANT" && "border-emerald-500 bg-emerald-500/10 text-emerald-500",
                      bed.status === "OCCUPIED" && "border-slate-600 bg-slate-800 text-slate-500",
                      bed.status === "MAINTENANCE" && "border-amber-500 bg-amber-500/10 text-amber-500"
                    )}
                  >
                    {bed.identifier.replace('Bed ', '')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}