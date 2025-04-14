"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar } from "react-chartjs-2"

export default function ScenarioComparison({ scenarios, projectMode, calculateEconomicValues, formatCurrency }) {
  const [comparisonView, setComparisonView] = useState("economics")

  // Calculate economic values for each scenario
  const economicResults = scenarios.map((scenario) => {
    const { capex, opex, msp } = calculateEconomicValues(scenario.parameters)
    return {
      id: scenario.id,
      name: scenario.name,
      capex,
      opex,
      msp: projectMode === "Advanced" ? msp : "Not Available",
    }
  })

  // Prepare data for charts
  const capexData = {
    labels: scenarios.map((s) => s.name),
    datasets: [
      {
        label: "CAPEX",
        data: economicResults.map((r) => r.capex),
        backgroundColor: "#10b981",
      },
    ],
  }

  const opexData = {
    labels: scenarios.map((s) => s.name),
    datasets: [
      {
        label: projectMode === "Simplified" ? "Partial OPEX" : "Annual OPEX",
        data: economicResults.map((r) => r.opex),
        backgroundColor: "#3b82f6",
      },
    ],
  }

  const mspData = {
    labels: scenarios.map((s) => s.name),
    datasets: [
      {
        label: "Minimum Selling Price ($/kg)",
        data: economicResults.map((r) => (typeof r.msp === "number" ? r.msp : 0)),
        backgroundColor: "#f59e0b",
      },
    ],
  }

  // Find key parameter differences
  const findParameterDifferences = () => {
    if (scenarios.length < 2) return []

    const baseParams = scenarios[0].parameters
    const differences = []

    // Compare each scenario to the first one
    for (let i = 1; i < scenarios.length; i++) {
      const currentParams = scenarios[i].parameters

      // Check each parameter for differences
      Object.keys(baseParams).forEach((key) => {
        if (baseParams[key] !== currentParams[key]) {
          // Check if this difference is already recorded
          const existingDiff = differences.find((d) => d.parameter === key)

          if (existingDiff) {
            // Add this scenario's value to the existing difference
            existingDiff.values[scenarios[i].id] = currentParams[key]
          } else {
            // Create a new difference entry
            const diffEntry = {
              parameter: key,
              values: { [scenarios[0].id]: baseParams[key] },
            }
            diffEntry.values[scenarios[i].id] = currentParams[key]
            differences.push(diffEntry)
          }
        }
      })
    }

    return differences
  }

  const parameterDifferences = findParameterDifferences()

  // Format parameter name for display
  const formatParameterName = (name) => {
    // Convert camelCase to Title Case with spaces
    return name.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  // Format parameter value for display
  const formatParameterValue = (name, value) => {
    // Add units based on parameter name
    switch (name) {
      case "titer":
        return `${value} g/L`
      case "marketValue":
        return `$${value}/g`
      case "density":
        return `${value} g/cm³`
      case "molecularWeight":
        return `${value} kDa`
      case "requiredPurity":
        return `${value}%`
      case "cellDiameter":
        return `${value} μm`
      case "facilityWorkingTime":
        return `${value} hr/yr`
      case "flowRateFromFermentation":
        return `${value} L/hr`
      case "electricityPrice":
        return `$${value}/kWh`
      case "onsiteStorageTime":
        return `${value} days`
      case "plantLifespan":
        return `${value} years`
      case "discountRate":
      case "incomeTaxRate":
        return `${value}%`
      case "crystallizable":
        return value ? "Yes" : "No"
      default:
        return value.toString()
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={comparisonView} onValueChange={setComparisonView} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="economics">Economic Comparison</TabsTrigger>
          <TabsTrigger value="parameters">Parameter Differences</TabsTrigger>
        </TabsList>

        <TabsContent value="economics" className="mt-6">
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((scenario) => {
                const result = economicResults.find((r) => r.id === scenario.id)
                return (
                  <Card key={scenario.id} className="overflow-hidden">
                    <div className="bg-emerald-50 px-4 py-2 border-b">
                      <h3 className="font-medium truncate">{scenario.name}</h3>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">CAPEX</p>
                          <p className="text-lg font-semibold">{formatCurrency(result.capex)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {projectMode === "Simplified" ? "Partial OPEX" : "Annual OPEX"}
                          </p>
                          <p className="text-lg font-semibold">{formatCurrency(result.opex)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">MSP</p>
                          <p className="text-lg font-semibold">
                            {result.msp === "Not Available" ? "Not Available" : `${formatCurrency(result.msp)}/kg`}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Charts */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">CAPEX Comparison</h3>
                  <div className="h-[300px]">
                    <Bar
                      data={capexData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: "CAPEX ($)",
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-4">OPEX Comparison</h3>
                  <div className="h-[300px]">
                    <Bar
                      data={opexData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: projectMode === "Simplified" ? "Partial OPEX ($)" : "Annual OPEX ($)",
                            },
                          },
                        },
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {projectMode === "Advanced" && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-4">MSP Comparison</h3>
                    <div className="h-[300px]">
                      <Bar
                        data={mspData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              title: {
                                display: true,
                                text: "MSP ($/kg)",
                              },
                            },
                          },
                          plugins: {
                            legend: {
                              display: false,
                            },
                          },
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Key Insights */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">Key Economic Insights</h3>
                <div className="space-y-3 text-sm">
                  {economicResults.length >= 2 && (
                    <>
                      {/* CAPEX comparison */}
                      <div>
                        <p className="font-medium">CAPEX Comparison:</p>
                        <p className="text-muted-foreground">
                          {(() => {
                            const sorted = [...economicResults].sort((a, b) => a.capex - b.capex)
                            const lowest = sorted[0]
                            const highest = sorted[sorted.length - 1]
                            const difference = (((highest.capex - lowest.capex) / lowest.capex) * 100).toFixed(1)

                            return `"${lowest.name}" has the lowest CAPEX at ${formatCurrency(lowest.capex)}, while "${highest.name}" has the highest at ${formatCurrency(highest.capex)} (${difference}% difference).`
                          })()}
                        </p>
                      </div>

                      {/* OPEX comparison */}
                      <div>
                        <p className="font-medium">
                          {projectMode === "Simplified" ? "Partial OPEX" : "OPEX"} Comparison:
                        </p>
                        <p className="text-muted-foreground">
                          {(() => {
                            const sorted = [...economicResults].sort((a, b) => a.opex - b.opex)
                            const lowest = sorted[0]
                            const highest = sorted[sorted.length - 1]
                            const difference = (((highest.opex - lowest.opex) / lowest.opex) * 100).toFixed(1)

                            return `"${lowest.name}" has the lowest ${projectMode === "Simplified" ? "partial OPEX" : "OPEX"} at ${formatCurrency(lowest.opex)}, while "${highest.name}" has the highest at ${formatCurrency(highest.opex)} (${difference}% difference).`
                          })()}
                        </p>
                      </div>

                      {/* MSP comparison for Advanced mode */}
                      {projectMode === "Advanced" && (
                        <div>
                          <p className="font-medium">MSP Comparison:</p>
                          <p className="text-muted-foreground">
                            {(() => {
                              const validResults = economicResults.filter((r) => typeof r.msp === "number")
                              if (validResults.length >= 2) {
                                const sorted = [...validResults].sort((a, b) => a.msp - b.msp)
                                const lowest = sorted[0]
                                const highest = sorted[sorted.length - 1]
                                const difference = (((highest.msp - lowest.msp) / lowest.msp) * 100).toFixed(1)

                                return `"${lowest.name}" has the lowest MSP at ${formatCurrency(lowest.msp)}/kg, while "${highest.name}" has the highest at ${formatCurrency(highest.msp)}/kg (${difference}% difference).`
                              }
                              return "MSP comparison requires at least 2 scenarios with valid MSP calculations."
                            })()}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parameters" className="mt-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Parameter Differences</h3>

              {parameterDifferences.length > 0 ? (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left p-2 border">Parameter</th>
                          {scenarios.map((scenario) => (
                            <th key={scenario.id} className="text-left p-2 border">
                              {scenario.name}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {parameterDifferences.map((diff, index) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="p-2 border font-medium">{formatParameterName(diff.parameter)}</td>
                            {scenarios.map((scenario) => (
                              <td key={scenario.id} className="p-2 border">
                                {diff.values[scenario.id] !== undefined
                                  ? formatParameterValue(diff.parameter, diff.values[scenario.id])
                                  : formatParameterValue(diff.parameter, scenario.parameters[diff.parameter])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-muted p-4 rounded-md">
                    <h4 className="font-medium mb-2">Key Parameter Differences</h4>
                    <ul className="space-y-2 text-sm">
                      {parameterDifferences.map((diff, index) => (
                        <li key={index}>
                          <span className="font-medium">{formatParameterName(diff.parameter)}:</span>{" "}
                          <span className="text-muted-foreground">
                            {scenarios.map((scenario) => (
                              <span key={scenario.id}>
                                "{scenario.name}":{" "}
                                {formatParameterValue(
                                  diff.parameter,
                                  diff.values[scenario.id] !== undefined
                                    ? diff.values[scenario.id]
                                    : scenario.parameters[diff.parameter],
                                )}
                                {scenario.id !== scenarios[scenarios.length - 1].id ? ", " : ""}
                              </span>
                            ))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No parameter differences found between the selected scenarios.</p>
                  <p className="text-sm mt-2">Try selecting scenarios with different parameters to compare.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
