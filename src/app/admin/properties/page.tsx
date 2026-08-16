import { prisma } from "@/lib/prisma";
import FloorBlueprint from "@/components/admin/FloorBlueprint";

export const dynamic = 'force-dynamic';

export default async function PropertiesPage() {
  const dbProperty = await prisma.property.findFirst({
    include: {
      floors: {
        include: {
          facilities: true,
          rooms: {
            include: {
              beds: {
                orderBy: { identifier: 'asc' }
              }
            },
            orderBy: { roomNumber: 'asc' }
          }
        }
      }
    }
  });

  const property = dbProperty ? {
    ...dbProperty,
    floors: dbProperty.floors.map(floor => ({
      ...floor,
      facilities: floor.facilities.map(f => f.name)
    }))
  } : null;

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
        <div className="glass-dark p-8 rounded-xl text-center">
          <h2 className="text-2xl font-bold text-amber-500 mb-2">No Property Found</h2>
          <p className="text-slate-400">
            Please ensure you have run <code className="text-emerald-400 bg-slate-900 px-2 py-1 rounded">npx prisma db seed</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] p-6 lg:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-100 tracking-tight">{property.name}</h1>
          <p className="text-slate-400 mt-2 text-sm">{property.address}</p>
        </div>

        <FloorBlueprint property={property} />
      </div>
    </div>
  );
}