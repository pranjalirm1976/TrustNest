'use client'

import { useState } from 'react'
import { 
  UploadCloud, 
  Settings2, 
  Plus, 
  X,
  Droplets,
  Maximize,
  Info
} from 'lucide-react'

type NodeType = 'room' | 'bathroom' | 'stairs' | 'lift' | 'balcony' | 'corridor' | 'common' | 'water' | 'canteen' | 'parking'

interface Node {
  id: string
  label: string
  type: NodeType
  colStart: number
  colSpan: number
  rowStart: number
  rowSpan: number
  dimensions?: string
}

const mockFloorPlan: Node[] = [
  { id: '1', label: '101', type: 'room', colStart: 1, colSpan: 3, rowStart: 1, rowSpan: 3, dimensions: '12x14 ft' },
  { id: '2', label: '102', type: 'room', colStart: 4, colSpan: 3, rowStart: 1, rowSpan: 3, dimensions: '12x14 ft' },
  { id: '3', label: 'Staircase', type: 'stairs', colStart: 7, colSpan: 2, rowStart: 1, rowSpan: 3 },
  { id: '4', label: 'Lift', type: 'lift', colStart: 9, colSpan: 1, rowStart: 1, rowSpan: 2 },
  { id: '5', label: 'Front Balcony', type: 'balcony', colStart: 10, colSpan: 3, rowStart: 1, rowSpan: 2 },
  { id: '12', label: 'Water Cooler', type: 'water', colStart: 9, colSpan: 1, rowStart: 3, rowSpan: 1 },
  { id: '6', label: 'Main Corridor', type: 'corridor', colStart: 1, colSpan: 12, rowStart: 4, rowSpan: 1 },
  { id: '7', label: '103', type: 'room', colStart: 1, colSpan: 3, rowStart: 5, rowSpan: 3, dimensions: '14x16 ft' },
  { id: '8', label: '104', type: 'room', colStart: 4, colSpan: 3, rowStart: 5, rowSpan: 3, dimensions: '12x14 ft' },
  { id: '9', label: 'Lounge / Common Area', type: 'common', colStart: 7, colSpan: 4, rowStart: 5, rowSpan: 4 },
  { id: '10', label: 'Washroom A', type: 'bathroom', colStart: 11, colSpan: 2, rowStart: 5, rowSpan: 2 },
  { id: '11', label: 'Washroom B', type: 'bathroom', colStart: 11, colSpan: 2, rowStart: 7, rowSpan: 2 },
]

const nodeStyles: Record<NodeType, string> = {
  room: 'bg-white border-slate-400 text-slate-800',
  bathroom: 'bg-sky-50 border-sky-300 text-sky-800',
  stairs: 'bg-white border-slate-400 text-slate-600 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%,transparent_50%,#f8fafc_50%,#f8fafc_75%,transparent_75%,transparent)] bg-[length:10px_10px]',
  lift: 'bg-sky-50 border-sky-400 text-sky-800 flex items-center justify-center',
  balcony: 'bg-white border-slate-400 border-dashed text-slate-500',
  corridor: 'bg-slate-100 border-slate-300 text-slate-500',
  common: 'bg-sky-50 border-sky-300 text-sky-800',
  water: 'bg-sky-100 border-sky-400 text-sky-700 text-[10px]',
  canteen: 'bg-sky-50 border-sky-300 text-sky-800',
  parking: 'bg-slate-200 border-slate-400 text-slate-600'
}

const legendItems = [
  { type: 'room', label: 'Room', style: nodeStyles.room },
  { type: 'bathroom', label: 'Facility/Washroom', style: nodeStyles.bathroom },
  { type: 'stairs', label: 'Stairs', style: nodeStyles.stairs },
  { type: 'lift', label: 'Lift', style: nodeStyles.lift },
  { type: 'balcony', label: 'Balcony', style: nodeStyles.balcony },
  { type: 'corridor', label: 'Corridor', style: nodeStyles.corridor }
]

export default function FloorsClient() {
  const [selectedProperty, setSelectedProperty] = useState('1')
  const [activeFloor, setActiveFloor] = useState('1st')
  const [hasLayout, setHasLayout] = useState(true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const floors = ['Ground', '1st', '2nd', '3rd', 'Terrace']

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-140px)] min-h-[600px] overflow-hidden">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select 
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="1">Sunrise Premium Girls PG</option>
            <option value="2">Apex Boys Hostel</option>
          </select>
          
          <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto scrollbar-hide max-w-[calc(100vw-32px)] sm:max-w-none">
            {floors.map(floor => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeFloor === floor
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setHasLayout(!hasLayout)}
            className="text-xs font-medium text-slate-500 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 transition-colors"
          >
            Toggle Empty State
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Main Canvas Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col min-w-0">
          
          {/* Canvas Toolbar */}
          <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between shrink-0 bg-slate-50 rounded-t-xl">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">{activeFloor} Floor Plan</span>
              <div className="h-4 w-px bg-slate-300"></div>
              {/* Legend */}
              <div className="hidden md:flex items-center gap-3">
                {legendItems.map(item => (
                  <div key={item.type} className="flex items-center gap-1.5">
                    <div className={`w-3 h-3 rounded-sm border ${item.style}`}></div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors shadow-sm">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Floor Layout</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setHasLayout(true)
                      alert(`Uploaded blueprint layout for ${activeFloor} Floor: ${file.name}`)
                    }
                  }}
                  className="hidden"
                />
              </label>
              <button className="text-slate-500 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50 transition-colors">
                <Maximize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Board */}
          <div className="flex-1 overflow-auto bg-slate-100 p-6 sm:p-10 relative custom-scrollbar">
            {!hasLayout ? (
              <div className="w-full h-full min-h-[400px] border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50/50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 mb-3">
                  <UploadCloud className="w-5 h-5 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">No architectural layout uploaded</h3>
                <p className="text-xs text-slate-500 mb-4 max-w-sm text-center">
                  Upload a CAD file (DXF/DWG) to automatically generate structural nodes, or build the layout manually.
                </p>
                <div className="flex gap-3">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
                    Upload CAD File
                  </button>
                  <button 
                    onClick={() => setHasLayout(true)}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    Build Manually
                  </button>
                </div>
              </div>
            ) : (
              /* The grid container must be large enough to scroll on mobile */
              <div className="min-w-[800px] w-full max-w-[1000px] mx-auto aspect-[4/3] bg-transparent border border-slate-300 relative shadow-sm">
                
                {/* Blueprint Background Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

                {/* CSS Grid for nodes */}
                <div 
                  className="absolute inset-0 grid gap-0.5 p-0.5" 
                  style={{ 
                    gridTemplateColumns: 'repeat(12, 1fr)', 
                    gridTemplateRows: 'repeat(8, 1fr)' 
                  }}
                >
                  {mockFloorPlan.map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`
                        relative border transition-all cursor-pointer flex flex-col items-center justify-center text-center p-1 overflow-hidden
                        ${nodeStyles[node.type]} 
                        ${selectedNode?.id === node.id ? 'ring-2 ring-indigo-500 ring-offset-1 z-10' : 'hover:border-indigo-400 hover:z-10'}
                      `}
                      style={{
                        gridColumn: `${node.colStart} / span ${node.colSpan}`,
                        gridRow: `${node.rowStart} / span ${node.rowSpan}`
                      }}
                    >
                      <span className={`font-bold ${node.type === 'room' ? 'text-xl tracking-tight' : 'text-xs uppercase tracking-wide'}`}>
                        {node.label}
                      </span>
                      {node.dimensions && node.type === 'room' && (
                        <span className="text-[10px] text-slate-400 mt-1">{node.dimensions}</span>
                      )}
                      
                      {node.type === 'bathroom' && <Droplets className="w-3 h-3 mt-1 opacity-50" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel (Contextual Controls / Edit Drawer) */}
        <div className="hidden lg:flex w-80 bg-white border border-slate-200 rounded-xl shadow-sm flex-col shrink-0 overflow-hidden">
          {selectedNode ? (
            <>
              <div className="h-14 border-b border-slate-100 px-4 flex items-center justify-between bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Edit Node</h3>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Identifier / Label</label>
                  <input 
                    type="text" 
                    value={selectedNode.label}
                    readOnly
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Node Type</label>
                  <select className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-indigo-500">
                    <option value="room">Room</option>
                    <option value="bathroom">Washroom</option>
                    <option value="common">Common Area</option>
                  </select>
                </div>
                {selectedNode.type === 'room' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Dimensions</label>
                    <input 
                      type="text" 
                      defaultValue={selectedNode.dimensions}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2 bg-indigo-50 text-indigo-800 p-3 rounded-lg border border-indigo-100">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium leading-relaxed">
                      Modifying the node type will affect how it is reported in occupancy stats.
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button className="flex-1 bg-white border border-slate-200 text-slate-700 text-sm font-medium py-2 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button className="flex-1 bg-indigo-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                  Save Node
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="h-14 border-b border-slate-100 px-4 flex items-center bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">Layout Controls</h3>
              </div>
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload Layout (CAD)
                </button>
                
                <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2.5 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                  <Settings2 className="w-4 h-4" />
                  Edit Grid Mode
                </button>

                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Add Elements</h4>
                  
                  <button className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-600 hover:text-indigo-600 text-sm font-medium py-3 rounded-lg transition-colors flex flex-col items-center justify-center gap-1">
                    <Plus className="w-5 h-5" />
                    Add Room / Facility
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
    </div>
  )
}
