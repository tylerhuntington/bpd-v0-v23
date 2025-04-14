"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import ReactFlowWrapper from "./react-flow-wrapper"

export default function ProcessFlowDiagram({ parameters, onAlternativeSelection, projectMode = "Simplified" }) {
  const [selectedNode, setSelectedNode] = useState(null)

  const handleNodeClick = useCallback((node) => {
    console.log("Node clicked:", node)
    setSelectedNode(node)
  }, [])

  const handleOptionSelect = (category, value) => {
    // Call the parent component's handler to update the global state
    onAlternativeSelection(category, value)
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 h-[600px] border rounded-lg overflow-hidden process-flow-container">
          <ReactFlowWrapper parameters={parameters} projectMode={projectMode} onNodeClick={handleNodeClick} />
        </div>

        {selectedNode && (
          <Card className="w-full md:w-80 h-fit sticky top-4">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2">{selectedNode.data.label}</h3>
              <p className="text-sm text-muted-foreground mb-4">{selectedNode.data.description}</p>

              {selectedNode.type === "equipment" && (
                <div className="space-y-2">
                  <div className="text-sm font-semibold">Equipment Details</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-muted-foreground">Type:</div>
                    <div>{selectedNode.data.label}</div>
                    <div className="text-muted-foreground">CAPEX Contribution:</div>
                    <div>$250,000</div>
                    <div className="text-muted-foreground">OPEX Contribution:</div>
                    <div>$75,000/year</div>
                    <div className="text-muted-foreground">Engine Mode:</div>
                    <div>{projectMode}</div>
                  </div>
                </div>
              )}

              {selectedNode.type === "alternative" && (
                <div className="space-y-4">
                  <div className="text-sm font-semibold">Equipment Options</div>

                  {/* Options Cards */}
                  <div className="space-y-3">
                    {selectedNode.data.options.map((option, index) => {
                      const isRecommended = index === 0
                      const isSelected = selectedNode.data.selected === option.value

                      // Only calculate differences for non-recommended options
                      const capexDiff = !isRecommended ? option.capex - selectedNode.data.options[0].capex : null
                      const opexDiff = !isRecommended ? option.opex - selectedNode.data.options[0].opex : null

                      return (
                        <Card
                          key={option.value}
                          className={`border-gray-200 hover:border-emerald-200 cursor-pointer transition-all ${
                            isSelected ? "border-emerald-500 shadow-md" : ""
                          } ${isRecommended && !isSelected ? "bg-emerald-50 border-emerald-200" : ""}`}
                          onClick={() => handleOptionSelect(selectedNode.data.category, option.value)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-medium">{option.label}</div>
                              {isRecommended && (
                                <div className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                                  Recommended
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">{option.description}</div>
                            <div className="grid grid-cols-1 gap-1 text-xs mt-2">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">CAPEX:</span>
                                <div className="font-semibold text-right">
                                  ${option.capex.toLocaleString()}
                                  {!isRecommended && (
                                    <span className={`ml-1 ${capexDiff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                      ({capexDiff > 0 ? "+" : ""}
                                      {capexDiff.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">OPEX:</span>
                                <div className="font-semibold text-right">
                                  ${option.opex.toLocaleString()}/year
                                  {!isRecommended && (
                                    <span className={`ml-1 ${opexDiff > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                      ({opexDiff > 0 ? "+" : ""}
                                      {opexDiff.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Current selection:{" "}
                    <span className="font-medium text-foreground">
                      {selectedNode.data.options.find((opt) => opt.value === selectedNode.data.selected)?.label}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
