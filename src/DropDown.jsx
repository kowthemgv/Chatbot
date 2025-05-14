import React, { useEffect, useState } from "react";
import Data from "./data.json";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const DropdownComponent = () => {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    setOptions(Data);
  }, []);

  const handleChange = (e) => {
    setSelected(e.target.value);
    console.log("Selected option ID:", e.target.value);
  };

  return (
    <div className="relative ml-4 w-60">
      <select
        value={selected}
        onChange={handleChange}
        className="appearance-none w-full px-4 py-2 pr-10 border border-gray-300 rounded-md shadow-sm text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-600">
        <ArrowDropDownIcon fontSize="small" />
      </div>
    </div>
  );
};

export default DropdownComponent;
