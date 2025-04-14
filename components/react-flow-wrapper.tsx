"use client"

import { useState } from "react"

// Custom node components
const EquipmentNode = ({ data, onClick }) => {
  return (
    <div
      className="bg-white border-2 border-emerald-500 rounded-lg p-3 shadow-md w-[180px] cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="font-bold text-sm mb-1">{data.label}</div>
      {data.description && <div className="text-xs text-gray-500">{data.description}</div>}
      {data.hasAlternatives && (
        <div className="mt-2 bg-emerald-50 p-1 rounded text-xs text-emerald-700 flex items-center justify-center">
          Alternatives Available
        </div>
      )}
      {data.engineMode && (
        <div className="mt-1">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{data.engineMode}</span>
        </div>
      )}
    </div>
  )
}

const AlternativeNode = ({ data, onClick }) => {
  return (
    <div
      className="bg-amber-50 border-2 border-amber-400 rounded-lg p-3 shadow-md w-[200px] cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="font-bold text-sm mb-1">{data.label}</div>
      <div className="text-xs text-gray-500 mb-2">{data.description}</div>
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium">
          Current: {data.options.find((opt) => opt.value === data.selected)?.label}
        </div>
        <div className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full">
          Options: {data.options.length}
        </div>
      </div>
      {data.engineMode && (
        <div className="mt-1">
          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">{data.engineMode}</span>
        </div>
      )}
    </div>
  )
}

// Connection line component
const ConnectionLine = ({ from, to }) => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
        </marker>
      </defs>
      <path
        d={`M${from.x + from.width} ${from.y + from.height / 2} C${from.x + from.width + 50} ${from.y + from.height / 2}, ${to.x - 50} ${to.y + to.height / 2}, ${to.x} ${to.y + to.height / 2}`}
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
      />
    </svg>
  )
}

export default function ReactFlowWrapper({ parameters, projectMode, onNodeClick }) {
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  // Generate nodes based on parameters
  const nodes = [
    {
      id: "1",
      type: "equipment",
      position: { x: 50, y: 100 },
      data: {
        label: "Bioreactor",
        description: `${parameters.microbialHost} cells`,
        hasAlternatives: false,
        engineMode: projectMode,
      },
      width: 180,
      height: 100,
    },
    {
      id: "2",
      type: "alternative",
      position: { x: 300, y: 100 },
      data: {
        label: "Harvest Clarification",
        description: "Removal of cells and debris",
        category: "harvestClarification",
        selected: parameters.harvestClarification,
        options: [
          {
            value: "Centrifuge",
            label: "Centrifuge",
            capex: 500000,
            opex: 100000,
            description: "High-speed centrifugation for cell separation",
          },
          {
            value: "Depth Filtration",
            label: "Depth Filtration",
            capex: 300000,
            opex: 150000,
            description: "Multi-layer filtration for cell removal",
          },
        ],
        engineMode: projectMode,
      },
      width: 200,
      height: 120,
    },
    {
      id: "3",
      type: "alternative",
      position: { x: 550, y: 100 },
      data: {
        label: "Capture Step",
        description: "Initial product purification",
        category: "captureStep",
        selected: parameters.captureStep,
        options: [
          {
            value: "Standard Resin",
            label: "Standard Resin Column",
            capex: 500000,
            opex: 150000,
            description: "Standard size chromatography column",
          },
          {
            value: "Large Resin",
            label: "Larger Column Size",
            capex: 800000,
            opex: 120000,
            description: "Larger diameter chromatography column with higher throughput",
          },
        ],
        engineMode: projectMode,
      },
      width: 200,
      height: 120,
    },
    {
      id: "4",
      type: "equipment",
      position: { x: 800, y: 100 },
      data: {
        label: "Polishing",
        description: "Final purification",
        hasAlternatives: false,
        engineMode: projectMode,
      },
      width: 180,
      height: 100,
    },
    {
      id: "5",
      type: "alternative",
      position: { x: 550, y: 250 },
      data: {
        label: "Buffer Preparation",
        description: "Buffer storage system",
        category: "bufferPrep",
        selected: parameters.bufferPrep,
        options: [
          {
            value: "Stainless Steel Tanks",
            label: "Stainless Steel Tanks",
            capex: 400000,
            opex: 50000,
            description: "Traditional stainless steel buffer preparation tanks",
          },
          {
            value: "Single-Use Bags",
            label: "Single-Use Bags",
            capex: 200000,
            opex: 100000,
            description: "Disposable buffer preparation bags with lower capital cost",
          },
        ],
        engineMode: projectMode,
      },
      width: 200,
      height: 120,
    },
    {
      id: "6",
      type: "equipment",
      position: { x: 1050, y: 100 },
      data: {
        label: "Final Formulation",
        description: "Product finishing",
        hasAlternatives: false,
        engineMode: projectMode,
      },
      width: 180,
      height: 100,
    },
  ]

  // Define connections between nodes
  const connections = [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "5", to: "3" },
    { from: "4", to: "6" },
  ]

  const handleNodeClick = (nodeId) => {
    setSelectedNodeId(nodeId)
    const node = nodes.find((n) => n.id === nodeId)
    if (node) {
      onNodeClick(node)
    }
  }

  // Calculate the total width and height needed for the diagram
  const diagramWidth = Math.max(...nodes.map((node) => node.position.x + node.width)) + 50
  const diagramHeight = Math.max(...nodes.map((node) => node.position.y + node.height)) + 50

  return (
    <div className="relative w-full h-full bg-gray-50 overflow-auto">
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${diagramWidth}px`,
          height: `${diagramHeight}px`,
          minWidth: "1200px",
          minHeight: "400px",
        }}
      >
        {/* Render connections */}
        {connections.map((conn) => {
          const fromNode = nodes.find((n) => n.id === conn.from)
          const toNode = nodes.find((n) => n.id === conn.to)

          if (fromNode && toNode) {
            return (
              <ConnectionLine
                key={`${conn.from}-${conn.to}`}
                from={{
                  x: fromNode.position.x,
                  y: fromNode.position.y,
                  width: fromNode.width,
                  height: fromNode.height,
                }}
                to={{
                  x: toNode.position.x,
                  y: toNode.position.y,
                  width: toNode.width,
                  height: toNode.height,
                }}
              />
            )
          }
          return null
        })}

        {/* Render nodes */}
        {nodes.map((node) => {
          const style = {
            position: "absolute",
            left: `${node.position.x}px`,
            top: `${node.position.y}px`,
          }

          return (
            <div key={node.id} style={style}>
              {node.type === "equipment" ? (
                <EquipmentNode data={node.data} onClick={() => handleNodeClick(node.id)} />
              ) : (
                <AlternativeNode data={node.data} onClick={() => handleNodeClick(node.id)} />
              )}
            </div>
          )
        })}
      </div>

      {/* Controls panel */}
      <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-md text-sm z-10">
        <div className="font-semibold">Process Flow Diagram</div>
        <div className="text-xs text-muted-foreground">{projectMode} Mode | Click on equipment for details</div>
      </div>
    </div>
  )
}
