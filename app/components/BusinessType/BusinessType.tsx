import { useSubmit } from "react-router";
import type { SelectData } from "~/types/types";

type Props = {
  selectData: SelectData[];
  selectedType: string;
};

const BusinessType = ({ selectData, selectedType }: Props) => {
  const submit = useSubmit();

  return (
    <select
      id="businessType"
      name="businessType"
      onChange={(e) => {
        submit(e.currentTarget.form);
      }}
      value={selectedType}
    >
      <option value="all">All</option>
      {selectData.map((facet) => (
        <option key={facet.name} value={facet.name.toLowerCase()}>
          {facet.name} - ({facet.count})
        </option>
      ))}
    </select>
  );
};

export default BusinessType;
