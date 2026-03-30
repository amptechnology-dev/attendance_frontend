import { Label, Select } from "flowbite-react";

export function LimitDropDown() {
  return (
    <div>
      <div className="mb-2 block">
        <Label htmlFor="limit" value="Limit Results" />
      </div>
      <Select id="limit" name="limit" defaultValue="0">
        <option value="0">0 (All)</option>
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="500">500</option>
      </Select>
    </div>
  );
}
