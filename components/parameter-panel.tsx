"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { HelpCircle, RefreshCw } from "lucide-react"

export default function ParameterPanel({ parameters, onParameterChange }) {
  const [localParameters, setLocalParameters] = useState(parameters)
  const [isEditing, setIsEditing] = useState(false)

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setLocalParameters({
      ...localParameters,
      [name]: type === "number" ? Number.parseFloat(value) : value,
    })
  }

  const handleSelectChange = (name, value) => {
    setLocalParameters({
      ...localParameters,
      [name]: value,
    })
  }

  const handleSwitchChange = (name, checked) => {
    setLocalParameters({
      ...localParameters,
      [name]: checked,
    })
  }

  const handleApplyChanges = () => {
    // Apply all changes at once
    Object.entries(localParameters).forEach(([key, value]) => {
      if (parameters[key] !== value) {
        onParameterChange(key, value)
      }
    })
    setIsEditing(false)
  }

  const handleCancelChanges = () => {
    setLocalParameters(parameters)
    setIsEditing(false)
  }

  const renderTooltip = (content) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-muted-foreground ml-1" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Process Parameters</h2>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Parameters</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelChanges}>
              Cancel
            </Button>
            <Button onClick={handleApplyChanges}>Apply Changes</Button>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Adjust parameters to see their impact on the process design and economics.
        {isEditing && (
          <div className="mt-2 flex items-center text-amber-600">
            <RefreshCw className="h-4 w-4 mr-1" />
            Changes will recalculate the process design and costs when applied.
          </div>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["product-specs"]}>
        <AccordionItem value="product-specs">
          <AccordionTrigger>Product Specifications</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="productType">Product Type</Label>
                  {renderTooltip("The type of biologic product being produced.")}
                </div>
                <Select
                  value={localParameters.productType}
                  onValueChange={(value) => handleSelectChange("productType", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="productType">
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monoclonal Antibody">Monoclonal Antibody</SelectItem>
                    <SelectItem value="Vaccine">Vaccine</SelectItem>
                    <SelectItem value="Enzyme">Enzyme</SelectItem>
                    <SelectItem value="Hormone">Hormone</SelectItem>
                    <SelectItem value="Growth Factor">Growth Factor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="marketValue">Market Value ($/g)</Label>
                  {renderTooltip("The estimated market value of the product per gram.")}
                </div>
                <Input
                  id="marketValue"
                  name="marketValue"
                  type="number"
                  value={localParameters.marketValue}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="titer">Titer (g/L)</Label>
                  {renderTooltip("The concentration of the product in the fermentation broth.")}
                </div>
                <Input
                  id="titer"
                  name="titer"
                  type="number"
                  step="0.1"
                  value={localParameters.titer}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="requiredPurity">Required Purity (%)</Label>
                  {renderTooltip("The minimum purity level required for the final product.")}
                </div>
                <Input
                  id="requiredPurity"
                  name="requiredPurity"
                  type="number"
                  step="0.1"
                  max="100"
                  value={localParameters.requiredPurity}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="productAccumulation">Product Accumulation</Label>
                  {renderTooltip(
                    "Whether the product accumulates inside the cell (intracellular) or is secreted (extracellular).",
                  )}
                </div>
                <Select
                  value={localParameters.productAccumulation}
                  onValueChange={(value) => handleSelectChange("productAccumulation", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="productAccumulation">
                    <SelectValue placeholder="Select accumulation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intracellular">Intracellular</SelectItem>
                    <SelectItem value="Extracellular">Extracellular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="crystallizable">Crystallizable</Label>
                  {renderTooltip("Whether the product can form crystals.")}
                </div>
                <div className="flex items-center h-10">
                  <Switch
                    id="crystallizable"
                    checked={localParameters.crystallizable}
                    onCheckedChange={(checked) => handleSwitchChange("crystallizable", checked)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="microbe-properties">
          <AccordionTrigger>Microbe Properties</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="microbialHost">Microbial Host</Label>
                  {renderTooltip("The organism used to produce the product.")}
                </div>
                <Select
                  value={localParameters.microbialHost}
                  onValueChange={(value) => handleSelectChange("microbialHost", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="microbialHost">
                    <SelectValue placeholder="Select microbial host" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHO">CHO (Chinese Hamster Ovary)</SelectItem>
                    <SelectItem value="E. coli">E. coli</SelectItem>
                    <SelectItem value="Yeast">Yeast</SelectItem>
                    <SelectItem value="Insect Cells">Insect Cells</SelectItem>
                    <SelectItem value="HEK293">HEK293</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="cellDiameter">Cell Diameter (μm)</Label>
                  {renderTooltip("The average diameter of the cells in micrometers.")}
                </div>
                <Input
                  id="cellDiameter"
                  name="cellDiameter"
                  type="number"
                  step="0.1"
                  value={localParameters.cellDiameter}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="process-parameters">
          <AccordionTrigger>Process Parameters</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="facilityWorkingTime">Facility Working Time (hr/yr)</Label>
                  {renderTooltip("The number of hours the facility operates per year.")}
                </div>
                <Input
                  id="facilityWorkingTime"
                  name="facilityWorkingTime"
                  type="number"
                  value={localParameters.facilityWorkingTime}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="flowRateFromFermentation">Flow Rate (L/hr)</Label>
                  {renderTooltip("The volumetric flow rate of the product stream from the fermentation step.")}
                </div>
                <Input
                  id="flowRateFromFermentation"
                  name="flowRateFromFermentation"
                  type="number"
                  value={localParameters.flowRateFromFermentation}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="electricityPrice">Electricity Price ($/kWh)</Label>
                  {renderTooltip("The cost of electricity per kilowatt-hour.")}
                </div>
                <Input
                  id="electricityPrice"
                  name="electricityPrice"
                  type="number"
                  step="0.01"
                  value={localParameters.electricityPrice}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="onsiteStorageTime">Onsite Storage Time (days)</Label>
                  {renderTooltip("The number of days the product is stored onsite.")}
                </div>
                <Input
                  id="onsiteStorageTime"
                  name="onsiteStorageTime"
                  type="number"
                  value={localParameters.onsiteStorageTime}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="productConcentrationMethod">Concentration Method</Label>
                  {renderTooltip("The method used to concentrate the product.")}
                </div>
                <Select
                  value={localParameters.productConcentrationMethod}
                  onValueChange={(value) => handleSelectChange("productConcentrationMethod", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="productConcentrationMethod">
                    <SelectValue placeholder="Select concentration method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chromatography">Chromatography</SelectItem>
                    <SelectItem value="Distillation">Distillation</SelectItem>
                    <SelectItem value="Ultrafiltration">Ultrafiltration</SelectItem>
                    <SelectItem value="Precipitation">Precipitation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="selected-alternatives">
          <AccordionTrigger>Selected Alternatives</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="harvestClarification">Harvest Clarification</Label>
                  {renderTooltip("The method used to remove cells and debris from the fermentation broth.")}
                </div>
                <Select
                  value={localParameters.harvestClarification}
                  onValueChange={(value) => handleSelectChange("harvestClarification", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="harvestClarification">
                    <SelectValue placeholder="Select clarification method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Centrifuge">Centrifuge</SelectItem>
                    <SelectItem value="Depth Filtration">Depth Filtration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="captureStep">Capture Step</Label>
                  {renderTooltip("The initial purification step for the product.")}
                </div>
                <Select
                  value={localParameters.captureStep}
                  onValueChange={(value) => handleSelectChange("captureStep", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="captureStep">
                    <SelectValue placeholder="Select capture step" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Standard Resin">Standard Resin Column</SelectItem>
                    <SelectItem value="Large Resin">Larger Column Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="bufferPrep">Buffer Preparation</Label>
                  {renderTooltip("The system used to prepare and store buffers.")}
                </div>
                <Select
                  value={localParameters.bufferPrep}
                  onValueChange={(value) => handleSelectChange("bufferPrep", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="bufferPrep">
                    <SelectValue placeholder="Select buffer prep" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stainless Steel Tanks">Stainless Steel Tanks</SelectItem>
                    <SelectItem value="Single-Use Bags">Single-Use Bags</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
