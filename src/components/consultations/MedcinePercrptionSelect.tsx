import { AdminApi } from "@/api/axios";
import { useState, useEffect } from "react";
// import { API } from "aws-amplify";
import { Medicine } from "@/types";
import MultiSelect from "../ui/multiple-select";

const MedicinePrescription = ({
  onselect,
}: {
  onselect: (medicines: string[]) => void;
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  // const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);
  //   const [prescription, setPrescription] = useState([]);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const { data } = await AdminApi.post<{ data: Medicine[] }>(
          `/medicines-stock/departments/`,
          { departments }
        );
        setMedicines(data?.data || []);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        setMedicines([]);
      }
    };
    fetchMedicines();
  }, [departments]);

  const handleMedicinSearch = async (searchTerm: string) => {
    const data = await AdminApi.post(
      `/medicines-stock/departments/${searchTerm || ""}`,
      { departments }
    );
    console.log(data);

    return data.data.map((medicine: Medicine) => medicine.name);
  };

  //   const addToPrescription = (medicine: any) => {
  //     setPrescription([
  //       ...prescription,
  //       {
  //         medicineName: medicine.name,
  //         dose: "",
  //         instructions: "",
  //         price: medicine.price,
  //       },
  //     ]);
  //   };

  //   const updatePrescription = (index, field, value) => {
  //     const updated = [...prescription];
  //     updated[index][field] = value;
  //     setPrescription(updated);
  //   };

  //   const calculateTotalCost = () => {
  //     return prescription.reduce((total, item) => total + item.price, 0);
  //   };

  //   const submitPrescription = async () => {
  //     try {
  //       await API.put("api", `/consultations/${consultationId}`, {
  //         body: {
  //           prescription: {
  //             medicine: {
  //               list: prescription,
  //               totalCost: calculateTotalCost(),
  //             },
  //             instructions: "",
  //             endDate: new Date().toISOString(),
  //           },
  //         },
  //       });

  //       // Update stock (using quantity from dose if needed)
  //       await API.post("api", "/medicines/update-stock", {
  //         body: prescription.map((med) => ({
  //           _id: med._id,
  //           quantity: parseInt(med.dose.match(/\d+/)?.[0] || 1),
  //         })),
  //       });

  //       alert("Prescription updated successfully!");
  //     } catch (error) {
  //       console.error("Error updating prescription:", error);
  //     }
  //   };

  return (
    <div className="prescription-container">
      <div className="filters flex gap-4">
        <MultiSelect
          options={[
            "Skin & Hair",
            "Infertility and PCOD",
            "Kidney and Gallbladder Stone",
            "Arthritis and Pain Management",
            "Life style disorder",
            "Glaucoma",
            "Immunity booster dose",
          ]}
          onChange={(e: string[]) => {
            setDepartments(e);
          }}
          placeholder="Select Department"
        />
        <MultiSelect
          options={medicines?.map((e) => e.name) || []}
          onChange={onselect}
          // onChange={setSelectedMedicines}
          searchFallback={handleMedicinSearch}
          placeholder="Select Medicine"
        />
      </div>

      {/* <div className="medicine-list">
        {medicines?.map((medicine) => (
          <div key={medicine.name} className="medicine-item">
            <h4>{medicine.name}</h4>
            <p>
              Price: ₹{medicine.price} | Stock: {medicine.stock} {medicine.unit}
            </p>
            <button
              //   onClick={() => addToPrescription(medicine)}
              disabled={medicine.stock === 0}
            >
              {medicine.stock === 0 ? "Out of Stock" : "Prescribe"}
            </button>
          </div>
        ))}
      </div> */}

      {/* {prescription.length > 0 && (
        <div className="prescription-review">
          <h3>Current Prescription (Total: ₹{calculateTotalCost()})</h3>
          {prescription.map((item, index) => (
            <div key={index} className="prescription-item">
              <h4>{item.medicineName}</h4>
              <input
                type="text"
                placeholder="Dose (e.g., 2 tablets daily)"
                value={item.dose}
                onChange={(e) =>
                  updatePrescription(index, "dose", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Special instructions"
                value={item.instructions}
                onChange={(e) =>
                  updatePrescription(index, "instructions", e.target.value)
                }
              />
            </div>
          ))}
          <button
          //    onClick={submitPrescription}
          >
            Save Prescription
          </button>
        </div>
      )} */}
    </div>
  );
};

export default MedicinePrescription;
