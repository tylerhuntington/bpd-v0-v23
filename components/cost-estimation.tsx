"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, FileText, PieChart, AlertCircle } from "lucide-react"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import { Bar, Pie } from "react-chartjs-2"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function CostEstimation({
  parameters,
  projectMode = "Simplified",
  resultSource = "fast-estimate",
  scenarioName = "Base Case",
}) {
  // Add loading state
  const [isLoading, setIsLoading] = useState(true)

  // Add useEffect to simulate data loading
  useEffect(() => {
    // Simulate loading economic data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [parameters])

  // Calculate CAPEX based on parameters and selected alternatives
  const calculateCapex = () => {
    let baseCapex = 10000000 // Base CAPEX for a bioprocess facility

    // Adjust based on product type
    if (parameters.productType === "Monoclonal Antibody") {
      baseCapex *= 1.2
    } else if (parameters.productType === "Vaccine") {
      baseCapex *= 1.5
    }

    // Adjust based on flow rate
    baseCapex *= (parameters.flowRateFromFermentation / 1000) * 0.8

    // Adjust based on selected alternatives
    if (parameters.harvestClarification === "Centrifuge") {
      baseCapex += 500000
    } else {
      baseCapex += 300000 // Depth Filtration
    }

    if (parameters.captureStep === "Large Resin") {
      baseCapex += 800000
    } else {
      baseCapex += 500000 // Standard Resin
    }

    if (parameters.bufferPrep === "Stainless Steel Tanks") {
      baseCapex += 400000
    } else {
      baseCapex += 200000 // Single-Use Bags
    }

    return baseCapex
  }

  // Calculate OPEX based on parameters and selected alternatives
  const calculateOpex = () => {
    let baseOpex = 2000000 // Base annual OPEX

    // Adjust based on facility working time
    baseOpex *= (parameters.facilityWorkingTime / 8000) * 0.9

    // Adjust based on electricity price
    baseOpex += parameters.electricityPrice * 1000000

    // Adjust based on selected alternatives
    if (parameters.harvestClarification === "Centrifuge") {
      baseOpex += 100000
    } else {
      baseOpex += 150000 // Depth Filtration has higher consumables cost
    }

    if (parameters.captureStep === "Large Resin") {
      baseOpex += 250000
    } else {
      baseOpex += 150000 // Standard Resin
    }

    if (parameters.bufferPrep === "Stainless Steel Tanks") {
      baseOpex += 50000
    } else {
      baseOpex += 100000 // Single-Use Bags have higher consumables cost
    }

    return baseOpex
  }

  // Calculate Minimum Selling Price (MSP) - Only available in Advanced mode
  const calculateMsp = (capex, opex) => {
    if (projectMode !== "Advanced") return null

    // Simple MSP calculation
    const annualProduction =
      (parameters.titer * parameters.flowRateFromFermentation * parameters.facilityWorkingTime) / 1000 // kg/year
    const annualCapexCost = capex / 10 // Assuming 10-year depreciation
    const totalAnnualCost = annualCapexCost + opex

    return totalAnnualCost / annualProduction // $/kg
  }

  const capex = calculateCapex()
  const opex = calculateOpex()
  const msp = calculateMsp(capex, opex)

  // CAPEX breakdown data
  const capexData = {
    labels: ["Equipment", "Installation", "Piping", "Instrumentation", "Electrical", "Buildings", "Engineering"],
    datasets: [
      {
        label: "CAPEX Breakdown",
        data: [capex * 0.35, capex * 0.2, capex * 0.1, capex * 0.07, capex * 0.05, capex * 0.15, capex * 0.08],
        backgroundColor: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5", "#f0fdfa"],
      },
    ],
  }

  // OPEX breakdown data - Different for Simplified vs Advanced
  const opexData = {
    labels:
      projectMode === "Simplified"
        ? ["Electricity", "Consumables/Materials", "Water/Utilities"]
        : ["Raw Materials", "Labor", "Utilities", "Maintenance", "Quality Control", "Waste Treatment", "Overhead"],
    datasets: [
      {
        label: "OPEX Breakdown",
        data:
          projectMode === "Simplified"
            ? [opex * 0.4, opex * 0.4, opex * 0.2]
            : [opex * 0.3, opex * 0.25, opex * 0.15, opex * 0.1, opex * 0.08, opex * 0.05, opex * 0.07],
        backgroundColor: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5", "#ecfdf5", "#f0fdfa"],
      },
    ],
  }

  // Equipment cost comparison data
  const equipmentData = {
    labels: ["Bioreactor", "Harvest Clarification", "Capture Step", "Polishing", "Buffer Prep", "Final Formulation"],
    datasets: [
      {
        label: "Equipment Cost",
        data: [
          capex * 0.15,
          parameters.harvestClarification === "Centrifuge" ? capex * 0.08 : capex * 0.05,
          parameters.captureStep === "Large Resin" ? capex * 0.12 : capex * 0.08,
          capex * 0.07,
          parameters.bufferPrep === "Stainless Steel Tanks" ? capex * 0.06 : capex * 0.03,
          capex * 0.04,
        ],
        backgroundColor: "#10b981",
      },
    ],
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Techno-economic Analysis</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <FileText className="h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {resultSource === "fast-estimate" && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fast Estimate Results</AlertTitle>
          <AlertDescription>
            These results are based on fast algebraic calculations. For more accurate results, run a full simulation.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">CAPEX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(capex)}</div>
            <p className="text-sm text-muted-foreground mt-1">Total capital expenditure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{projectMode === "Simplified" ? "Partial OPEX" : "Annual OPEX"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(opex)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {projectMode === "Simplified" ? "Electricity, consumables, and utilities" : "Annual operating expenses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">MSP</CardTitle>
          </CardHeader>
          <CardContent>
            {projectMode === "Advanced" ? (
              <>
                <div className="text-3xl font-bold text-emerald-600">{formatCurrency(msp)}/kg</div>
                <p className="text-sm text-muted-foreground mt-1">Minimum selling price</p>
              </>
            ) : (
              <>
                <div className="text-xl font-medium text-muted-foreground">Not Available</div>
                <p className="text-sm text-muted-foreground mt-1">MSP calculation requires Advanced mode</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="capex" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="capex">CAPEX Breakdown</TabsTrigger>
          <TabsTrigger value="opex">
            {projectMode === "Simplified" ? "Partial OPEX Breakdown" : "OPEX Breakdown"}
          </TabsTrigger>
          <TabsTrigger value="equipment">Equipment Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="capex" className="mt-6">
          <Card>
            <CardContent className="p-6 capex-chart-container">
              <div className="h-[400px] flex items-center justify-center">
                <Pie
                  data={capexData}
                  options={{
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          boxWidth: 15,
                          padding: 15,
                        },
                      },
                      title: {
                        display: true,
                        text: `CAPEX Breakdown - ${scenarioName}`,
                        font: {
                          size: 14,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opex" className="mt-6">
          <Card>
            <CardContent className="p-6 opex-chart-container">
              {projectMode === "Simplified" && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <p>In Simplified mode, only partial OPEX categories are calculated:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Electricity</li>
                    <li>Consumables/Materials</li>
                    <li>Water/Utilities</li>
                  </ul>
                </div>
              )}
              <div className="h-[400px] flex items-center justify-center">
                <Pie
                  data={opexData}
                  options={{
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                      legend: {
                        position: "right",
                        labels: {
                          boxWidth: 15,
                          padding: 15,
                        },
                      },
                      title: {
                        display: true,
                        text: `${projectMode === "Simplified" ? "Partial OPEX" : "OPEX"} Breakdown - ${scenarioName}`,
                        font: {
                          size: 14,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <Card>
            <CardContent className="p-6 equipment-chart-container">
              <div className="h-[400px]">
                <Bar
                  data={equipmentData}
                  options={{
                    maintainAspectRatio: false,
                    animation: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: "Cost ($)",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: true,
                        text: `Equipment Cost Breakdown - ${scenarioName}`,
                        font: {
                          size: 14,
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <PieChart className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold">Techno-economic Analysis Summary</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Based on your process parameters and selected alternatives, the estimated capital expenditure is{" "}
          {formatCurrency(capex)} with {projectMode === "Simplified" ? "partial" : "annual"} operating expenses of{" "}
          {formatCurrency(opex)}.
          {projectMode === "Advanced"
            ? ` The calculated minimum selling price is ${formatCurrency(msp)}/kg, which is ${parameters.marketValue > msp ? "below" : "above"} the current market value of ${formatCurrency(parameters.marketValue)}/g.`
            : " For a complete MSP calculation, switch to Advanced mode."}
        </p>
        <div className="mt-4 text-sm">
          <div className="font-semibold">Key Observations:</div>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>
              {parameters.harvestClarification === "Centrifuge"
                ? "Using centrifugation for harvest clarification increases CAPEX but reduces OPEX compared to depth filtration."
                : "Using depth filtration for harvest clarification reduces CAPEX but increases OPEX due to consumables cost."}
            </li>
            <li>
              {parameters.captureStep === "Large Resin"
                ? "The larger resin column size increases initial investment but may provide better throughput."
                : "The standard resin column size provides a good balance between cost and performance."}
            </li>
            <li>
              {parameters.bufferPrep === "Stainless Steel Tanks"
                ? "Stainless steel tanks for buffer preparation have higher CAPEX but lower OPEX over time."
                : "Single-use bags for buffer preparation reduce CAPEX but increase ongoing consumables cost."}
            </li>
          </ul>
        </div>
        <div className="mt-4 text-sm">
          <div className="font-semibold">Results Source:</div>
          <p className="text-muted-foreground mt-1">
            {resultSource === "fast-estimate"
              ? "These results are based on fast algebraic calculations. For more accurate results, run a full simulation."
              : "These results are based on a full simulation using the appropriate engine for your project mode."}
          </p>
        </div>
      </div>
    </div>
  )
}
